"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Float, MeshTransmissionMaterial } from "@react-three/drei";
import { Bloom, EffectComposer, ToneMapping } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import { useReducedMotion } from "framer-motion";
import * as THREE from "three";
import { SceneLighting } from "./_scene/lighting";
import { scenePalette } from "./_scene/palette";

type Tone = "pearl" | "teal" | "violet" | "coral";

type CubeSpec = {
  position: [number, number, number];
  size: number;
  tone: Tone;
  phase: number;
};

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
 * Build a small 3D cluster of cubes via density-modulated rejection sampling.
 * The result reads as a loose molecular structure made of crystalline cubes,
 * not a regular grid (which would feel like Minecraft).
 */
function buildCluster(): CubeSpec[] {
  const blobs = [
    { x: 0, y: 0, z: 0, rx: 1.0, ry: 0.9, rz: 1.0, w: 1.0 },
    { x: 0.85, y: 0.2, z: -0.3, rx: 0.7, ry: 0.6, rz: 0.7, w: 0.8 },
    { x: -0.8, y: -0.3, z: 0.35, rx: 0.65, ry: 0.6, rz: 0.7, w: 0.7 },
    { x: 0.1, y: 0.85, z: 0.25, rx: 0.55, ry: 0.5, rz: 0.55, w: 0.55 },
  ];

  const cubes: CubeSpec[] = [];
  const toneOrder: Tone[] = ["pearl", "teal", "pearl", "violet", "teal", "coral", "pearl", "teal"];
  let i = 0;

  for (let x = -1.8; x <= 1.8; x += 0.42) {
    for (let y = -1.4; y <= 1.4; y += 0.42) {
      for (let z = -1.4; z <= 1.4; z += 0.42) {
        let d = 0;
        for (const b of blobs) {
          const dx = (x - b.x) / b.rx;
          const dy = (y - b.y) / b.ry;
          const dz = (z - b.z) / b.rz;
          d += b.w * Math.exp(-(dx * dx + dy * dy + dz * dz));
        }
        const seed = (x * 73856093) ^ (y * 19349663) ^ (z * 83492791);
        const n = hash(seed);
        if (d + n * 0.25 < 0.52) continue;

        const jitter = 0.08;
        const jx = (hash(seed + 1) - 0.5) * jitter;
        const jy = (hash(seed + 2) - 0.5) * jitter;
        const jz = (hash(seed + 3) - 0.5) * jitter;
        cubes.push({
          position: [x + jx, y + jy, z + jz],
          size: 0.48 + d * 0.22,
          tone: toneOrder[i++ % toneOrder.length],
          phase: hash(seed + 7),
        });
      }
    }
  }

  return cubes;
}

function CrystalCube({
  spec,
  attentionZ,
  reduceMotion,
}: {
  spec: CubeSpec;
  attentionZ: React.MutableRefObject<number>;
  reduceMotion: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);

  const color =
    spec.tone === "teal"
      ? scenePalette.teal
      : spec.tone === "violet"
        ? scenePalette.violet
        : spec.tone === "coral"
          ? scenePalette.coral
          : scenePalette.pearl;
  const attenuation =
    spec.tone === "teal"
      ? scenePalette.tealDeep
      : spec.tone === "violet"
        ? scenePalette.violetDeep
        : spec.tone === "coral"
          ? scenePalette.coralDeep
          : scenePalette.teal;

  useFrame(({ clock }) => {
    const meshRotY = meshRef.current?.rotation;
    if (meshRotY && !reduceMotion) {
      meshRef.current!.rotation.y = clock.elapsedTime * 0.07 + spec.phase * 6.28;
      meshRef.current!.rotation.x = Math.sin(clock.elapsedTime * 0.05 + spec.phase * 3.1) * 0.18;
    }

    if (haloRef.current) {
      const dist = Math.abs(spec.position[2] - attentionZ.current);
      const litness = Math.exp(-dist * dist * 1.2);
      const m = haloRef.current.material as THREE.MeshBasicMaterial;
      m.opacity = 0.04 + litness * 0.55;
      haloRef.current.scale.setScalar(1.0 + litness * 0.6);
    }
  });

  return (
    <group position={spec.position}>
      <mesh ref={haloRef}>
        <sphereGeometry args={[spec.size * 0.92, 14, 10]} />
        <meshBasicMaterial color={scenePalette.ivory} transparent opacity={0.06} depthWrite={false} />
      </mesh>
      <mesh ref={meshRef}>
        <boxGeometry args={[spec.size, spec.size, spec.size]} />
        <MeshTransmissionMaterial
          backside
          backsideThickness={spec.size * 0.7}
          thickness={spec.size * 1.0}
          roughness={0.04}
          chromaticAberration={0.06}
          anisotropy={0.22}
          distortion={0.04}
          distortionScale={0.25}
          temporalDistortion={0.03}
          ior={1.5}
          color={color}
          attenuationColor={attenuation}
          attenuationDistance={0.85}
          samples={10}
          resolution={512}
        />
      </mesh>
    </group>
  );
}

