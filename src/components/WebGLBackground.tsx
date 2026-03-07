/**
 * WebGLBackground.tsx — Gray-Scott Reaction-Diffusion Background
 *
 * Implements a GPU-accelerated Gray-Scott reaction-diffusion system as a
 * fullscreen WebGL shader background. The Gray-Scott model describes two
 * interacting chemical species (U activator, V inhibitor) whose diffusion
 * and reaction rates produce spontaneous Turing instability patterns.
 *
 * Scientific relevance to the owner's research:
 *   - Turing patterns (1952) underlie biological morphogenesis
 *   - The labyrinthine structures mirror peptide self-assembly boundaries
 *   - Biofilm colony boundary formation follows reaction-diffusion dynamics
 *   - Protein aggregation fronts exhibit the same mathematical framework
 *
 * The PDE system:
 *   du/dt = Du * laplacian(u) - u*v^2 + F*(1-u)
 *   dv/dt = Dv * laplacian(v) + u*v^2 - (F+k)*v
 *
 * Parameters (F=0.037, k=0.060) produce labyrinthine / coral-like patterns
 * that evoke confocal microscopy imagery of membrane channel networks.
 *
 * Architecture: ping-pong WebGLRenderTarget at 512x512, one simulation step
 * per frame, display pass maps V concentration to cold scientific palette.
 * The display mesh lives in R3F's scene graph so EffectComposer can process it.
 */
"use client";

