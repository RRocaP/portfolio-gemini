"use client";

import { Environment } from "@react-three/drei";
import { sceneEnv, scenePalette } from "./palette";

/**
 * Shared three-point rig + HDRI environment for the hero scenes.
 * Key (warm) from upper-front-right, fill (cool teal) from lower-back-left,
 * rim (violet) from above-behind. Matches the soft pastel register of the page.
 */
export function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.35} color={scenePalette.pearl} />

      {/* Key — warm directional, casts the main highlights */}
      <directionalLight
        position={[3.4, 4.8, 5.2]}
        intensity={1.65}
        color="#fff7ea"
      />

      {/* Fill — cool teal point, lifts the shadow side */}
      <pointLight
        position={[-3.4, -2.4, 2.4]}
        intensity={1.4}
        color={scenePalette.teal}
        distance={12}
        decay={1.5}
      />

      {/* Rim — violet from behind, separates subject from background */}
      <pointLight
        position={[1.8, 2.4, -3.8]}
        intensity={1.1}
        color={scenePalette.violet}
        distance={10}
        decay={1.6}
      />

      <Environment preset={sceneEnv.preset} environmentIntensity={sceneEnv.intensity} />
    </>
  );
}
