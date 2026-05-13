"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  ContactShadows,
  Float,
  MeshTransmissionMaterial,
} from "@react-three/drei";
import { Bloom, EffectComposer, N8AO, ToneMapping } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import { useReducedMotion } from "framer-motion";
import * as THREE from "three";
import { SceneLighting } from "./_scene/lighting";
import { scenePalette } from "./_scene/palette";

type Vec3 = [number, number, number];

type NodePoint = {
  position: Vec3;
  radius: number;
  tone: "teal" | "coral" | "violet" | "pearl";
  delay: number;
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
  { position: [-1.9, -0.82, 0.12], radius: 0.10, tone: "teal", delay: 0 },
  { position: [-1.58, 0.92, -0.05], radius: 0.08, tone: "violet", delay: 0.16 },
  { position: [-0.58, 1.5, 0.34], radius: 0.11, tone: "coral", delay: 0.28 },
  { position: [0.34, 1.18, -0.34], radius: 0.07, tone: "pearl", delay: 0.42 },
  { position: [1.17, 1.58, 0.2], radius: 0.10, tone: "teal", delay: 0.56 },
  { position: [1.78, 0.82, 0.46], radius: 0.075, tone: "pearl", delay: 0.7 },
  { position: [1.48, -0.24, -0.18], radius: 0.115, tone: "violet", delay: 0.84 },
  { position: [0.68, -0.72, 0.46], radius: 0.07, tone: "pearl", delay: 0.98 },
  { position: [0.05, -1.4, -0.24], radius: 0.10, tone: "teal", delay: 1.12 },
  { position: [-1.08, -1.24, 0.2], radius: 0.08, tone: "coral", delay: 1.26 },
  { position: [-1.22, 0.04, -0.34], radius: 0.075, tone: "pearl", delay: 0.34 },
  { position: [0.2, 0.28, 0.7], radius: 0.085, tone: "coral", delay: 0.68 },
  { position: [0.9, 0.82, -0.26], radius: 0.065, tone: "pearl", delay: 0.9 },
  { position: [-0.36, -0.86, -0.5], radius: 0.07, tone: "pearl", delay: 1.08 },
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

function makeCurve(points: Vec3[]) {
  return new THREE.CatmullRomCurve3(
    points.map((p) => new THREE.Vector3(...p)),
    false,
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
  const cos = Math.cos(tilt);
  const sin = Math.sin(tilt);
  for (let i = 0; i <= 92; i++) {
    const t = i / 92;
    const a = phase + t * turns * Math.PI * 2;
    const x = Math.cos(a) * radius;
    const y = (t - 0.5) * height;
    const z = Math.sin(a) * radius;
    points.push([center[0] + x * cos - y * sin, center[1] + x * sin + y * cos, center[2] + z]);
  }
  return points;
}

function GlassTube({
  points,
  radius,
  color,
  attenuation = scenePalette.tealDeep,
  thickness = 0.7,
  ior = 1.35,
  tubularSegments = 140,
}: {
  points: Vec3[];
  radius: number;
  color: string;
  attenuation?: string;
  thickness?: number;
  ior?: number;
  tubularSegments?: number;
}) {
  const curve = useMemo(() => makeCurve(points), [points]);
  return (
    <mesh>
      <tubeGeometry args={[curve, tubularSegments, radius, 18, false]} />
      <MeshTransmissionMaterial
        backside
        backsideThickness={0.4}
        thickness={thickness}
        roughness={0.12}
        chromaticAberration={0.03}
        anisotropy={0.4}
        distortion={0.18}
        distortionScale={0.4}
        temporalDistortion={0.06}
        ior={ior}
        color={color}
        attenuationColor={attenuation}
        attenuationDistance={1.4}
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
        <tubeGeometry args={[curve, 80, 0.005, 8, false]} />
        <meshBasicMaterial color={scenePalette.tealDeep} transparent opacity={0.32} depthWrite={false} />
      </mesh>
      <mesh ref={pulseRef}>
        <sphereGeometry args={[0.032, 18, 12]} />
        <meshBasicMaterial
          color={scenePalette.ivory}
          transparent
          opacity={reduceMotion ? 0 : 0.95}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

function ResidueNode({ node, reduceMotion }: { node: NodePoint; reduceMotion: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const color =
    node.tone === "coral"
      ? scenePalette.coral
      : node.tone === "violet"
        ? scenePalette.violet
        : node.tone === "teal"
          ? scenePalette.teal
          : scenePalette.pearl;
  const attenuation =
    node.tone === "coral"
      ? scenePalette.coralDeep
      : node.tone === "violet"
        ? scenePalette.violetDeep
        : node.tone === "teal"
          ? scenePalette.tealDeep
          : scenePalette.teal;

  useFrame(({ clock }) => {
    if (reduceMotion) return;
    const wave = (Math.sin(clock.elapsedTime * 1.9 + node.delay * 5.5) + 1) / 2;
    if (meshRef.current) meshRef.current.scale.setScalar(1 + wave * 0.14);
    if (haloRef.current) {
      haloRef.current.scale.setScalar(1.6 + wave * 1.0);
      const m = haloRef.current.material as THREE.MeshBasicMaterial;
      m.opacity = 0.04 + wave * 0.14;
    }
  });

  return (
    <group position={node.position}>
      <mesh ref={haloRef}>
        <sphereGeometry args={[node.radius * 2.4, 22, 14]} />
        <meshBasicMaterial color={color} transparent opacity={0.10} depthWrite={false} />
      </mesh>
      <mesh ref={meshRef}>
        <sphereGeometry args={[node.radius, 36, 24]} />
        <MeshTransmissionMaterial
          backside
          backsideThickness={node.radius * 1.8}
          thickness={node.radius * 1.6}
          roughness={0.05}
          chromaticAberration={0.05}
          anisotropy={0.2}
          distortion={0.04}
          ior={1.4}
          color={color}
          attenuationColor={attenuation}
          attenuationDistance={0.6}
        />
      </mesh>
    </group>
  );
}

function SheetBlock({
  position,
  rotation,
  color,
  attenuation,
}: {
  position: Vec3;
  rotation: Vec3;
  color: string;
  attenuation: string;
}) {
  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={[0.74, 0.12, 0.04]} />
      <MeshTransmissionMaterial
        backside
        backsideThickness={0.18}
        thickness={0.22}
        roughness={0.1}
        chromaticAberration={0.04}
        distortion={0.06}
        ior={1.42}
        color={color}
        attenuationColor={attenuation}
        attenuationDistance={1.0}
      />
    </mesh>
  );
}

function ProteinAssembly({ reduceMotion }: { reduceMotion: boolean }) {
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

  return (
    <>
      {contactCurves.map((points) => (
        <ContactTrace
          key={points.flat().join("-")}
          points={points}
          offset={Math.random()}
          reduceMotion={reduceMotion}
        />
      ))}

      <GlassTube
        points={backboneCurves[0]}
        radius={0.085}
        color={scenePalette.teal}
        attenuation={scenePalette.tealDeep}
        thickness={0.8}
      />
      <GlassTube
        points={backboneCurves[1]}
        radius={0.06}
        color={scenePalette.ivory}
        attenuation={scenePalette.teal}
        thickness={0.5}
      />
      <GlassTube
        points={backboneCurves[2]}
        radius={0.05}
        color={scenePalette.pearl}
        attenuation={scenePalette.tealDeep}
        thickness={0.45}
      />
      <GlassTube
        points={helixA}
        radius={0.038}
        color={scenePalette.ivory}
        attenuation={scenePalette.coral}
        thickness={0.32}
        tubularSegments={110}
      />
      <GlassTube
        points={helixB}
        radius={0.034}
        color={scenePalette.teal}
        attenuation={scenePalette.violet}
        thickness={0.28}
        tubularSegments={100}
      />

      <SheetBlock
        position={[0.86, -0.58, 0.22]}
        rotation={[0.12, -0.5, -0.42]}
        color={scenePalette.ivory}
        attenuation={scenePalette.teal}
      />
      <SheetBlock
        position={[0.44, -1.05, -0.16]}
        rotation={[0.48, 0.32, 0.35]}
        color={scenePalette.teal}
        attenuation={scenePalette.tealDeep}
      />
      <SheetBlock
        position={[-1.28, -0.3, 0.36]}
        rotation={[0.22, -0.8, -0.16]}
        color={scenePalette.coral}
        attenuation={scenePalette.coralDeep}
      />

      {nodePoints.map((node) => (
        <ResidueNode key={node.position.join(",")} node={node} reduceMotion={reduceMotion} />
      ))}
    </>
  );
}

function PointerOrbit({ reduceMotion, children }: { reduceMotion: boolean; children: React.ReactNode }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock, pointer }) => {
    if (!groupRef.current) return;
    const ty = pointer.x * 0.18 + (reduceMotion ? 0 : Math.sin(clock.elapsedTime * 0.18) * 0.06);
    const tx = -0.10 + pointer.y * -0.08;
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
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_58%_50%,rgba(116,216,207,0.32),rgba(234,254,239,0)_60%),radial-gradient(ellipse_at_28%_25%,rgba(255,255,255,0.86),rgba(255,255,255,0)_56%)]" />
      <Canvas
        className="absolute inset-0"
        dpr={[1, 2]}
        camera={{ position: [0, 0.05, 6.6], fov: 34 }}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      >
        <SceneLighting />

        <Float
          speed={shouldReduceMotion ? 0 : 0.55}
          rotationIntensity={shouldReduceMotion ? 0 : 0.18}
          floatIntensity={shouldReduceMotion ? 0 : 0.45}
        >
          <PointerOrbit reduceMotion={shouldReduceMotion}>
            <group scale={0.74} position={[0, -0.02, 0]}>
              <ProteinAssembly reduceMotion={shouldReduceMotion} />
            </group>
          </PointerOrbit>
        </Float>

        <ContactShadows
          position={[0, -1.62, 0]}
          opacity={0.28}
          scale={6}
          blur={2.4}
          far={3.6}
          color={scenePalette.ink}
        />

        <EffectComposer multisampling={0} enableNormalPass>
          <N8AO aoRadius={0.4} intensity={2.2} aoSamples={16} denoiseSamples={4} />
          <Bloom intensity={0.55} luminanceThreshold={0.34} luminanceSmoothing={0.42} mipmapBlur />
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        </EffectComposer>
      </Canvas>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_55%_52%,rgba(234,254,239,0)_44%,rgba(234,254,239,0.08)_70%,rgba(234,254,239,0.72)_100%),linear-gradient(90deg,rgba(234,254,239,0.5),rgba(234,254,239,0)_22%,rgba(234,254,239,0)_75%,rgba(234,254,239,0.32))]" />
    </div>
  );
}
