"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { useReducedMotion } from "framer-motion";
import * as THREE from "three";

type Vec3 = [number, number, number];

type NodePoint = {
  position: Vec3;
  radius: number;
  tone: "teal" | "coral" | "violet" | "pearl";
  delay: number;
};

/**
 * Palette tokens renamed-by-vibe but kept structurally identical to the
 * original component (tealDeep/tealMid/tealLine/pearl/ivory/coral/violet/shadow)
 * so every call site below works unchanged. The values are repainted onto
 * the warm-cream + oxblood register that matches the rest of the page.
 *  tealDeep → deep oxblood (used as backbone attenuation + line stroke)
 *  tealMid  → warm gold (primary residue/back tube)
 *  tealLine → warmer ink (contact-trace line)
 *  pearl    → soft cream (light residues)
 *  ivory    → warm ivory (helix highlight + pulse bullet)
 *  coral    → keep — already warm
 *  violet   → muted oxblood (was the only cool accent — re-tuned)
 *  shadow   → warm near-black (ground tone)
 */
const palette = {
  tealDeep: "#9a3328",
  tealMid: "#c4956a",
  tealLine: "#7a6e58",
  pearl: "#f3ead7",
  ivory: "#fff4de",
  coral: "#f0a89b",
  violet: "#9a3328",
  shadow: "#23201a",
};

const backboneCurves: Vec3[][] = [
  [
    [-1.9, -0.82, 0.12],
    [-1.28, -0.12, 0.38],
    [-1.58, 0.92, -0.05],
    [-0.58, 1.5, 0.34],
    [0.34, 1.18, -0.34],
    [1.17, 1.58, 0.2],
    [1.78, 0.82, 0.46],
    [1.48, -0.24, -0.18],
    [0.68, -0.72, 0.46],
    [0.05, -1.4, -0.24],
    [-1.08, -1.24, 0.2],
    [-1.9, -0.82, 0.12],
  ],
  [
    [-1.22, 0.04, -0.34],
    [-0.6, 0.72, 0.48],
    [0.2, 0.28, 0.7],
    [0.9, 0.82, -0.26],
    [1.36, 0.0, -0.48],
    [0.72, -0.82, 0.28],
    [-0.18, -0.5, -0.62],
    [-0.74, -1.16, 0.2],
    [-1.38, -0.5, 0.54],
  ],
  [
    [-0.96, 1.08, 0.44],
    [-0.12, 1.58, -0.18],
    [0.74, 1.12, 0.34],
    [0.58, 0.22, -0.72],
    [1.3, -0.34, 0.18],
    [0.62, -1.16, 0.48],
    [-0.36, -0.86, -0.5],
    [-1.08, -0.04, -0.28],
  ],
];

const nodePoints: NodePoint[] = [
  { position: [-1.9, -0.82, 0.12], radius: 0.086, tone: "teal", delay: 0 },
  { position: [-1.58, 0.92, -0.05], radius: 0.065, tone: "violet", delay: 0.16 },
  { position: [-0.58, 1.5, 0.34], radius: 0.096, tone: "coral", delay: 0.28 },
  { position: [0.34, 1.18, -0.34], radius: 0.068, tone: "pearl", delay: 0.42 },
  { position: [1.17, 1.58, 0.2], radius: 0.092, tone: "teal", delay: 0.56 },
  { position: [1.78, 0.82, 0.46], radius: 0.07, tone: "pearl", delay: 0.7 },
  { position: [1.48, -0.24, -0.18], radius: 0.104, tone: "violet", delay: 0.84 },
  { position: [0.68, -0.72, 0.46], radius: 0.064, tone: "pearl", delay: 0.98 },
  { position: [0.05, -1.4, -0.24], radius: 0.092, tone: "teal", delay: 1.12 },
  { position: [-1.08, -1.24, 0.2], radius: 0.074, tone: "coral", delay: 1.26 },
  { position: [-1.22, 0.04, -0.34], radius: 0.066, tone: "pearl", delay: 0.34 },
  { position: [0.2, 0.28, 0.7], radius: 0.078, tone: "coral", delay: 0.68 },
  { position: [0.9, 0.82, -0.26], radius: 0.058, tone: "pearl", delay: 0.9 },
  { position: [-0.36, -0.86, -0.5], radius: 0.062, tone: "pearl", delay: 1.08 },
];