import { useRef, useEffect, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { useMousePosition } from "@/hooks/use-mouse-position";

// ---------------------------------------------------------------------------
// Shared vertex shader — fullscreen quad
// ---------------------------------------------------------------------------
const fullscreenVert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

// ---------------------------------------------------------------------------
// Simulation shader — Gray-Scott reaction-diffusion step
// ---------------------------------------------------------------------------
const simulationFrag = /* glsl */ `
  precision highp float;

  uniform sampler2D uTexture;
  uniform vec2 uResolution;
  uniform float uF;
  uniform float uK;
  uniform vec2 uMouse;
  uniform float uMouseActive;

  varying vec2 vUv;

  void main() {
    vec2 texel = 1.0 / uResolution;

    // Sample neighborhood (5-point Laplacian stencil)
    vec4 center = texture2D(uTexture, vUv);
    vec4 top    = texture2D(uTexture, vUv + vec2(0.0, texel.y));
    vec4 bottom = texture2D(uTexture, vUv - vec2(0.0, texel.y));
    vec4 right  = texture2D(uTexture, vUv + vec2(texel.x, 0.0));
    vec4 left   = texture2D(uTexture, vUv - vec2(texel.x, 0.0));

    vec2 laplacian = (top.rg + bottom.rg + right.rg + left.rg) - 4.0 * center.rg;

    float u = center.r;
    float v = center.g;
    float uvv = u * v * v;

    // Diffusion constants
    float Du = 0.2097;
    float Dv = 0.1050;

    // Gray-Scott update
    float du = Du * laplacian.r - uvv + uF * (1.0 - u);
    float dv = Dv * laplacian.g + uvv - (uF + uK) * v;

    float newU = clamp(u + du, 0.0, 1.0);
    float newV = clamp(v + dv, 0.0, 1.0);

    // Mouse perturbation: inject V at cursor position
    if (uMouseActive > 0.5) {
      float dist = length(vUv - uMouse);
      float perturbation = 0.5 * exp(-dist * dist / (2.0 * 0.015 * 0.015));
      newV = clamp(newV + perturbation, 0.0, 1.0);
    }

    gl_FragColor = vec4(newU, newV, 0.0, 1.0);
  }
`;

// ---------------------------------------------------------------------------
// Seed shader — initial conditions
// ---------------------------------------------------------------------------
const seedFrag = /* glsl */ `
  precision highp float;

  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  void main() {
    float u = 1.0;
    float v = 0.0;

    // Sparse random seeds (~3% of pixels) in a central region
    float h = hash(vUv);
    float centralMask = smoothstep(0.6, 0.4, length(vUv - 0.5));
    if (fract(h * 17.3) > 0.97 && centralMask > 0.1) {
      v = 1.0;
      u = 0.5;
    }

    gl_FragColor = vec4(u, v, 0.0, 1.0);
  }
`;

// ---------------------------------------------------------------------------
// Display shader — V concentration to color palette
// ---------------------------------------------------------------------------
const displayFrag = /* glsl */ `
  precision highp float;

  uniform sampler2D uTexture;
  uniform vec2 uResolution;
  uniform float uTime;

  varying vec2 vUv;

  void main() {
    float v = texture2D(uTexture, vUv).g;

    // Color palette: map V concentration to bioluminescent glow
    vec3 c0 = vec3(0.0, 0.0, 0.0);        // #000000 — deep black base
    vec3 c1 = vec3(0.02, 0.02, 0.06);     // #050510 — barely-there violet hint
    vec3 c2 = vec3(0.24, 0.09, 0.37);     // #3d1760 — violet mid (7B2FBE range)
    vec3 c3 = vec3(0.48, 0.18, 0.74);     // #7B2FBE — violet glow
    vec3 c4 = vec3(0.0, 1.0, 0.82);       // #00FFD1 — teal/cyan peak

    vec3 color = c0;
    color = mix(color, c1, smoothstep(0.0, 0.3, v));
    color = mix(color, c2, smoothstep(0.15, 0.6, v));
    color = mix(color, c3, smoothstep(0.45, 0.85, v));
    color = mix(color, c4, smoothstep(0.8, 1.0, v));

    // Vignette — darken edges
    float vig = 1.0 - length(vUv - 0.5) * 1.2;
    vig = clamp(vig, 0.0, 1.0);
    vig = vig * vig; // quadratic falloff
    color *= mix(0.3, 1.0, vig);

    // Subtle scanlines (instrument panel aesthetic)
    float scanline = 0.98 + 0.02 * sin(vUv.y * uResolution.y * 1.5);
    color *= scanline;

    gl_FragColor = vec4(color, 1.0);
  }
`;

// ---------------------------------------------------------------------------
// Simulation resolution
// ---------------------------------------------------------------------------
const SIM_SIZE = typeof window !== "undefined" && window.devicePixelRatio > 1.5 ? 384 : 512;

// ---------------------------------------------------------------------------
// Scene component — ping-pong render target simulation + display mesh
// ---------------------------------------------------------------------------
interface SceneProps {
  nx: { get: () => number };
  ny: { get: () => number };
  prefersReducedMotion: boolean;
}

function Scene({ nx, ny, prefersReducedMotion }: SceneProps) {
  const { gl, invalidate } = useThree();
  const meshRef = useRef<THREE.Mesh>(null);
  const pausedRef = useRef(false);
  const initializedRef = useRef(false);
  const mouseActiveRef = useRef(false);
  const lastMouseRef = useRef({ x: 0.5, y: 0.5 });
  const framesSinceMouseMove = useRef(0);
  const timeRef = useRef(0);

  // All GPU resources stored in a single ref
  const resources = useRef<{
    rtA: THREE.WebGLRenderTarget;
    rtB: THREE.WebGLRenderTarget;
    quad: THREE.Mesh;
    simMaterial: THREE.ShaderMaterial;
    displayMaterial: THREE.ShaderMaterial;
    seedMaterial: THREE.ShaderMaterial;
    simScene: THREE.Scene;
    simCamera: THREE.Camera;
  } | null>(null);

  // Initialize all resources + warmup
  useEffect(() => {
    const rtOptions: THREE.RenderTargetOptions = {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
    };

    const rtA = new THREE.WebGLRenderTarget(SIM_SIZE, SIM_SIZE, rtOptions);
    const rtB = new THREE.WebGLRenderTarget(SIM_SIZE, SIM_SIZE, rtOptions);

    const geometry = new THREE.PlaneGeometry(2, 2);

    const simMaterial = new THREE.ShaderMaterial({
      vertexShader: fullscreenVert,
      fragmentShader: simulationFrag,
      uniforms: {
        uTexture: { value: null },
        uResolution: { value: new THREE.Vector2(SIM_SIZE, SIM_SIZE) },
        uF: { value: 0.037 },
        uK: { value: 0.060 },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uMouseActive: { value: 0.0 },
      },
      depthWrite: false,
      depthTest: false,
    });

    const displayMaterial = new THREE.ShaderMaterial({
      vertexShader: fullscreenVert,
      fragmentShader: displayFrag,
      uniforms: {
        uTexture: { value: null },
        uResolution: { value: new THREE.Vector2(SIM_SIZE, SIM_SIZE) },
        uTime: { value: 0.0 },
      },
      depthWrite: false,
      depthTest: false,
    });

    const seedMaterial = new THREE.ShaderMaterial({
      vertexShader: fullscreenVert,
      fragmentShader: seedFrag,
      depthWrite: false,
      depthTest: false,
    });

    const quad = new THREE.Mesh(geometry, simMaterial);
    const simScene = new THREE.Scene();
    simScene.add(quad);
    const simCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    resources.current = {
      rtA, rtB, quad, simMaterial, displayMaterial, seedMaterial, simScene, simCamera,
    };

    // Seed initial conditions
    quad.material = seedMaterial;
    gl.setRenderTarget(rtA);
    gl.render(simScene, simCamera);
    gl.setRenderTarget(null);

    // Warmup: run 800 simulation steps to develop fully labyrinthine patterns
    for (let i = 0; i < 800; i++) {
      simMaterial.uniforms.uTexture.value = rtA.texture;
      simMaterial.uniforms.uMouseActive.value = 0.0;
      quad.material = simMaterial;
      gl.setRenderTarget(rtB);
      gl.render(simScene, simCamera);

      simMaterial.uniforms.uTexture.value = rtB.texture;
      gl.setRenderTarget(rtA);
      gl.render(simScene, simCamera);
    }
    gl.setRenderTarget(null);

    // Attach display material to the visible mesh in R3F's scene graph
    displayMaterial.uniforms.uTexture.value = rtA.texture;
    if (meshRef.current) {
      meshRef.current.material = displayMaterial;
    }

    initializedRef.current = true;

    // Request one render frame so the warmed-up pattern is visible
    // (critical for frameloop="never" / reduced-motion mode)
    invalidate();

    return () => {
      rtA.dispose();
      rtB.dispose();
      geometry.dispose();
      simMaterial.dispose();
      displayMaterial.dispose();
      seedMaterial.dispose();
    };
  }, [gl, invalidate]);

  // Visibility change — pause when hidden
  useEffect(() => {
    const onVisibility = () => {
      pausedRef.current = document.hidden;
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // Simulation in useFrame — display mesh is rendered by R3F + EffectComposer
  useFrame((state, delta) => {
    if (!resources.current || !initializedRef.current) return;
    if (pausedRef.current || prefersReducedMotion) return;

    const { rtA, rtB, quad, simMaterial, displayMaterial, simScene, simCamera } = resources.current;
    const renderer = state.gl;
    const clampedDelta = Math.min(delta, 0.05);
    timeRef.current += clampedDelta;

    // Interpolate F/k parameters for slow morphology drift (40s cycle)
    const t = Math.sin(timeRef.current * 0.025) * 0.5 + 0.5;
    simMaterial.uniforms.uF.value = 0.035 + t * 0.002;
    simMaterial.uniforms.uK.value = 0.060 + (1.0 - t) * 0.003;

    // Mouse interaction
    const mouseX = nx.get();
    const mouseY = ny.get();
    const mouseMoved =
      Math.abs(mouseX - lastMouseRef.current.x) > 0.001 ||
      Math.abs(mouseY - lastMouseRef.current.y) > 0.001;

    if (mouseMoved) {
      lastMouseRef.current.x = mouseX;
      lastMouseRef.current.y = mouseY;
      mouseActiveRef.current = true;
      framesSinceMouseMove.current = 0;
    } else {
      framesSinceMouseMove.current++;
      if (framesSinceMouseMove.current > 3) {
        mouseActiveRef.current = false;
      }
    }

    simMaterial.uniforms.uMouse.value.set(mouseX, mouseY);
    simMaterial.uniforms.uMouseActive.value = mouseActiveRef.current ? 1.0 : 0.0;

    // Simulation step: read A → write B
    simMaterial.uniforms.uTexture.value = rtA.texture;
    quad.material = simMaterial;
    renderer.setRenderTarget(rtB);
    renderer.render(simScene, simCamera);

    // Copy B → A for next frame
    simMaterial.uniforms.uTexture.value = rtB.texture;
    renderer.setRenderTarget(rtA);
    renderer.render(simScene, simCamera);

    // Reset render target so R3F can render to screen
    renderer.setRenderTarget(null);

    // Update display material uniforms — R3F renders this mesh to screen
    displayMaterial.uniforms.uTexture.value = rtA.texture;
    displayMaterial.uniforms.uTime.value = timeRef.current;
  });

  // Visible mesh in R3F's scene graph — material attached via useEffect
  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2, 2]} />
    </mesh>
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
          "radial-gradient(ellipse at 40% 35%, #050510 0%, #000000 55%, #000000 100%)",
        backgroundColor: "#000000",
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// Public component
// ---------------------------------------------------------------------------
export default function WebGLBackground({
  prefersReducedMotion = false,
  className,
}: {
  prefersReducedMotion?: boolean;
  className?: string;
}) {
  const { nx, ny } = useMousePosition();

  const onCreated = useCallback((state: { gl: THREE.WebGLRenderer }) => {
    state.gl.setClearColor(new THREE.Color("#000000"), 1);
  }, []);

  return (
    <div
      className={`fixed inset-0 -z-10 pointer-events-none ${className ?? ""}`}
      style={{ backgroundColor: "#000000" }}
    >
      <Canvas
        gl={{
          antialias: false,
          alpha: false,
          powerPreference: "high-performance",
          stencil: false,
          depth: false,
        }}
        dpr={[1, 1]}
        camera={{ position: [0, 0, 1] }}
        onCreated={onCreated}
        frameloop={prefersReducedMotion ? "demand" : "always"}
      >
        <Scene nx={nx} ny={ny} prefersReducedMotion={prefersReducedMotion} />
        <EffectComposer>
          <Bloom
            luminanceThreshold={0.6}
            intensity={0.25}
            luminanceSmoothing={0.5}
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