function AttentionPlane({ attentionZ }: { attentionZ: React.MutableRefObject<number> }) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const t = (clock.elapsedTime * 0.18) % 1;
    const z = THREE.MathUtils.lerp(-2.4, 2.4, t);
    attentionZ.current = z;
    if (meshRef.current) meshRef.current.position.z = z;
  });

  return (
    <mesh ref={meshRef} rotation={[0, 0, 0]}>
      <planeGeometry args={[7.4, 5.4]} />
      <meshBasicMaterial
        color={scenePalette.ivory}
        transparent
        opacity={0.05}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function Cluster({ reduceMotion }: { reduceMotion: boolean }) {
  const cubes = useMemo(() => buildCluster(), []);
  const attentionZ = useRef(0);

  return (
    <>
      {!reduceMotion && <AttentionPlane attentionZ={attentionZ} />}
      <group scale={1.6}>
        {cubes.map((spec, i) => (
          <CrystalCube
            key={i}
            spec={spec}
            attentionZ={attentionZ}
            reduceMotion={reduceMotion}
          />
        ))}
      </group>
    </>
  );
}

function PointerOrbit({ reduceMotion, children }: { reduceMotion: boolean; children: React.ReactNode }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame(({ clock, pointer }) => {
    if (!groupRef.current) return;
    const ty = pointer.x * 0.22 + (reduceMotion ? 0 : Math.sin(clock.elapsedTime * 0.16) * 0.07);
    const tx = -0.08 + pointer.y * -0.08;
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, ty, 0.04);
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, tx, 0.04);
  });
  return <group ref={groupRef}>{children}</group>;
}

export function DiffusionCubeField() {
  const shouldReduceMotion = Boolean(useReducedMotion());

  return (
    <figure
      aria-hidden="true"
      className="relative m-0 mb-12 min-h-[31rem] overflow-hidden rounded-lg border border-[#151719] bg-[#eafeef] shadow-[0_28px_90px_rgba(21,23,25,0.06)] md:mb-14 md:min-h-[36rem]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_72%_40%,rgba(184,232,241,0.45),rgba(234,254,239,0)_56%),radial-gradient(ellipse_at_24%_64%,rgba(184,205,229,0.32),rgba(234,254,239,0)_58%),linear-gradient(180deg,rgba(255,255,255,0.46),rgba(234,254,239,0.74))]" />

      <Canvas
        className="absolute inset-0"
        dpr={[1, 2]}
        camera={{ position: [0, 0.2, 4.2], fov: 46 }}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      >
        <SceneLighting />

        <Float
          speed={shouldReduceMotion ? 0 : 0.4}
          rotationIntensity={shouldReduceMotion ? 0 : 0.14}
          floatIntensity={shouldReduceMotion ? 0 : 0.3}
        >
          <PointerOrbit reduceMotion={shouldReduceMotion}>
            <Cluster reduceMotion={shouldReduceMotion} />
          </PointerOrbit>
        </Float>

        <ContactShadows
          position={[0, -1.85, 0]}
          opacity={0.22}
          scale={7}
          blur={2.6}
          far={4}
          color={scenePalette.ink}
        />

        <EffectComposer multisampling={0}>
          <Bloom intensity={0.42} luminanceThreshold={0.42} luminanceSmoothing={0.42} mipmapBlur />
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        </EffectComposer>
      </Canvas>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_60%_50%,rgba(234,254,239,0)_42%,rgba(234,254,239,0.16)_72%,rgba(234,254,239,0.82)_100%)]" />

      <figcaption className="sr-only">
        Machine-learning protein design visualized as a crystalline diffusion cluster — cubes refract the latent state as an attention wave passes through.
      </figcaption>
    </figure>
  );
}
