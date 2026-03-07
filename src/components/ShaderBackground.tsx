"use client";

import { useRef, useMemo, useEffect, useCallback, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useMousePosition } from "@/hooks/use-mouse-position";
import { useIsMobile } from "@/hooks/use-mobile";

// ---------------------------------------------------------------------------
// Molecular / protein-folding shader — FBM + Voronoi + hex grid
// Evokes: protein folding, AAV capsid geometry, peptide sequences
// Color: deep navy base, desaturated steel-blue accent, near-black voids
// ---------------------------------------------------------------------------

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uMouse;

  varying vec2 vUv;

  // --- Hash functions ---
  vec2 hash2(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return fract(sin(p) * 43758.5453);
  }

  float hash1(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  // --- FBM noise (4 octaves, slow evolution) ---
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);

    float a = hash1(i);
    float b = hash1(i + vec2(1.0, 0.0));
    float c = hash1(i + vec2(0.0, 1.0));
    float d = hash1(i + vec2(1.0, 1.0));

    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float fbm(vec2 p) {
    float val = 0.0;
    float amp = 0.5;
    float freq = 1.0;
    for (int i = 0; i < 4; i++) {
      val += amp * noise(p * freq);
      freq *= 2.0;
      amp *= 0.5;
    }
    return val;
  }

  // --- Voronoi (returns distance to nearest cell center) ---
  float voronoi(vec2 p) {
    vec2 n = floor(p);
    vec2 f = fract(p);
    float md = 8.0;

    for (int j = -1; j <= 1; j++) {
      for (int i = -1; i <= 1; i++) {
        vec2 g = vec2(float(i), float(j));
        vec2 o = hash2(n + g);
        o = 0.5 + 0.5 * sin(uTime * 0.3 + 6.2831 * o);
        vec2 r = g + o - f;
        float d = dot(r, r);
        md = min(md, d);
      }
    }
    return sqrt(md);
  }

  // --- Hexagonal grid ---
  float hexGrid(vec2 p) {
    vec2 q = vec2(p.x * 2.0 * 0.5773503, p.y + p.x * 0.5773503);
    vec2 pi = floor(q);
    vec2 pf = fract(q);

    float v = mod(pi.x + pi.y, 3.0);
    float ca = step(1.0, v);
    float cb = step(2.0, v);
    vec2 ma = step(pf.xy, pf.yx);

    float e = dot(ma, 1.0 - pf.yx + ca * (pf.x + pf.y - 1.0) + cb * (pf.yx - 2.0 * pf.xy));
    float dist = abs(e - 0.5);
    return smoothstep(0.02, 0.0, dist);
  }

  void main() {
    float aspect = uResolution.x / uResolution.y;
    vec2 uv = vUv;
    vec2 st = uv * vec2(aspect, 1.0);

    float t = uTime * 0.3;

    // Mouse parallax — max 5% displacement of noise origin
    vec2 mouse = uMouse * vec2(aspect, 1.0);
    vec2 mouseOffset = (uMouse - 0.5) * 0.05;

    // --- Color palette ---
    vec3 colBase = vec3(0.039, 0.055, 0.102);   // #0a0e1a deep navy
    vec3 colAccent = vec3(0.478, 0.620, 0.773);  // #7a9ec5 steel blue
    vec3 colDim = vec3(0.15, 0.18, 0.25);         // dim steel

    vec3 color = colBase;

    // --- FBM organic waveform (base layer) ---
    vec2 fbmCoord = st * 3.0 + mouseOffset;
    float f1 = fbm(fbmCoord + t * 0.08);
    float f2 = fbm(fbmCoord + f1 * 0.6 + vec2(1.7, 9.2) + t * 0.05);
    float organicField = f2 * 0.35;
    color += colAccent * organicField * 0.18;

    // --- Voronoi layer 1 (large scale — cellular membrane) ---
    float v1 = voronoi(st * 4.0 + mouseOffset * 2.0);
    float cellEdge1 = smoothstep(0.05, 0.0, v1 - 0.1);
    color += colAccent * cellEdge1 * 0.08;

    // Voronoi interior glow
    float cellGlow1 = exp(-v1 * 4.0) * 0.06;
    color += colAccent * cellGlow1;

    // --- Voronoi layer 2 (small scale — molecular texture) ---
    float v2 = voronoi(st * 10.0 + mouseOffset + t * 0.04);
    float cellEdge2 = smoothstep(0.04, 0.0, v2 - 0.08);
    color += colDim * cellEdge2 * 0.12;

    // --- Hexagonal grid overlay (icosahedral geometry, 8% opacity) ---
    float hex = hexGrid(st * 8.0 + mouseOffset);
    color += colDim * hex * 0.08;

    // --- Faint horizontal scan lines (peptide sequence evocation) ---
    float scan = sin(st.y * 180.0 + t * 0.5) * 0.5 + 0.5;
    scan = pow(scan, 12.0);
    color += colAccent * scan * 0.015;

    // --- Mouse proximity glow (subtle) ---
    float mouseDist = distance(st, mouse);
    float mouseGlow = exp(-mouseDist * 4.0) * 0.04;
    color += colAccent * mouseGlow;

    // --- Vignette (strong edge darkening) ---
    vec2 center = vec2(aspect * 0.5, 0.5);
    float vignette = 1.0 - smoothstep(0.15, 0.95, length((st - center) / vec2(aspect, 1.0) * 1.5));
    color *= mix(0.25, 1.0, vignette);

    gl_FragColor = vec4(color, 1.0);
  }