const contactCurves: Vec3[][] = [
  [
    [-1.9, -0.82, 0.12],
    [-1.44, 0.2, 0.28],
    [-0.58, 1.5, 0.34],
  ],
  [
    [-1.58, 0.92, -0.05],
    [-0.38, 0.56, 0.82],
    [1.17, 1.58, 0.2],
  ],
  [
    [-0.58, 1.5, 0.34],
    [0.55, 0.84, -0.64],
    [1.48, -0.24, -0.18],
  ],
  [
    [-1.22, 0.04, -0.34],
    [-0.16, -0.1, 0.92],
    [0.68, -0.72, 0.46],
  ],
  [
    [-1.08, -1.24, 0.2],
    [0.08, -0.12, -0.92],
    [1.78, 0.82, 0.46],
  ],
  [
    [0.05, -1.4, -0.24],
    [0.72, -0.26, 0.74],
    [0.9, 0.82, -0.26],
  ],
  [
    [-1.9, -0.82, 0.12],
    [-0.62, -1.78, 0.08],
    [0.05, -1.4, -0.24],
  ],
];

function makeCurve(points: Vec3[], closed = false) {
  return new THREE.CatmullRomCurve3(
    points.map((point) => new THREE.Vector3(...point)),
    closed,
    "catmullrom",
    0.46,
  );
}

function helixPoints({
  center,
  radius,
  height,
  turns,
  phase = 0,
  tilt = 0,
}: {
  center: Vec3;
  radius: number;
  height: number;
  turns: number;
  phase?: number;
  tilt?: number;
}) {
  const points: Vec3[] = [];
  const cosTilt = Math.cos(tilt);
  const sinTilt = Math.sin(tilt);

  for (let index = 0; index <= 92; index += 1) {
    const t = index / 92;
    const angle = phase + t * turns * Math.PI * 2;
    const localX = Math.cos(angle) * radius;
    const localY = (t - 0.5) * height;
    const localZ = Math.sin(angle) * radius;
    points.push([
      center[0] + localX * cosTilt - localY * sinTilt,
      center[1] + localX * sinTilt + localY * cosTilt,
      center[2] + localZ,
    ]);
  }

  return points;
}

function ProteinTube({
  points,
  radius,
  color,
  emissive = "#000000",
  opacity = 1,
  tubularSegments = 140,
}: {
  points: Vec3[];
  radius: number;
  color: string;
  emissive?: string;
  opacity?: number;
  tubularSegments?: number;
}) {
  const curve = useMemo(() => makeCurve(points), [points]);

  return (
    <mesh>
      <tubeGeometry args={[curve, tubularSegments, radius, 18, false]} />
      <meshPhysicalMaterial
        color={color}
        roughness={0.38}
        metalness={0.02}
        clearcoat={0.55}
        clearcoatRoughness={0.42}
        transparent={opacity < 1}
        opacity={opacity}
        emissive={emissive}
        emissiveIntensity={0.08}
      />
    </mesh>
  );
}

