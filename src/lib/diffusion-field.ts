/**
 * DiffusionField — framework-agnostic WebGL hero simulation.
 *
 * Concept: ~3000 small dark cubes in a 3D volume cycle through
 *   Phase 1 (0–4 s):  gaussian noise, faint jitter, opacity ramps in
 *   Phase 2 (4–9 s):  drift into a Lorenz-attractor cluster
 *   Phase 3 (9–12 s): cluster breathes (global sine scale)
 *   Phase 4 (12–16 s): dissolves back to noise
 *
 * Ortho camera, no orbit, no bloom, no glow. Slow, cinematic, power3.inOut.
 * Single instanced draw call. Per-instance position written each frame via
 * setMatrixAt; breath driven by a uniform scalar.
 *
 * Public API:
 *   const field = new DiffusionField(canvas, opts?);
 *   field.start();                       // begin RAF loop
 *   field.setReducedMotion(true|false);  // freeze at phase-3 mid-breath
 *   field.dispose();                     // tear down WebGL + observers
 */

import {
  BoxGeometry,
  Color,
  DynamicDrawUsage,
  InstancedBufferAttribute,
  InstancedMesh,
  Matrix4,
  OrthographicCamera,
  Quaternion,
  Scene,
  ShaderMaterial,
  Vector3,
  WebGLRenderer,
} from "three";

export const DEFAULTS = {
  INSTANCE_COUNT_DESKTOP: 3000,
  INSTANCE_COUNT_MOBILE: 800,
  MOBILE_BREAKPOINT_PX: 768,
  CUBE_SIZE: 0.018,
  VOLUME_RADIUS: 1.0,
  /** Lorenz integration steps between consecutive sample points (more = finer trajectory). */
  ATTRACTOR_STRIDE: 6,
  /** Lorenz RK4 time-step. */
  ATTRACTOR_DT: 0.006,
  /** Warm-up steps before sampling — pushes the trajectory onto the manifold. */
  ATTRACTOR_WARMUP: 2000,
  /** [phase1, phase2, phase3, phase4] in seconds — must sum to LOOP_DURATION. */
  PHASE_DURATIONS: [4, 5, 3, 4] as [number, number, number, number],
  /** Phase-1 → phase-2 opacity plateau. */
  OPACITY_RANGE: [0.55, 0.7] as [number, number],
  /** Fraction of instances flagged as accent. */
  ACCENT_RATIO: 0.1,
  BG_COLOR: "#F5EFE6",
  BASE_COLOR: "#1F1F1F",
  ACCENT_COLOR: "#C84A3A",
  /** Phase-1 jitter amplitude in world units. */
  JITTER_AMPLITUDE: 0.02,
  /** Phase-3 breath amplitude (fraction of unit scale). */
  BREATH_AMPLITUDE: 0.04,
  /** Ortho frustum half-extent. */
  ORTHO_HALF_EXTENT: 1.35,
  /** Cluster offset (kept 0 — the canvas itself is the right-hand slot). */
  CLUSTER_OFFSET_X: 0,
};

export type DiffusionFieldOptions = typeof DEFAULTS;

const LOOP_DURATION = DEFAULTS.PHASE_DURATIONS.reduce((a, b) => a + b, 0);
if (LOOP_DURATION !== 16) throw new Error("PHASE_DURATIONS must sum to 16 s");

// ---------------------------------------------------------------------------
// Deterministic RNG + samplers
// ---------------------------------------------------------------------------

