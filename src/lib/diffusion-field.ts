/**
 * DiffusionField — framework-agnostic WebGL hero simulation (v2).
 *
 * Concept: ~3000 small dark cubes in a 3D volume cycle through
 *   Phase 1 (0–4 s):  gaussian noise, faint jitter, opacity ramps in
 *   Phase 2 (4–9 s):  drift into a Lorenz-attractor cluster
 *   Phase 3 (9–12 s): cluster breathes (global sine scale)
 *   Phase 4 (12–16 s): dissolves back to noise
 *
 * Visual identity:
 *   - Real BoxGeometry InstancedMesh, per-pixel Lambert face shading.
 *   - Cube sizes vary log-normally (4–14 px screen size) driven by per-instance
 *     local density at the Lorenz target — large cubes cluster on the wings.
 *   - Red accent (#C84A3A) only on the top 15 % density cubes → reads as
 *     "structure emerged from noise", not random colour speckle.
 *   - Orthographic camera tilted ~15° on X for depth read; cluster centred on
 *     its centroid and scaled to fill 70 % of canvas height.
 *   - Soft trail buffer: each frame fades existing canvas colour by 8 % then
 *     composites the new scene on top (≈ 12-frame motion-blur tail).
 *
 * Public API: unchanged.
 *   const field = new DiffusionField(canvas, opts?);
 *   field.start();
 *   field.setReducedMotion(true|false);
 *   field.renderStill(t);
 *   field.dispose();
 *   field.resize();
 */