function ContactTrace({
  points,
  offset,
  reduceMotion,
}: {
  points: Vec3[];
  offset: number;
  reduceMotion: boolean;
}) {
  const curve = useMemo(() => makeCurve(points), [points]);
  const pulseRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!pulseRef.current || reduceMotion) return;
    const t = (clock.elapsedTime * 0.13 + offset) % 1;
    const point = curve.getPointAt(t);
    pulseRef.current.position.copy(point);
    pulseRef.current.scale.setScalar(0.75 + Math.sin(clock.elapsedTime * 4 + offset * 8) * 0.12);
  });

  return (
    <group>
      <mesh>
        <tubeGeometry args={[curve, 80, 0.006, 8, false]} />
        <meshBasicMaterial
          color={palette.tealLine}
          transparent
          opacity={0.34}
          depthWrite={false}
        />
      </mesh>
      <mesh ref={pulseRef}>
        <sphereGeometry args={[0.034, 18, 12]} />
        <meshBasicMaterial
          color={palette.ivory}
          transparent
          opacity={reduceMotion ? 0 : 0.9}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

function ResidueNode({
  node,
  reduceMotion,
}: {
  node: NodePoint;
  reduceMotion: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const color =
    node.tone === "coral"
      ? palette.coral
      : node.tone === "violet"
        ? palette.violet
        : node.tone === "teal"
          ? palette.tealMid
          : palette.pearl;

  useFrame(({ clock }) => {
    if (reduceMotion) return;
    // Gentler, more meditative pulse (was 2.1 / 0.22 / 1.15 — read anxious)
    const wave = (Math.sin(clock.elapsedTime * 1.6 + node.delay * 5.5) + 1) / 2;
    if (meshRef.current) {
      meshRef.current.scale.setScalar(1 + wave * 0.16);
    }
    if (haloRef.current) {
      haloRef.current.scale.setScalar(1.25 + wave * 0.95);
      const material = haloRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = 0.06 + wave * 0.20;
    }
    if (materialRef.current) {
      materialRef.current.emissiveIntensity = 0.22 + wave * 0.5;
    }
  });

  return (
    <group position={node.position}>
      <mesh ref={haloRef}>
        <sphereGeometry args={[node.radius * 2.2, 24, 16]} />
        <meshBasicMaterial
          color={node.tone === "violet" ? palette.violet : node.tone === "coral" ? palette.coral : palette.tealMid}
          transparent
          opacity={0.16}
          depthWrite={false}
        />
      </mesh>
      <mesh ref={meshRef}>
        <sphereGeometry args={[node.radius, 32, 20]} />
        <meshPhysicalMaterial
          ref={materialRef}
          color={color}
          roughness={0.18}
          metalness={0.02}
          clearcoat={0.95}
          clearcoatRoughness={0.14}
          transmission={node.tone === "pearl" ? 0.35 : 0.12}
          ior={1.35}
          thickness={node.radius * 1.6}
          emissive={color}
          emissiveIntensity={0.32}
        />
      </mesh>
    </group>
  );
}

function SheetBlock({
  position,
  rotation,
  color,
}: {
  position: Vec3;
  rotation: Vec3;
  color: string;
}) {
  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={[0.72, 0.115, 0.034]} />
      <meshPhysicalMaterial
        color={color}
        roughness={0.36}
        clearcoat={0.45}
        transparent
        opacity={0.78}
        emissive={color}
        emissiveIntensity={0.06}
      />
    </mesh>
  );
}

function ProteinScene({ reduceMotion }: { reduceMotion: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const helixA = useMemo(
    () =>
      helixPoints({
        center: [-0.58, 0.52, 0.08],
        radius: 0.17,
        height: 1.28,
        turns: 4.2,
        tilt: -0.7,
      }),
    [],
  );
  const helixB = useMemo(
    () =>
      helixPoints({
        center: [0.74, 0.48, -0.08],
        radius: 0.145,
        height: 1.02,
        turns: 3.5,
        phase: 1.1,
        tilt: 0.82,
      }),
    [],
  );

  useFrame(({ clock, pointer }) => {
    if (!groupRef.current) return;
    const targetY = pointer.x * 0.16 + Math.sin(clock.elapsedTime * 0.18) * 0.08;
    const targetX = -0.14 + pointer.y * -0.08;
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetY, 0.045);
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetX, 0.045);
    if (!reduceMotion) {
      groupRef.current.position.y = Math.sin(clock.elapsedTime * 0.42) * 0.035;
    }
  });

  return (
    <>
      {/* Warm-dominant three-point rig + ONE cold-pearl back-rim for silhouette */}
      <ambientLight intensity={1.05} color={palette.pearl} />
      <directionalLight position={[3.2, 4.6, 5.2]} intensity={2.2} color="#fff7ea" />
      <pointLight position={[-3.4, -2.6, 2.2]} intensity={1.8} color={palette.coral} />
      <pointLight position={[2.8, 1.8, -1.4]} intensity={1.3} color={palette.tealMid} />
      {/* Cold-pearl back-rim: only cool light, separates the protein silhouette from cream bg */}
      <pointLight position={[0.6, 1.6, -3.8]} intensity={1.0} color="#b6c8d0" distance={12} decay={1.7} />

      <group ref={groupRef} scale={0.72} position={[0, -0.02, 0]}>
        {/* Soft warm shroud — gives the structure an atmosphere on cream */}
        <mesh scale={[1.75, 1.4, 0.86]} rotation={[0.12, -0.2, 0.06]}>
          <sphereGeometry args={[1.08, 64, 32]} />
          <meshPhysicalMaterial
            color={palette.pearl}
            roughness={0.72}
            transparent
            opacity={0.08}
            depthWrite={false}
            emissive={palette.coral}
            emissiveIntensity={0.10}
          />
        </mesh>

        {contactCurves.map((points, index) => (
          <ContactTrace
            key={points.flat().join("-")}
            points={points}
            offset={index * 0.13}
            reduceMotion={reduceMotion}
          />
        ))}

        <ProteinTube
          points={backboneCurves[0]}
          radius={0.076}
          color={palette.tealMid}
          emissive={palette.tealLine}
        />
        <ProteinTube
          points={backboneCurves[1]}
          radius={0.055}
          color={palette.ivory}
          emissive={palette.tealMid}
          opacity={0.92}
        />
        <ProteinTube
          points={backboneCurves[2]}
          radius={0.047}
          color={palette.tealDeep}
          emissive={palette.tealDeep}
          opacity={0.76}
        />
        <ProteinTube
          points={helixA}
          radius={0.034}
          color={palette.ivory}
          emissive={palette.coral}
          opacity={0.96}
          tubularSegments={110}
        />
        <ProteinTube
          points={helixB}
          radius={0.032}
          color={palette.tealMid}
          emissive={palette.violet}
          opacity={0.9}
          tubularSegments={100}
        />

        <SheetBlock
          position={[0.86, -0.58, 0.22]}
          rotation={[0.12, -0.5, -0.42]}
          color={palette.ivory}
        />
        <SheetBlock
          position={[0.44, -1.05, -0.16]}
          rotation={[0.48, 0.32, 0.35]}
          color={palette.tealMid}
        />
        <SheetBlock
          position={[-1.28, -0.3, 0.36]}
          rotation={[0.22, -0.8, -0.16]}
          color={palette.coral}
        />

        {nodePoints.map((node) => (
          <ResidueNode
            key={node.position.join(",")}
            node={node}
            reduceMotion={reduceMotion}
          />
        ))}
      </group>
    </>
  );
}

