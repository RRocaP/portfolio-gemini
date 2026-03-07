/**
 * WebGLBackground.tsx — AI Protein Engineering Hero Background
 *
 * Three visual layers, each mapping to real scientific constructs:
 *
 * Layer 1: Alpha Helix (50%) — ~1500 particles along two interleaved helices
 *   evoke the alpha-helix secondary structure of proteins. Two strands offset
 *   by PI represent the hydrogen-bonded backbone turns. Slowly rotates on Y.
 *
 * Layer 2: Attention Matrix (35%) — ~1050 particles in a 30x35 grid
 *   evoke ESM-2 / protein language model attention weight maps. A traveling
 *   sin*cos wave modulates opacity — attention score propagation through sequence.
 *
 * Layer 3: Peptide Bond Graph — ~400 line segments connecting helix particles
 *   sequential connections = peptide bonds; every 7th cross-strand = hydrogen bonds.
 *
 * Color palette: #0d1a2e (deep navy) → #7a9ec5 (steel blue) → #6bb5ab (teal, sparse)
 * Aesthetic: deep-sea research submarine instrument panel at night.
 */
"use client";

import { useRef, useMemo, useEffect, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { useMousePosition } from "@/hooks/use-mouse-position";

// ---------------------------------------------------------------------------
// Ashima Arts simplex noise 3D — classic GLSL implementation (inline)
// ---------------------------------------------------------------------------
const snoise3GLSL = /* glsl */ `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
  + i.y + vec4(0.0, i1.y, i2.y, 1.0))
  + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}
`;

// ---------------------------------------------------------------------------
// Vertex shader — helix + attention particles
// ---------------------------------------------------------------------------
const vertexShader = /* glsl */ `
${snoise3GLSL}

uniform float uTime;
uniform vec2  uMouse;
uniform float uHelixRotation;
uniform float uBasePointSize;

attribute float aLayer;     // 0 = helix, 1 = attention
attribute float aIndex;     // particle index within layer

varying float vNoise;
varying float vLayer;
varying float vAlpha;

void main() {
  vec3 pos = position;

  // Simplex noise displacement — thermal fluctuation / molecular dynamics
  float noiseVal = snoise(vec3(pos.x * 1.2, pos.y * 1.2, uTime * 0.18));
  pos += normal * noiseVal * 0.03;

  // Mouse parallax — closer particles (higher z) shift more
  vec2 mouseOffset = (uMouse - 0.5) * 0.06 * (1.0 - abs(pos.z) * 0.5);
  pos.xy += mouseOffset;

  // Apply helix rotation for layer 0
  if (aLayer < 0.5) {
    float cosR = cos(uHelixRotation);
    float sinR = sin(uHelixRotation);
    float newX = pos.x * cosR - pos.z * sinR;
    float newZ = pos.x * sinR + pos.z * cosR;
    pos.x = newX;
    pos.z = newZ;
  }

  vNoise = noiseVal * 0.5 + 0.5; // remap to 0-1
  vLayer = aLayer;

  // Attention layer: traveling wave opacity
  if (aLayer > 0.5) {
    float col = mod(aIndex, 30.0);
    float row = floor(aIndex / 30.0);
    float wave = sin(col * 0.6 + uTime * 0.25) * cos(row * 0.45 - uTime * 0.15);
    vAlpha = 0.012 + abs(wave) * 0.03;
  } else {
    vAlpha = 0.04;
  }

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  float sizeMod = aLayer > 0.5 ? 0.8 : (uBasePointSize + (vNoise - 0.5) * 0.3);
  gl_PointSize = sizeMod * (8.0 / -mvPosition.z);
}
`;

// ---------------------------------------------------------------------------
// Fragment shader — circular soft points, cold scientific palette
// ---------------------------------------------------------------------------
const fragmentShader = /* glsl */ `
varying float vNoise;
varying float vLayer;
varying float vAlpha;

void main() {
  float dist = length(gl_PointCoord - vec2(0.5));
  if (dist > 0.5) discard;

  // Soft edge falloff
  float edgeAlpha = 1.0 - smoothstep(0.3, 0.5, dist);

  // Color by noise level
  vec3 deepNavy  = vec3(0.051, 0.102, 0.180);  // #0d1a2e
  vec3 steelBlue = vec3(0.478, 0.620, 0.773);  // #7a9ec5
  vec3 teal      = vec3(0.420, 0.710, 0.671);  // #6bb5ab

  vec3 color;
  if (vLayer > 0.5) {
    // Attention matrix — dimmer steel blue
    color = steelBlue;
  } else {
    // Helix particles — noise-driven gradient
    if (vNoise < 0.45) {
      color = mix(deepNavy, steelBlue, vNoise / 0.45);
    } else if (vNoise < 0.85) {
      color = steelBlue;
    } else {
      // Top 15% — sparse teal highlights
      color = mix(steelBlue, teal, (vNoise - 0.85) / 0.15);
    }
  }

  gl_FragColor = vec4(color, vAlpha * edgeAlpha);
}
`;

// ---------------------------------------------------------------------------
// Line vertex/fragment shaders — peptide bonds
// ---------------------------------------------------------------------------
const lineVertexShader = /* glsl */ `
uniform float uHelixRotation;
uniform vec2  uMouse;

void main() {
  vec3 pos = position;

  // Mouse parallax
  vec2 mouseOffset = (uMouse - 0.5) * 0.06 * (1.0 - abs(pos.z) * 0.5);
  pos.xy += mouseOffset;

  // Apply helix rotation
  float cosR = cos(uHelixRotation);
  float sinR = sin(uHelixRotation);
  float newX = pos.x * cosR - pos.z * sinR;
  float newZ = pos.x * sinR + pos.z * cosR;
  pos.x = newX;
  pos.z = newZ;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

const lineFragmentShader = /* glsl */ `
void main() {
  gl_FragColor = vec4(0.478, 0.620, 0.773, 0.04);
}
`;

// ---------------------------------------------------------------------------
// Geometry builders — deterministic, structurally placed
// ---------------------------------------------------------------------------

const TWO_PI = Math.PI * 2;

function buildHelixGeometry(count: number): {
  positions: Float32Array;
  normals: Float32Array;
  layers: Float32Array;
  indices: Float32Array;
} {
  const positions = new Float32Array(count * 3);
  const normals = new Float32Array(count * 3);
  const layers = new Float32Array(count);
  const indices = new Float32Array(count);

  const halfCount = Math.floor(count / 2);

  for (let strand = 0; strand < 2; strand++) {
    const phaseOffset = strand * Math.PI;
    const startIdx = strand * halfCount;

    for (let i = 0; i < halfCount; i++) {
      const t = i / halfCount;
      const angle = t * TWO_PI * 8.0 + phaseOffset;
      // Deterministic noise-like variation via sin harmonics (no Math.random)
      const radiusVar = Math.sin(i * 0.73) * 0.02 + Math.cos(i * 1.17) * 0.02;
      const radius = 0.28 + radiusVar;

      const idx = startIdx + i;
      const i3 = idx * 3;

      positions[i3] = Math.cos(angle) * radius;
      positions[i3 + 1] = t * 2.2 - 1.1;
      positions[i3 + 2] = Math.sin(angle) * radius;

      // Normals point outward from helix axis
      normals[i3] = Math.cos(angle);
      normals[i3 + 1] = 0;
      normals[i3 + 2] = Math.sin(angle);

      layers[idx] = 0;
      indices[idx] = i;
    }
  }

  return { positions, normals, layers, indices };
}

function buildAttentionGeometry(cols: number, rows: number): {
  positions: Float32Array;
  normals: Float32Array;
  layers: Float32Array;
  indices: Float32Array;
} {
  const count = cols * rows;
  const positions = new Float32Array(count * 3);
  const normals = new Float32Array(count * 3);
  const layers = new Float32Array(count);
  const indices = new Float32Array(count);

  const spacing = 0.065;
  const offsetX = -(cols - 1) * spacing * 0.5;
  const offsetY = -(rows - 1) * spacing * 0.5;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const idx = row * cols + col;
      const i3 = idx * 3;

      positions[i3] = offsetX + col * spacing;
      positions[i3 + 1] = offsetY + row * spacing;
      positions[i3 + 2] = -0.9;

      normals[i3] = 0;
      normals[i3 + 1] = 0;
      normals[i3 + 2] = 1;

      layers[idx] = 1;
      indices[idx] = idx;
    }
  }

  return { positions, normals, layers, indices };
}

function buildPeptideBondGeometry(
  helixPositions: Float32Array,
  helixCount: number,
): Float32Array {
  const halfCount = Math.floor(helixCount / 2);
  const lineVertices: number[] = [];

  // Sequential peptide bonds within each strand
  for (let strand = 0; strand < 2; strand++) {
    const start = strand * halfCount;
    for (let i = 0; i < halfCount - 1; i++) {
      const a = (start + i) * 3;
      const b = (start + i + 1) * 3;
      lineVertices.push(
        helixPositions[a], helixPositions[a + 1], helixPositions[a + 2],
        helixPositions[b], helixPositions[b + 1], helixPositions[b + 2],
      );
    }
  }

  // Cross-strand hydrogen bonds every 7th particle
  for (let i = 0; i < halfCount; i += 7) {
    // Find nearest particle on other strand by Y proximity
    const aIdx = i;
    const aY = helixPositions[aIdx * 3 + 1];
    let bestIdx = halfCount;
    let bestDist = Infinity;

    for (let j = 0; j < halfCount; j++) {
      const bIdx = halfCount + j;
      const bY = helixPositions[bIdx * 3 + 1];
      const d = Math.abs(aY - bY);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = bIdx;
      }
    }

    const a = aIdx * 3;
    const b = bestIdx * 3;
    lineVertices.push(
      helixPositions[a], helixPositions[a + 1], helixPositions[a + 2],
      helixPositions[b], helixPositions[b + 1], helixPositions[b + 2],
    );
  }

  return new Float32Array(lineVertices);
}

// ---------------------------------------------------------------------------
// Scene component — manages all three layers
// ---------------------------------------------------------------------------

interface SceneProps {
  nx: { get: () => number };
  ny: { get: () => number };
  prefersReducedMotion: boolean;
}

function Scene({ nx, ny, prefersReducedMotion }: SceneProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const helixRotation = useRef(0);
  const pausedRef = useRef(false);
  const pointsMatRef = useRef<THREE.ShaderMaterial | null>(null);
  const lineMatRef = useRef<THREE.ShaderMaterial | null>(null);
  const { size } = useThree();

  // Build geometries and materials once, store materials in refs for mutation
  const { pointsGeo, lineGeo, pointsMat, lineMat } = useMemo(() => {
    const helixCount = 1500;
    const attCols = 30;
    const attRows = 35;

    const helix = buildHelixGeometry(helixCount);
    const att = buildAttentionGeometry(attCols, attRows);
    const attCount = attCols * attRows;
    const totalCount = helixCount + attCount;

    const mergedPos = new Float32Array(totalCount * 3);
    const mergedNorm = new Float32Array(totalCount * 3);
    const mergedLayer = new Float32Array(totalCount);
    const mergedIndex = new Float32Array(totalCount);

    mergedPos.set(helix.positions);
    mergedPos.set(att.positions, helixCount * 3);
    mergedNorm.set(helix.normals);
    mergedNorm.set(att.normals, helixCount * 3);
    mergedLayer.set(helix.layers);
    mergedLayer.set(att.layers, helixCount);
    mergedIndex.set(helix.indices);
    mergedIndex.set(att.indices, helixCount);

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(mergedPos, 3));
    geo.setAttribute("normal", new THREE.BufferAttribute(mergedNorm, 3));
    geo.setAttribute("aLayer", new THREE.BufferAttribute(mergedLayer, 1));
    geo.setAttribute("aIndex", new THREE.BufferAttribute(mergedIndex, 1));

    const mat = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uHelixRotation: { value: 0 },
        uBasePointSize: { value: 1.8 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });

    const linePositions = buildPeptideBondGeometry(helix.positions, helixCount);
    const lGeo = new THREE.BufferGeometry();
    lGeo.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));

    const lMat = new THREE.ShaderMaterial({
      vertexShader: lineVertexShader,
      fragmentShader: lineFragmentShader,
      uniforms: {
        uHelixRotation: { value: 0 },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });

    return { pointsGeo: geo, lineGeo: lGeo, pointsMat: mat, lineMat: lMat };
  }, []);

  // Store materials in refs for useFrame mutation (after initial render)
  useEffect(() => {
    pointsMatRef.current = pointsMat;
    lineMatRef.current = lineMat;
  }, [pointsMat, lineMat]);

  // Pause on tab hidden
  useEffect(() => {
    const onVisibility = () => {
      pausedRef.current = document.hidden;
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // Update resolution uniform via ref
  useEffect(() => {
    if (pointsMatRef.current) {
      pointsMatRef.current.uniforms.uBasePointSize.value = Math.min(size.width / 700, 2.2);
    }
  }, [size]);

  // Cleanup
  useEffect(() => {
    return () => {
      pointsGeo.dispose();
      lineGeo.dispose();
      pointsMat.dispose();
      lineMat.dispose();
    };
  }, [pointsGeo, lineGeo, pointsMat, lineMat]);

  useFrame((_, delta) => {
    if (pausedRef.current || prefersReducedMotion) return;

    const pMat = pointsMatRef.current;
    const lMat = lineMatRef.current;
    if (!pMat || !lMat) return;

    const clampedDelta = Math.min(delta, 0.05);
    helixRotation.current += 0.04 * clampedDelta * 60;

    pMat.uniforms.uTime.value += clampedDelta;
    pMat.uniforms.uHelixRotation.value = helixRotation.current;
    lMat.uniforms.uHelixRotation.value = helixRotation.current;

    pMat.uniforms.uMouse.value.set(nx.get(), ny.get());
    lMat.uniforms.uMouse.value.set(nx.get(), ny.get());
  });

  return (
    <>
      <points ref={pointsRef} geometry={pointsGeo} material={pointsMat} />
      <lineSegments ref={linesRef} geometry={lineGeo} material={lineMat} />
    </>
  );
}

// ---------------------------------------------------------------------------
// CSS-only fallback for mobile / no WebGL
// ---------------------------------------------------------------------------

export function WebGLBackgroundFallback() {
  return (
    <div
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{
        background:
          "radial-gradient(ellipse at 30% 40%, #0d1525 0%, #070a12 60%, #020305 100%)",
        backgroundColor: "#070a12",
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// Public component
// ---------------------------------------------------------------------------

export default function WebGLBackground({
  prefersReducedMotion = false,
}: {
  prefersReducedMotion?: boolean;
}) {
  const { nx, ny } = useMousePosition();

  const onCreated = useCallback((state: { gl: THREE.WebGLRenderer }) => {
    state.gl.setClearColor(new THREE.Color("#070a12"), 0);
  }, []);

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none" style={{ backgroundColor: "#070a12" }}>
      <Canvas
        gl={{
          antialias: false,
          alpha: false,
          powerPreference: "high-performance",
          stencil: false,
          depth: false,
        }}
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 2], fov: 50 }}
        onCreated={onCreated}
        frameloop={prefersReducedMotion ? "never" : "always"}
      >
        <Scene nx={nx} ny={ny} prefersReducedMotion={prefersReducedMotion} />
        <EffectComposer>
          <Bloom
            luminanceThreshold={0.9}
            intensity={0.06}
            luminanceSmoothing={0.95}
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