import {
  BoxGeometry,
  Color,
  DynamicDrawUsage,
  InstancedBufferAttribute,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  OrthographicCamera,
  PlaneGeometry,
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

  /** Cube screen-size range in CSS pixels (log-normally mapped from density). */
  CUBE_PX_MIN: 4,
  CUBE_PX_MAX: 14,
  /** Neighborhood radius (normalised world units) for density estimation. */
  DENSITY_RADIUS: 0.15,
  /** Top-percentile density threshold for accent assignment. */
  ACCENT_TOP_PCT: 0.15,

  VOLUME_RADIUS: 1.0,

  /** Lorenz integration parameters. */
  ATTRACTOR_STRIDE: 6,
  ATTRACTOR_DT: 0.006,
  ATTRACTOR_WARMUP: 2000,

  /** [phase1, phase2, phase3, phase4] in seconds — must sum to LOOP_DURATION. */
  PHASE_DURATIONS: [4, 5, 3, 4] as [number, number, number, number],
  OPACITY_RANGE: [0.55, 0.7] as [number, number],

  BG_COLOR: "#F5EFE6",
  BASE_COLOR: "#1F1F1F",
  ACCENT_COLOR: "#C84A3A",

  JITTER_AMPLITUDE: 0.02,
  BREATH_AMPLITUDE: 0.04,

  /** Half-extent of the ortho frustum on the Y axis (frustum height = 2). */
  ORTHO_HALF_EXTENT_Y: 1.0,
  /** Cluster y-extent expressed as fraction of viewport y-extent. */
  COMPOSITION_FILL_Y: 0.7,
  /** Camera downward tilt around the X axis, in degrees. */
  CAMERA_TILT_DEG: 15,

  /** Per-frame fade alpha for the trail buffer (1 - alpha = previous-frame retention). */
  TRAIL_FADE_ALPHA: 0.08,

  /** Light direction in world space (will be normalised in the shader). */
  LIGHT_DIR: [0.4, 1.0, 0.6] as [number, number, number],
  AMBIENT: 0.38,
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
// dx/dt = σ(y − x), dy/dt = x(ρ − z) − y, dz/dt = xy − βz. RK4 integrator.
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
 * Generate `count` target positions sampled along a Lorenz trajectory, centred
 * on the centroid of the sampled cloud and scaled so the Y-axis extent equals
 * `targetYExtent` world units. Returned array layout: [x0,y0,z0, x1,y1,z1, …].
 */
function sampleLorenzCluster(
  count: number,
  stride: number,
  dt: number,
  warmup: number,
  targetYExtent: number,
): Float32Array {
  const state: [number, number, number] = [0.1, 0, 0];
  for (let i = 0; i < warmup; i++) lorenzStep(state, dt);

  const out = new Float32Array(count * 3);
  let sumX = 0;
  let sumY = 0;
  let sumZ = 0;
  for (let i = 0; i < count; i++) {
    for (let k = 0; k < stride; k++) lorenzStep(state, dt);
    out[i * 3 + 0] = state[0];
    out[i * 3 + 1] = state[1];
    out[i * 3 + 2] = state[2];
    sumX += state[0];
    sumY += state[1];
    sumZ += state[2];
  }

  // Recentre on centroid (mean), not bbox centre — Lorenz density is biased
  // toward the wing centres so the bbox midpoint floats off-visual.
  const cx = sumX / count;
  const cy = sumY / count;
  const cz = sumZ / count;
  let minY = Infinity;
  let maxY = -Infinity;
  for (let i = 0; i < count; i++) {
    const y = (out[i * 3 + 1] -= cy);
    out[i * 3 + 0] -= cx;
    out[i * 3 + 2] -= cz;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }

  const yExtent = maxY - minY;
  const s = targetYExtent / yExtent;
  for (let i = 0; i < count; i++) {
    out[i * 3 + 0] *= s;
    out[i * 3 + 1] *= s;
    out[i * 3 + 2] *= s;
  }
  return out;
}

/**
 * For each point, count neighbours within `radius`. O(N²) but at N=3000 this
 * is ~9 M comparisons → ~30 ms one-time cost at init; well worth the simplicity.
 * Returns density scores in [0, 1].
 */
function computeDensityScores(positions: Float32Array, radius: number): Float32Array {
  const N = positions.length / 3;
  const counts = new Float32Array(N);
  const r2 = radius * radius;

  for (let i = 0; i < N; i++) {
    const ix = positions[i * 3 + 0];
    const iy = positions[i * 3 + 1];
    const iz = positions[i * 3 + 2];
    let c = 0;
    for (let j = 0; j < N; j++) {
      if (j === i) continue;
      const dx = positions[j * 3 + 0] - ix;
      const dy = positions[j * 3 + 1] - iy;
      const dz = positions[j * 3 + 2] - iz;
      if (dx * dx + dy * dy + dz * dz < r2) c++;
    }
    counts[i] = c;
  }

  let min = Infinity;
  let max = -Infinity;
  for (let i = 0; i < N; i++) {
    if (counts[i] < min) min = counts[i];
    if (counts[i] > max) max = counts[i];
  }
  const range = max - min || 1;
  for (let i = 0; i < N; i++) counts[i] = (counts[i] - min) / range;
  return counts;
}

// ---------------------------------------------------------------------------
// GLSL — vertex (instanced + Lambert) + fragment (per-pixel shaded, accented)
// ---------------------------------------------------------------------------

const VERT = /* glsl */ `
attribute float aOpacity;
attribute float aIsAccent;
attribute float aScale;
varying float vOpacity;
varying float vIsAccent;
varying vec3  vNormal;
uniform float uBreathScale;

void main() {
  vec3 transformed = position * aScale * uBreathScale;
  vec4 worldPos = vec4(transformed, 1.0);
  #ifdef USE_INSTANCING
    worldPos = instanceMatrix * worldPos;
    vNormal  = mat3(instanceMatrix) * normal;
  #else
    vNormal  = normal;
  #endif
  gl_Position = projectionMatrix * modelViewMatrix * worldPos;
  vOpacity  = aOpacity;
  vIsAccent = aIsAccent;
}
`;

const FRAG = /* glsl */ `
precision highp float;

uniform vec3  uBase;
uniform vec3  uAccent;
uniform vec3  uLightDir;
uniform float uAmbient;
varying float vOpacity;
varying float vIsAccent;
varying vec3  vNormal;

void main() {
  float lambert = max(dot(normalize(vNormal), normalize(uLightDir)), 0.0);
  float shade   = uAmbient + (1.0 - uAmbient) * lambert;
  vec3 col      = mix(uBase, uAccent, vIsAccent) * shade;
  gl_FragColor  = vec4(col, vOpacity);
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

  // Trail buffer
  private fadeScene!: Scene;
  private fadeCam!: OrthographicCamera;
  private fadeMat!: MeshBasicMaterial;

  private count!: number;
  private noisePos!: Float32Array;
  private targetPos!: Float32Array;
  private jitterSeed!: Float32Array;
  /** Density score in [0,1] per instance (cached so resize can rebuild scales). */
  private density!: Float32Array;
  private opacityAttr!: InstancedBufferAttribute;
  private accentAttr!: InstancedBufferAttribute;
  private scaleAttr!: InstancedBufferAttribute;

  private raf = 0;
  private running = false;
  private reduced = false;
  private isMobile = false;
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
    this.initFadeQuad();
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
    // Trail buffer: we manage clears manually so previous-frame colour persists.
    this.renderer.autoClear = false;
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
    const h = this.opts.ORTHO_HALF_EXTENT_Y;
    const aspect = this.canvas.clientWidth / Math.max(1, this.canvas.clientHeight);
    this.camera = new OrthographicCamera(-h * aspect, h * aspect, h, -h, 0.1, 50);

    // 15° downward tilt: camera above origin, looking at it.
    const tilt = (this.opts.CAMERA_TILT_DEG * Math.PI) / 180;
    const camDist = 5;
    this.camera.position.set(0, camDist * Math.tan(tilt), camDist);
    this.camera.lookAt(0, 0, 0);
  }

  private initFadeQuad() {
    this.fadeScene = new Scene();
    this.fadeCam = new OrthographicCamera(-1, 1, 1, -1, -1, 1);
    this.fadeMat = new MeshBasicMaterial({
      color: new Color(this.opts.BG_COLOR),
      transparent: true,
      opacity: this.opts.TRAIL_FADE_ALPHA,
      depthTest: false,
      depthWrite: false,
    });
    this.fadeScene.add(new Mesh(new PlaneGeometry(2, 2), this.fadeMat));
  }

  /** World units per CSS pixel on the Y axis, given the ortho frustum + canvas. */
  private pxToWorld() {
    const h = Math.max(1, this.canvas.clientHeight);
    return (2 * this.opts.ORTHO_HALF_EXTENT_Y) / h;
  }

  private initInstances() {
    const N = this.count;
    const rng = makeRng(0xc0ffee);

    // Unit cube — per-instance scale is applied in the vertex shader.
    const geom = new BoxGeometry(1, 1, 1);

    const light = this.opts.LIGHT_DIR;
    this.material = new ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uBreathScale: { value: 1.0 },
        uBase: { value: new Color(this.opts.BASE_COLOR) },
        uAccent: { value: new Color(this.opts.ACCENT_COLOR) },
        uLightDir: { value: new Vector3(light[0], light[1], light[2]) },
        uAmbient: { value: this.opts.AMBIENT },
      },
    });

    this.mesh = new InstancedMesh(geom, this.material, N);
    this.mesh.frustumCulled = false;
    this.mesh.instanceMatrix.setUsage(DynamicDrawUsage);
    this.scene.add(this.mesh);

    const opacities = new Float32Array(N);
    const accents = new Float32Array(N);
    const scales = new Float32Array(N);
    this.noisePos = new Float32Array(N * 3);
    this.jitterSeed = new Float32Array(N);

    for (let i = 0; i < N; i++) {
      this.noisePos[i * 3 + 0] = gaussian(rng) * 0.45 * this.opts.VOLUME_RADIUS;
      this.noisePos[i * 3 + 1] = gaussian(rng) * 0.45 * this.opts.VOLUME_RADIUS;
      this.noisePos[i * 3 + 2] = gaussian(rng) * 0.45 * this.opts.VOLUME_RADIUS;
      this.jitterSeed[i] = rng();
      opacities[i] = 0;
    }

    // Lorenz cluster, centroid-centered, scaled to fill 70% of viewport Y.
    const stride = this.isMobile
      ? Math.max(2, Math.floor(this.opts.ATTRACTOR_STRIDE * 0.6))
      : this.opts.ATTRACTOR_STRIDE;
    const targetY = this.opts.COMPOSITION_FILL_Y * 2 * this.opts.ORTHO_HALF_EXTENT_Y;
    this.targetPos = sampleLorenzCluster(
      N,
      stride,
      this.opts.ATTRACTOR_DT,
      this.opts.ATTRACTOR_WARMUP,
      targetY,
    );

    // Density-driven size + accent assignment.
    this.density = computeDensityScores(this.targetPos, this.opts.DENSITY_RADIUS);

    // Top-15% threshold for accent.
    const sorted = Array.from(this.density).sort((a, b) => a - b);
    const threshold = sorted[Math.floor(N * (1 - this.opts.ACCENT_TOP_PCT))];
    for (let i = 0; i < N; i++) accents[i] = this.density[i] >= threshold ? 1 : 0;

    // Log-normal scale: 4 → 14 px mapped from density score 0 → 1.
    const pxToWorld = this.pxToWorld();
    const sizeRatioLog = Math.log(this.opts.CUBE_PX_MAX / this.opts.CUBE_PX_MIN);
    const basePxWorld = this.opts.CUBE_PX_MIN * pxToWorld;
    for (let i = 0; i < N; i++) {
      scales[i] = basePxWorld * Math.exp(this.density[i] * sizeRatioLog);
    }

    this.opacityAttr = new InstancedBufferAttribute(opacities, 1);
    this.accentAttr = new InstancedBufferAttribute(accents, 1);
    this.scaleAttr = new InstancedBufferAttribute(scales, 1);
    this.opacityAttr.setUsage(DynamicDrawUsage);
    this.scaleAttr.setUsage(DynamicDrawUsage); // resize() updates this
    geom.setAttribute("aOpacity", this.opacityAttr);
    geom.setAttribute("aIsAccent", this.accentAttr);
    geom.setAttribute("aScale", this.scaleAttr);

    // Seed instance matrices once (translation only — scale is in aScale).
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

  /** Rebuild per-instance scale (pxToWorld changes when canvas height changes). */
  private rebuildScales() {
    const N = this.count;
    const pxToWorld = this.pxToWorld();
    const sizeRatioLog = Math.log(this.opts.CUBE_PX_MAX / this.opts.CUBE_PX_MIN);
    const basePxWorld = this.opts.CUBE_PX_MIN * pxToWorld;
    const arr = this.scaleAttr.array as Float32Array;
    for (let i = 0; i < N; i++) {
      arr[i] = basePxWorld * Math.exp(this.density[i] * sizeRatioLog);
    }
    this.scaleAttr.needsUpdate = true;
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

  /**
   * Compose one frame: fade existing colour buffer, then draw the scene on top.
   * autoClear is off (set in initRenderer), so previous-frame pixels persist
   * minus the 8% bg-tinted fade quad → ~12-frame motion-blur tail.
   */
  private composite() {
    this.renderer.clearDepth();
    this.renderer.render(this.fadeScene, this.fadeCam);
    this.renderer.render(this.scene, this.camera);
  }

  // ----------------- lifecycle -----------------

  start() {
    if (this.running) return;
    this.running = true;
    if (this.reduced) {
      // Static frame — clear the canvas first so no trail residue lingers.
      this.renderer.clear();
      this.updateInstances(this.midBreathT());
      this.composite();
      return;
    }
    this.renderer.clear();
    this.loopStart = performance.now();
    const loop = () => {
      if (!this.running || this.reduced) return;
      const t = ((performance.now() - this.loopStart) / 1000) % LOOP_DURATION;
      this.updateInstances(t);
      this.composite();
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
      this.renderer.clear();
      this.updateInstances(this.midBreathT());
      this.composite();
    } else if (this.running) {
      this.renderer.clear();
      this.loopStart = performance.now();
      const loop = () => {
        if (!this.running || this.reduced) return;
        const t = ((performance.now() - this.loopStart) / 1000) % LOOP_DURATION;
        this.updateInstances(t);
        this.composite();
        this.raf = requestAnimationFrame(loop);
      };
      this.raf = requestAnimationFrame(loop);
    }
  }

  /** Public seek used by the fallback-PNG script. */
  renderStill(t: number) {
    this.renderer.clear();
    this.updateInstances(t);
    this.composite();
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
    const h = this.opts.ORTHO_HALF_EXTENT_Y;
    this.camera.left = -h * aspect;
    this.camera.right = h * aspect;
    this.camera.top = h;
    this.camera.bottom = -h;
    this.camera.updateProjectionMatrix();
    // Cube sizes are in world units derived from canvas pixels — recompute.
    this.rebuildScales();
    if (this.reduced) {
      this.renderer.clear();
      this.composite();
    }
  }

  dispose() {
    this.stop();
    this.resizeObs?.disconnect();
    this.mesh.geometry.dispose();
    this.material.dispose();
    this.fadeMat.dispose();
    (this.fadeScene.children[0] as Mesh).geometry.dispose();
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
