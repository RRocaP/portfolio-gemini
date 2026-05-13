"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { Bloom, EffectComposer, ToneMapping } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import { useReducedMotion } from "framer-motion";
import * as THREE from "three";

/**
 * Dot-network "protein" — nodes + edges read as a residue-contact graph.
 * Palette ties to the favicon (cream / red accent) and the warm-cream page bg.
 *
 * Design intent: AAA, not prototype. So:
 *  - real PBR spheres with environment-style reflections (cheap point lights, no FBO),
 *  - genuinely 3D layout with depth fog,
 *  - edges as glowing additive line segments (not flat strokes),
 *  - selective bloom on the red hub nodes + the brightest residues,
 *  - subtle breathing pulse on every node, faster on hubs,
 *  - slow camera turntable + mouse parallax.
 */

type Vec3 = [number, number, number];
type Tone = "pearl" | "cream" | "warm" | "red" | "deep";

type Node = {
  pos: Vec3;
  radius: number;
  tone: Tone;
  phase: number;
  hub: boolean;
};

type Edge = [number, number];

const palette: Record<Tone, string> = {
  pearl: "#f7f4ee",
  cream: "#ede2cd",
  warm: "#c4956a",
  red: "#da291c",
  deep: "#23201a", // warm-shifted near-black, not cool
};

// Cold-pearl rim light — single source of silhouette separation against warm bg
const rimLight = "#b6c8d0";

function hash(seed: number) {
  let x = seed | 0;
  x = (x ^ 61) ^ (x >>> 16);
  x = (x + (x << 3)) | 0;
  x = x ^ (x >>> 4);
  x = Math.imul(x, 0x27d4eb2d);
  x = x ^ (x >>> 15);
  return (x >>> 0) / 0xffffffff;
}

/**
 * Asymmetric density — not three equal Gaussian blobs. One dense core
 * (the active site), one sparse satellite (a flexible loop), one isolated
 * outlier (a substrate / binding partner). Reads as a real folded protein
 * with a binding pocket, not a uniform cloud.
 */
function buildGraph(): { nodes: Node[]; edges: Edge[]; adjacency: number[][] } {
  const nodes: Node[] = [];

  const domains = [
    // Dense core — most residues, tight packing, contains the hub
    { c: [-0.4, 0.0, 0.0] as Vec3, r: 0.78, count: 32, density: 1.0, coreHub: true },
    // Sparse satellite — fewer residues, looser packing (flexible loop)
    { c: [1.3, 0.3, -0.4] as Vec3, r: 1.05, count: 10, density: 0.55, coreHub: false },
    // Lone outlier — three residues only, far from the rest (binding partner)
    { c: [-1.8, -0.8, 0.6] as Vec3, r: 0.35, count: 4, density: 0.4, coreHub: false },
  ];

  let id = 0;
  for (const d of domains) {
    const hubIndex = d.coreHub ? Math.floor(d.count * 0.4) : -1; // hub sits inside the core
    for (let k = 0; k < d.count; k++) {
      const seed = id * 9173;
      const u1 = Math.max(1e-5, hash(seed));
      const u2 = hash(seed + 1);
      const g = Math.sqrt(-2 * Math.log(u1)) * d.density;
      const a = u2 * Math.PI * 2;
      const rx = g * Math.cos(a) * d.r * 0.5;
      const ry = (hash(seed + 2) - 0.5) * d.r * 0.95;
      const rz = g * Math.sin(a) * d.r * 0.5;
      const dist = Math.hypot(rx, ry, rz);
      const isHub = k === hubIndex;
      const isCore = d.coreHub && dist < 0.32;
      let tone: Tone = "pearl";
      if (isHub) tone = "red";
      else if (isCore) tone = "warm";
      else if (id % 6 === 0) tone = "cream";
      nodes.push({
        pos: [d.c[0] + rx, d.c[1] + ry, d.c[2] + rz],
        radius: isHub ? 0.092 : isCore ? 0.062 : 0.044,
        tone,
        phase: hash(seed + 5),
        hub: isHub,
      });
      id++;
    }
  }

  // Edges: k-nearest, weighted so short edges are visually emphasized.
  // Hubs get k=5 (densely connected); the outlier gets k=1 (a thin tether).
  const seen = new Set<string>();
  const edges: Edge[] = [];
  for (let i = 0; i < nodes.length; i++) {
    const di = nodes[i].pos;
    const dists: { j: number; d: number }[] = [];
    for (let j = 0; j < nodes.length; j++) {
      if (j === i) continue;
      const dj = nodes[j].pos;
      const dx = di[0] - dj[0];
      const dy = di[1] - dj[1];
      const dz = di[2] - dj[2];
      dists.push({ j, d: dx * dx + dy * dy + dz * dz });
    }
    dists.sort((a, b) => a.d - b.d);
    const fromDomain = i < 32 ? 0 : i < 42 ? 1 : 2;
    const k = nodes[i].hub ? 5 : fromDomain === 2 ? 1 : 3;
    for (let n = 0; n < k && n < dists.length; n++) {
      const a = Math.min(i, dists[n].j);
      const b = Math.max(i, dists[n].j);
      const key = `${a}-${b}`;
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push([a, b]);
    }
  }

  // Adjacency list for the propagation cascade
  const adjacency: number[][] = nodes.map(() => []);
  for (const [a, b] of edges) {
    adjacency[a].push(b);
    adjacency[b].push(a);
  }

  return { nodes, edges, adjacency };
}