function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gaussian(rng: () => number) {
  let u = 0;
  let v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

// ---------------------------------------------------------------------------
// Lorenz attractor — sample N points along a single warm-started trajectory.
// dx/dt = σ(y − x), dy/dt = x(ρ − z) − y, dz/dt = xy − βz
// Standard butterfly: σ=10, ρ=28, β=8/3. RK4 integrator for stability.
// ---------------------------------------------------------------------------

const LORENZ_SIGMA = 10;
const LORENZ_RHO = 28;
const LORENZ_BETA = 8 / 3;

function lorenzDeriv(x: number, y: number, z: number, out: [number, number, number]) {
  out[0] = LORENZ_SIGMA * (y - x);
  out[1] = x * (LORENZ_RHO - z) - y;
  out[2] = x * y - LORENZ_BETA * z;
}

function lorenzStep(state: [number, number, number], dt: number) {
  const k1: [number, number, number] = [0, 0, 0];
  const k2: [number, number, number] = [0, 0, 0];
  const k3: [number, number, number] = [0, 0, 0];
  const k4: [number, number, number] = [0, 0, 0];
  const [x, y, z] = state;

  lorenzDeriv(x, y, z, k1);
  lorenzDeriv(x + (dt / 2) * k1[0], y + (dt / 2) * k1[1], z + (dt / 2) * k1[2], k2);
  lorenzDeriv(x + (dt / 2) * k2[0], y + (dt / 2) * k2[1], z + (dt / 2) * k2[2], k3);
  lorenzDeriv(x + dt * k3[0], y + dt * k3[1], z + dt * k3[2], k4);

  state[0] = x + (dt / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]);
  state[1] = y + (dt / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]);
  state[2] = z + (dt / 6) * (k1[2] + 2 * k2[2] + 2 * k3[2] + k4[2]);
}

/**
 * Generate `count` target positions sampled along a Lorenz trajectory,
 * normalised to fit within [-VOLUME_RADIUS, VOLUME_RADIUS]^3 and centred.
 *
 * The Lorenz attractor lives roughly in x∈[-22,22], y∈[-30,30], z∈[0,55].
 * After sampling we rescale uniformly so the wings fit the volume nicely.
 */
function sampleLorenzCluster(
  count: number,
  stride: number,
  dt: number,
  warmup: number,
  radius: number,
): Float32Array {
  const state: [number, number, number] = [0.1, 0, 0];
  for (let i = 0; i < warmup; i++) lorenzStep(state, dt);

  const out = new Float32Array(count * 3);
  let minX = Infinity;
  let minY = Infinity;
  let minZ = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let maxZ = -Infinity;

  for (let i = 0; i < count; i++) {
    for (let k = 0; k < stride; k++) lorenzStep(state, dt);
    const x = state[0];
    const y = state[1];
    const z = state[2];
    out[i * 3 + 0] = x;
    out[i * 3 + 1] = y;
    out[i * 3 + 2] = z;
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (z < minZ) minZ = z;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
    if (z > maxZ) maxZ = z;
  }

  // Centre and uniformly scale to fit the volume. Y is the wider axis for
  // Lorenz so we drive the scale from the largest extent across all axes.
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const cz = (minZ + maxZ) / 2;
  const extent = Math.max(maxX - minX, maxY - minY, maxZ - minZ);
  const s = (2 * radius * 0.95) / extent;

  for (let i = 0; i < count; i++) {
    out[i * 3 + 0] = (out[i * 3 + 0] - cx) * s;
    out[i * 3 + 1] = (out[i * 3 + 1] - cy) * s;
    out[i * 3 + 2] = (out[i * 3 + 2] - cz) * s;
  }

  // Cosmetic rotation: tilt the butterfly so the wing-axis catches the
  // ortho camera at a flattering angle instead of edge-on.
  const ang = Math.PI / 6;
  const ca = Math.cos(ang);
  const sa = Math.sin(ang);
  for (let i = 0; i < count; i++) {
    const x = out[i * 3 + 0];
    const z = out[i * 3 + 2];
    out[i * 3 + 0] = x * ca - z * sa;
    out[i * 3 + 2] = x * sa + z * ca;
  }

  return out;
}

// ---------------------------------------------------------------------------
// GLSL — vertex (instanced + breath uniform) + fragment (flat, transparent)
// ---------------------------------------------------------------------------