function FieldOverlay() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 1120 860"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern id="proteinSceneGrid" width="54" height="54" patternUnits="userSpaceOnUse">
          <path
            d="M54 0H0V54"
            fill="none"
            stroke="rgba(35,32,26,0.07)"
            strokeWidth="0.85"
          />
          <circle cx="0" cy="0" r="1.15" fill="rgba(154,51,40,0.14)" />
        </pattern>
        <radialGradient id="proteinSceneGlow" cx="58%" cy="50%" r="62%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.42" />
          <stop offset="50%" stopColor="#f0c5b0" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#f4ede0" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1120" height="860" fill="url(#proteinSceneGrid)" opacity="0.5" />
      <rect width="1120" height="860" fill="url(#proteinSceneGlow)" />
      <path
        d="M88 710 C236 624 361 734 520 690 C694 642 789 724 1018 592"
        fill="none"
        stroke="rgba(154,51,40,0.16)"
        strokeWidth="1.1"
        strokeDasharray="4 12"
      />
    </svg>
  );
}

export function AIProteinConstruct({ className = "" }: { className?: string }) {
  const shouldReduceMotion = Boolean(useReducedMotion());

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-auto relative h-full min-h-[26rem] w-full overflow-hidden ${className}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_58%_50%,rgba(240,168,155,0.18),rgba(245,238,225,0)_60%),radial-gradient(ellipse_at_28%_25%,rgba(255,250,242,0.78),rgba(255,250,242,0)_54%)]" />
      <FieldOverlay />
      <Canvas
        className="absolute inset-0"
        dpr={[1, 2]}
        camera={{ position: [0, 0, 6.9], fov: 35 }}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      >
        <ProteinScene reduceMotion={shouldReduceMotion} />
        <EffectComposer multisampling={0}>
          {/* Calmer bloom — threshold raised so cream tubes don't blow out, only emissive peaks glow */}
          <Bloom intensity={0.42} luminanceThreshold={0.55} luminanceSmoothing={0.45} mipmapBlur />
        </EffectComposer>
      </Canvas>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_55%_52%,rgba(245,238,225,0)_44%,rgba(245,238,225,0.10)_72%,rgba(245,238,225,0.72)_100%),linear-gradient(90deg,rgba(245,238,225,0.46),rgba(245,238,225,0)_22%,rgba(245,238,225,0)_75%,rgba(245,238,225,0.32))]" />
    </div>
  );
}