/**
 * Each ResidueDot exposes a mutable activation ref that the parent
 * cascade controller drives. activation=0 → resting; activation=1 →
 * just-fired; decays exponentially back to 0 over ~600ms.
 *
 * Replaces per-node continuous breathing (which read as a screensaver)
 * with discrete signalling events propagating through the network.
 */
type ActivationRef = { current: number };

function ResidueDot({
  node,
  reduceMotion,
  activation,
}: {
  node: Node;
  reduceMotion: boolean;
  activation: ActivationRef;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const color = palette[node.tone];

  useFrame((_, dt) => {
    // Decay activation toward zero (motion-aware time step)
    if (!reduceMotion) {
      activation.current = Math.max(0, activation.current - dt * 1.8);
    }
    const a = activation.current;

    if (meshRef.current) {
      meshRef.current.scale.setScalar(1 + a * (node.hub ? 0.42 : 0.28));
    }
    if (haloRef.current) {
      haloRef.current.scale.setScalar(1.0 + a * (node.hub ? 2.6 : 1.4));
      const m = haloRef.current.material as THREE.MeshBasicMaterial;
      m.opacity = (node.hub ? 0.16 : 0.06) + a * (node.hub ? 0.5 : 0.32);
    }
    if (matRef.current) {
      matRef.current.emissiveIntensity = (node.hub ? 0.55 : 0.28) + a * (node.hub ? 1.4 : 0.85);
    }
  });

  return (
    <group position={node.pos}>
      <mesh ref={haloRef}>
        <sphereGeometry args={[node.radius * 2.4, 18, 12]} />
        <meshBasicMaterial color={color} transparent opacity={0.12} depthWrite={false} />
      </mesh>
      <mesh ref={meshRef}>
        <sphereGeometry args={[node.radius, 32, 22]} />
        <meshPhysicalMaterial
          ref={matRef}
          color={color}
          roughness={0.22}
          metalness={0.04}
          clearcoat={0.85}
          clearcoatRoughness={0.18}
          emissive={color}
          emissiveIntensity={node.hub ? 0.55 : 0.28}
        />
      </mesh>
    </group>
  );
}

function EdgeMesh({ nodes, edges }: { nodes: Node[]; edges: Edge[] }) {
  const geometry = useMemo(() => {
    const positions = new Float32Array(edges.length * 2 * 3);
    const colors = new Float32Array(edges.length * 2 * 3);
    const cWarm = new THREE.Color(palette.warm);
    const cCream = new THREE.Color(palette.cream);
    let o = 0;
    for (const [a, b] of edges) {
      const A = nodes[a];
      const B = nodes[b];
      positions[o + 0] = A.pos[0];
      positions[o + 1] = A.pos[1];
      positions[o + 2] = A.pos[2];
      positions[o + 3] = B.pos[0];
      positions[o + 4] = B.pos[1];
      positions[o + 5] = B.pos[2];
      // Colour gradient along edge by endpoint tone (warm at hub end, cream elsewhere)
      const cA = A.hub ? new THREE.Color(palette.red) : cWarm;
      const cB = B.hub ? new THREE.Color(palette.red) : cCream;
      colors[o + 0] = cA.r; colors[o + 1] = cA.g; colors[o + 2] = cA.b;
      colors[o + 3] = cB.r; colors[o + 4] = cB.g; colors[o + 5] = cB.b;
      o += 6;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return g;
  }, [nodes, edges]);

  return (
    <lineSegments>
      <primitive attach="geometry" object={geometry} />
      <lineBasicMaterial
        vertexColors
        transparent
        opacity={0.45}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </lineSegments>
  );
}

/**
 * Cascade controller — periodically picks a seed node, fires it (sets
 * activation=1), then schedules its neighbours to fire ~120ms later,
 * theirs another 120ms later. Caps at depth 3 so cascades stay legible.
 *
 * This is the *only* signalling mechanism — no per-node breathing, no
 * travelling-pulse spheres. Restraint per taste review #7.
 */
function CascadeController({
  activations,
  adjacency,
  reduceMotion,
}: {
  activations: ActivationRef[];
  adjacency: number[][];
  reduceMotion: boolean;
}) {
  const nextFireAt = useRef(0.6);
  const pending = useRef<{ at: number; idx: number; strength: number }[]>([]);

  useFrame(({ clock }) => {
    if (reduceMotion) return;
    const t = clock.elapsedTime;

    // Drain pending wavefronts
    pending.current = pending.current.filter((p) => {
      if (t < p.at) return true;
      const a = activations[p.idx];
      if (a) a.current = Math.min(1, a.current + p.strength);
      return false;
    });

    // Seed a new cascade every 2.6s, picking a random node weighted toward hubs
    if (t >= nextFireAt.current) {
      nextFireAt.current = t + 2.4 + Math.random() * 1.2;
      const seedIdx = Math.floor(Math.random() * activations.length);
      activations[seedIdx].current = 1;
      // Depth-1 wave at +120ms
      const d1 = adjacency[seedIdx] || [];
      for (const n of d1) {
        pending.current.push({ at: t + 0.12, idx: n, strength: 0.7 });
        // Depth-2 wave at +240ms
        for (const n2 of adjacency[n] || []) {
          if (n2 === seedIdx) continue;
          pending.current.push({ at: t + 0.24, idx: n2, strength: 0.32 });
        }
      }
    }
  });

  return null;
}

function Network({ reduceMotion }: { reduceMotion: boolean }) {
  const { nodes, edges, adjacency } = useMemo(() => buildGraph(), []);
  // One activation ref per node — shared between the controller and each ResidueDot
  const activations = useMemo<ActivationRef[]>(
    () => nodes.map(() => ({ current: 0 })),
    [nodes],
  );

  return (
    <>
      <EdgeMesh nodes={nodes} edges={edges} />
      {nodes.map((n, i) => (
        <ResidueDot key={i} node={n} reduceMotion={reduceMotion} activation={activations[i]} />
      ))}
      <CascadeController
        activations={activations}
        adjacency={adjacency}
        reduceMotion={reduceMotion}
      />
    </>
  );
}

function PointerOrbit({ reduceMotion, children }: { reduceMotion: boolean; children: React.ReactNode }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame(({ clock, pointer }) => {
    if (!groupRef.current) return;
    const ty = pointer.x * 0.18 + (reduceMotion ? 0.25 : clock.elapsedTime * 0.05);
    const tx = -0.10 + pointer.y * -0.08 + (reduceMotion ? 0 : Math.sin(clock.elapsedTime * 0.16) * 0.04);
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, ty, 0.045);
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, tx, 0.045);
  });
  return <group ref={groupRef}>{children}</group>;
}