const VERT = /* glsl */ `
attribute float aOpacity;
attribute float aIsAccent;
varying float vOpacity;
varying float vIsAccent;
uniform float uBreathScale;

void main() {
  vec3 transformed = position * uBreathScale;
  vec4 worldPos = vec4(transformed, 1.0);
  #ifdef USE_INSTANCING
    worldPos = instanceMatrix * worldPos;
  #endif
  vec4 mvPosition = modelViewMatrix * worldPos;
  gl_Position = projectionMatrix * mvPosition;

  vOpacity  = aOpacity;
  vIsAccent = aIsAccent;
}
`;

const FRAG = /* glsl */ `
precision highp float;

uniform vec3 uBase;
uniform vec3 uAccent;
varying float vOpacity;
varying float vIsAccent;

void main() {
  vec3 col = mix(uBase, uAccent, vIsAccent);
  gl_FragColor = vec4(col, vOpacity);
}
`;

// ---------------------------------------------------------------------------
// DiffusionField
// ---------------------------------------------------------------------------

export class DiffusionField {
  private canvas: HTMLCanvasElement;
  private opts: DiffusionFieldOptions;
  private renderer!: WebGLRenderer;
  private scene!: Scene;
  private camera!: OrthographicCamera;
  private mesh!: InstancedMesh;
  private material!: ShaderMaterial;
  private resizeObs?: ResizeObserver;

  private count!: number;
  private noisePos!: Float32Array;
  private targetPos!: Float32Array;
  private jitterSeed!: Float32Array;
  private opacityAttr!: InstancedBufferAttribute;
  private accentAttr!: InstancedBufferAttribute;

  private raf = 0;
  private running = false;
  private reduced = false;
  private isMobile = false;
  /** performance.now() timestamp when the current loop started. */
  private loopStart = 0;

  private dummyMatrix = new Matrix4();
  private scratchPos = new Vector3();
  private scratchQuat = new Quaternion();
  private scratchScale = new Vector3(1, 1, 1);

  constructor(canvas: HTMLCanvasElement, opts?: Partial<DiffusionFieldOptions>) {
    this.canvas = canvas;
    this.opts = { ...DEFAULTS, ...opts };
    this.detectMobile();
    this.initRenderer();
    this.initScene();
    this.initInstances();
    this.attachResize();
  }

  private detectMobile() {
    this.isMobile = window.matchMedia(`(max-width: ${this.opts.MOBILE_BREAKPOINT_PX}px)`).matches;
    this.count = this.isMobile ? this.opts.INSTANCE_COUNT_MOBILE : this.opts.INSTANCE_COUNT_DESKTOP;
  }