`;

// ---------------------------------------------------------------------------
// Shader plane — full-screen quad (consumes shared mouse position)
// ---------------------------------------------------------------------------

function ShaderPlane({ nx, ny }: { nx: { get: () => number }; ny: { get: () => number } }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const mouseTarget = useRef(new THREE.Vector2(0.5, 0.5));
  const mouseCurrent = useRef(new THREE.Vector2(0.5, 0.5));
  const { size } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    uniforms.uResolution.value.set(size.width, size.height);
  }, [size, uniforms]);

  useFrame((_, delta) => {
    mouseTarget.current.set(nx.get(), ny.get());
    mouseCurrent.current.lerp(mouseTarget.current, 0.03);
    uniforms.uMouse.value.copy(mouseCurrent.current);
    uniforms.uTime.value += delta;
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// Static fallback for prefers-reduced-motion AND mobile
// ---------------------------------------------------------------------------

function StaticGradient() {
  return (
    <div
      className="absolute inset-0"
      style={{
        background:
          "radial-gradient(ellipse at 30% 40%, #0d1525 0%, #070a12 60%, #020305 100%)",
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// WebGL wrapper — defers init to avoid blocking LCP
// ---------------------------------------------------------------------------

function WebGLCanvas({ nx, ny }: { nx: { get: () => number }; ny: { get: () => number } }) {
  const onCreated = useCallback((state: { gl: THREE.WebGLRenderer }) => {
    state.gl.setClearColor(new THREE.Color("#0a0e1a"), 1);
  }, []);

  return (
    <Canvas
      className="!absolute !inset-0"
      style={{ position: "absolute", inset: 0 }}
      gl={{
        antialias: false,
        alpha: false,
        powerPreference: "high-performance",
        stencil: false,
        depth: false,
      }}
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 1] }}
      onCreated={onCreated}
      frameloop="always"
    >
      <ShaderPlane nx={nx} ny={ny} />
    </Canvas>
  );
}

// ---------------------------------------------------------------------------
// Public component
// ---------------------------------------------------------------------------

export default function ShaderBackground({
  reducedMotion = false,
}: {
  reducedMotion?: boolean;
}) {
  const isMobile = useIsMobile();
  const { nx, ny } = useMousePosition();
  const [ready, setReady] = useState(false);

  // Defer WebGL init by ~200ms to avoid blocking LCP
  useEffect(() => {
    if (reducedMotion || isMobile) return;
    const id = setTimeout(() => setReady(true), 200);
    return () => clearTimeout(id);
  }, [reducedMotion, isMobile]);

  if (reducedMotion || isMobile) {
    return <StaticGradient />;
  }

  if (!ready) {
    return <StaticGradient />;
  }

  return <WebGLCanvas nx={nx} ny={ny} />;
}