export function AIProteinConstruct({ className = "" }: { className?: string }) {
  const shouldReduceMotion = Boolean(useReducedMotion());

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-auto relative h-full min-h-[26rem] w-full overflow-hidden ${className}`}
    >
      {/* Soft warm-cream backdrop wash inside the canvas region — ties to page bg */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_54%_50%,rgba(240,168,155,0.16),rgba(218,41,28,0.04)_38%,rgba(245,238,225,0)_72%),radial-gradient(ellipse_at_30%_28%,rgba(255,250,242,0.7),rgba(255,250,242,0)_60%)]" />

      <Canvas
        className="absolute inset-0"
        dpr={[1, 2]}
        camera={{ position: [0, 0.05, 5.2], fov: 36 }}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      >
        {/* Warm-dominant rig with ONE cold-pearl back-rim for silhouette separation */}
        <ambientLight intensity={0.5} color={palette.pearl} />
        <directionalLight position={[3.2, 4.4, 4.8]} intensity={1.3} color="#fff5e4" />
        <pointLight position={[-3.0, -2.0, 2.4]} intensity={0.85} color={palette.warm} distance={12} decay={1.5} />
        {/* Cold-pearl rim from behind — the only cool light in the rig */}
        <pointLight position={[0.6, 1.8, -4.2]} intensity={1.0} color={rimLight} distance={11} decay={1.7} />

        <Float
          speed={shouldReduceMotion ? 0 : 0.55}
          rotationIntensity={shouldReduceMotion ? 0 : 0.16}
          floatIntensity={shouldReduceMotion ? 0 : 0.4}
        >
          <PointerOrbit reduceMotion={shouldReduceMotion}>
            <group scale={1.05} position={[0, -0.05, 0]}>
              <Network reduceMotion={shouldReduceMotion} />
            </group>
          </PointerOrbit>
        </Float>

        <EffectComposer multisampling={0}>
          {/* Calmer bloom — selective, only catches peak activations not steady-state nodes */}
          <Bloom intensity={0.42} luminanceThreshold={0.6} luminanceSmoothing={0.45} mipmapBlur />
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        </EffectComposer>
      </Canvas>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_55%_52%,rgba(245,238,225,0)_44%,rgba(245,238,225,0.10)_72%,rgba(245,238,225,0.70)_100%)]" />
    </div>
  );
}