  private initRenderer() {
    this.renderer = new WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
      stencil: false,
      depth: true,
    });
    this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    this.renderer.setClearColor(new Color(this.opts.BG_COLOR), 1);
    this.applyCanvasSize();
  }

  private applyCanvasSize() {
    const rect = this.canvas.getBoundingClientRect();
    const w = Math.max(1, Math.round(rect.width));
    const h = Math.max(1, Math.round(rect.height));
    this.renderer.setSize(w, h, false);
  }

  private initScene() {
    this.scene = new Scene();
    const h = this.opts.ORTHO_HALF_EXTENT;
    const aspect = this.canvas.clientWidth / Math.max(1, this.canvas.clientHeight);
    this.camera = new OrthographicCamera(-h * aspect, h * aspect, h, -h, 0.1, 50);
    this.camera.position.set(0, 0, 5);
    this.camera.lookAt(0, 0, 0);
  }

  private initInstances() {
    const N = this.count;
    const rng = makeRng(0xc0ffee);

    const geom = new BoxGeometry(this.opts.CUBE_SIZE, this.opts.CUBE_SIZE, this.opts.CUBE_SIZE);

    this.material = new ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uBreathScale: { value: 1.0 },
        uBase: { value: new Color(this.opts.BASE_COLOR) },
        uAccent: { value: new Color(this.opts.ACCENT_COLOR) },
      },
    });

    this.mesh = new InstancedMesh(geom, this.material, N);
    this.mesh.frustumCulled = false;
    this.mesh.instanceMatrix.setUsage(DynamicDrawUsage);
    this.scene.add(this.mesh);

    const opacities = new Float32Array(N);
    const accents = new Float32Array(N);
    this.noisePos = new Float32Array(N * 3);
    this.jitterSeed = new Float32Array(N);

    for (let i = 0; i < N; i++) {
      this.noisePos[i * 3 + 0] = gaussian(rng) * 0.45 * this.opts.VOLUME_RADIUS;
      this.noisePos[i * 3 + 1] = gaussian(rng) * 0.45 * this.opts.VOLUME_RADIUS;
      this.noisePos[i * 3 + 2] = gaussian(rng) * 0.45 * this.opts.VOLUME_RADIUS;
      this.jitterSeed[i] = rng();
      accents[i] = rng() < this.opts.ACCENT_RATIO ? 1 : 0;
      opacities[i] = 0;
    }

    // Lorenz cluster — mobile uses a tighter stride for the same shape at lower N.
    const stride = this.isMobile
      ? Math.max(2, Math.floor(this.opts.ATTRACTOR_STRIDE * 0.6))
      : this.opts.ATTRACTOR_STRIDE;
    this.targetPos = sampleLorenzCluster(
      N,
      stride,
      this.opts.ATTRACTOR_DT,
      this.opts.ATTRACTOR_WARMUP,
      this.opts.VOLUME_RADIUS,
    );
    if (this.opts.CLUSTER_OFFSET_X !== 0) {
      for (let i = 0; i < N; i++) this.targetPos[i * 3 + 0] += this.opts.CLUSTER_OFFSET_X;
    }

    this.opacityAttr = new InstancedBufferAttribute(opacities, 1);
    this.accentAttr = new InstancedBufferAttribute(accents, 1);
    this.opacityAttr.setUsage(DynamicDrawUsage);
    geom.setAttribute("aOpacity", this.opacityAttr);
    geom.setAttribute("aIsAccent", this.accentAttr);

    for (let i = 0; i < N; i++) {
      this.scratchPos.set(
        this.noisePos[i * 3 + 0],
        this.noisePos[i * 3 + 1],
        this.noisePos[i * 3 + 2],
      );
      this.dummyMatrix.compose(this.scratchPos, this.scratchQuat, this.scratchScale);
      this.mesh.setMatrixAt(i, this.dummyMatrix);
    }
    this.mesh.instanceMatrix.needsUpdate = true;
  }

  private updateInstances(t: number) {
    const [p1, p2, p3, p4] = this.opts.PHASE_DURATIONS;
    const t1 = p1;
    const t2 = p1 + p2;
    const t3 = p1 + p2 + p3;
    const [oMin, oMax] = this.opts.OPACITY_RANGE;
    const N = this.count;
    const ja = this.opts.JITTER_AMPLITUDE;
    const breath = this.opts.BREATH_AMPLITUDE;
    const noisePos = this.noisePos;
    const targetPos = this.targetPos;
    const seeds = this.jitterSeed;

    let breathScale = 1;
    let globalOpacity = 0;
    let blend = 0;
    let jitterT = 0;

    if (t < t1) {
      const u = clamp01(t / p1);
      globalOpacity = lerp(0, oMin, easePower3InOut(u));
      blend = 0;
      jitterT = t;
    } else if (t < t2) {
      const u = clamp01((t - t1) / p2);
      const e = easePower3InOut(u);
      globalOpacity = lerp(oMin, oMax, e);
      blend = e;
      jitterT = 0;
    } else if (t < t3) {
      const u = clamp01((t - t2) / p3);
      globalOpacity = oMax;
      blend = 1;
      breathScale = 1 + breath * Math.sin(Math.PI * u);
    } else {
      const u = clamp01((t - t3) / p4);
      const e = easePower3InOut(u);
      globalOpacity = lerp(oMax, 0, e);
      blend = 1 - e;
      jitterT = t - t3;
    }

    this.material.uniforms.uBreathScale.value = breathScale;

    const mat = this.dummyMatrix;
    const pos = this.scratchPos;
    const q = this.scratchQuat;
    const s = this.scratchScale;
    const opacityArr = this.opacityAttr.array as Float32Array;

    for (let i = 0; i < N; i++) {
      const idx = i * 3;
      const nx = noisePos[idx];
      const ny = noisePos[idx + 1];
      const nz = noisePos[idx + 2];
      const tx = targetPos[idx];
      const ty = targetPos[idx + 1];
      const tz = targetPos[idx + 2];

      let x = nx + (tx - nx) * blend;
      let y = ny + (ty - ny) * blend;
      let z = nz + (tz - nz) * blend;

      if (jitterT > 0 && !this.isMobile) {
        const seed = seeds[i] * 6.2831853;
        x += Math.sin(jitterT * 1.7 + seed) * ja;
        y += Math.sin(jitterT * 2.1 + seed * 1.3) * ja;
        z += Math.cos(jitterT * 1.3 + seed * 2.1) * ja;
      }

      pos.set(x, y, z);
      mat.compose(pos, q, s);
      this.mesh.setMatrixAt(i, mat);
      opacityArr[i] = globalOpacity;
    }

    this.mesh.instanceMatrix.needsUpdate = true;
    this.opacityAttr.needsUpdate = true;
  }

  // ----------------- lifecycle -----------------

  start() {
    if (this.running) return;
    this.running = true;
    if (this.reduced) {
      this.updateInstances(this.midBreathT());
      this.renderer.render(this.scene, this.camera);
      return;
    }
    this.loopStart = performance.now();
    const loop = () => {
      if (!this.running || this.reduced) return;
      const t = ((performance.now() - this.loopStart) / 1000) % LOOP_DURATION;
      this.updateInstances(t);
      this.renderer.render(this.scene, this.camera);
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  stop() {
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  setReducedMotion(value: boolean) {
    if (this.reduced === value) return;
    this.reduced = value;
    if (value) {
      if (this.raf) cancelAnimationFrame(this.raf);
      this.raf = 0;
      this.updateInstances(this.midBreathT());
      this.renderer.render(this.scene, this.camera);
    } else if (this.running) {
      this.loopStart = performance.now();
      const loop = () => {
        if (!this.running || this.reduced) return;
        const t = ((performance.now() - this.loopStart) / 1000) % LOOP_DURATION;
        this.updateInstances(t);
        this.renderer.render(this.scene, this.camera);
        this.raf = requestAnimationFrame(loop);
      };
      this.raf = requestAnimationFrame(loop);
    }
  }

  /** Public seek used by the fallback-PNG script. */
  renderStill(t: number) {
    this.updateInstances(t);
    this.renderer.render(this.scene, this.camera);
  }

  private midBreathT() {
    const [p1, p2, p3] = this.opts.PHASE_DURATIONS;
    return p1 + p2 + p3 * 0.5;
  }

  private attachResize() {
    this.resizeObs = new ResizeObserver(() => this.resize());
    this.resizeObs.observe(this.canvas);
  }

  resize() {
    this.applyCanvasSize();
    const aspect = this.canvas.clientWidth / Math.max(1, this.canvas.clientHeight);
    const h = this.opts.ORTHO_HALF_EXTENT;
    this.camera.left = -h * aspect;
    this.camera.right = h * aspect;
    this.camera.top = h;
    this.camera.bottom = -h;
    this.camera.updateProjectionMatrix();
    if (this.reduced) this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.stop();
    this.resizeObs?.disconnect();
    this.mesh.geometry.dispose();
    this.material.dispose();
    this.renderer.dispose();
    const ext = this.renderer.getContext().getExtension("WEBGL_lose_context");
    ext?.loseContext();
  }
}

// ---------------------------------------------------------------------------

function clamp01(x: number) {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function easePower3InOut(x: number) {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}
