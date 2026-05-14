"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { useReducedMotion } from "framer-motion";

// Simple seeded PRNG to ensure pure render
function createSeededRandom(seed: number) {
  return function() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

const pointVertexShader = `
  uniform float time;
  attribute float sizeOffset;
  varying float vAlpha;
  
  void main() {
    // Elegant slow pulse based on position and time
    float pulse = sin(time * 1.5 + position.x * 0.5 + position.y * 0.5) * 0.5 + 0.5;
    vAlpha = 0.3 + pulse * 0.7; // Opacity varies between 0.3 and 1.0
    
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    
    // Scale point size based on depth and sizeOffset
    float baseSize = 8.0 + sizeOffset * 25.0;
    gl_PointSize = (baseSize + pulse * 5.0) * (20.0 / -mvPosition.z);
    
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const pointFragmentShader = `
  uniform vec3 color;
  varying float vAlpha;
  
  void main() {
    // Draw a soft circle
    vec2 xy = gl_PointCoord.xy - vec2(0.5);
    float distance = length(xy);
    
    if (distance > 0.5) {
      discard;
    }
    
    // Smooth radial falloff (glow effect)
    float intensity = pow(1.0 - (distance * 2.0), 1.5);
    
    gl_FragColor = vec4(color, intensity * vAlpha);
  }
`;

function ProteinNetwork({ prefersReducedMotion }: { prefersReducedMotion: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  const { positions, indices, sizes } = useMemo(() => {
    const random = createSeededRandom(42);
    const pts: THREE.Vector3[] = [];
    const current = new THREE.Vector3(0, 0, 0);
    pts.push(current.clone());
    
    // Generate an organic random walk for the backbone
    const numResidues = 160;
    const velocity = new THREE.Vector3(1, 1, 1).normalize();

    for (let i = 1; i < numResidues; i++) {
      const axis = new THREE.Vector3(random() - 0.5, random() - 0.5, random() - 0.5).normalize();
      // Keep angle relatively small to prevent jarring kinks, but enough to curl
      const angle = (random() - 0.1) * Math.PI * 0.4;
      velocity.applyAxisAngle(axis, angle);
      
      // Restrict bounding volume to ensure it never gets cut off
      if (current.length() > 8.0) {
        velocity.add(current.clone().normalize().multiplyScalar(-0.25)).normalize();
      }
      
      current.add(velocity.clone().multiplyScalar(1.2));
      pts.push(current.clone());
    }
    
    // Smooth the backbone into a continuous flowing ribbon path
    const curve = new THREE.CatmullRomCurve3(pts);
    const smoothPts = curve.getPoints(800);

    const finalPoints: THREE.Vector3[] = [];
    const linesIdx: number[] = [];
    const sizeOffsets: number[] = [];

    // Build the backbone network
    smoothPts.forEach((p, i) => {
      finalPoints.push(p);
      sizeOffsets.push(0.05); // Tiny backbone points

      if (i > 0) {
        linesIdx.push(i - 1, i);
      }
      
      // Add data nodes (sidechains) periodically
      if (i % 12 === 0) {
        const tangent = new THREE.Vector3();
        if (i < smoothPts.length - 1) {
           tangent.subVectors(smoothPts[i+1], p).normalize();
        } else {
           tangent.subVectors(p, smoothPts[i-1]).normalize();
        }
        
        const normal = new THREE.Vector3(1, 0, 0);
        if (Math.abs(tangent.x) > 0.9) normal.set(0, 1, 0);
        normal.cross(tangent).normalize();
        normal.applyAxisAngle(tangent, random() * Math.PI * 2);
        
        const length = 1.0 + random() * 2.0;
        const sidePt = p.clone().add(normal.multiplyScalar(length));
        
        finalPoints.push(sidePt);
        sizeOffsets.push(0.8 + random() * 0.5); // Large data nodes
        
        const sidechainIdx = finalPoints.length - 1;
        linesIdx.push(i, sidechainIdx); // Connect to backbone
        
        // Random cross-connections between nearby nodes to build the "AI web"
        for (let j = 0; j < finalPoints.length - 2; j++) {
           if (sizeOffsets[j] > 0.5 && finalPoints[j].distanceTo(sidePt) < 4.5 && random() > 0.6) {
              linesIdx.push(j, sidechainIdx);
           }
        }
      }
    });

    // Add some disconnected floating data particles (the "aura")
    for (let i = 0; i < 200; i++) {
       const pt = new THREE.Vector3(
         (random() - 0.5) * 28,
         (random() - 0.5) * 28,
         (random() - 0.5) * 28
       );
       const dist = pt.length();
       // Keep them orbiting the outside
       if (dist > 7 && dist < 14) {
          finalPoints.push(pt);
          sizeOffsets.push(0.2 + random() * 0.4);
       }
    }

    // Center geometry perfectly
    const box = new THREE.Box3().setFromPoints(finalPoints);
    const center = box.getCenter(new THREE.Vector3());
    finalPoints.forEach(p => p.sub(center));

    const posArray = new Float32Array(finalPoints.length * 3);
    finalPoints.forEach((p, i) => {
      posArray[i * 3] = p.x;
      posArray[i * 3 + 1] = p.y;
      posArray[i * 3 + 2] = p.z;
    });

    return { 
      positions: posArray, 
      indices: new Uint16Array(linesIdx), 
      sizes: new Float32Array(sizeOffsets)
    };
  }, []);

  const uniforms = useMemo(() => ({
    time: { value: 0 },
    // Deep teal-green color that pops elegantly on a light background
    color: { value: new THREE.Color("#1a3f39") }
  }), []);

  useFrame((state, delta) => {
    if (!groupRef.current || prefersReducedMotion) return;
    
    // Update shader time for pulsing
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime;
    }
    
    // Elegant, slow rotation
    groupRef.current.rotation.y += delta * 0.06;
    groupRef.current.rotation.x += delta * 0.03;
    
    // Subtle mouse tilt
    const targetX = (state.pointer.x * Math.PI) / 10;
    const targetY = (state.pointer.y * Math.PI) / 10;
    
    groupRef.current.rotation.y += (targetX - groupRef.current.rotation.y) * 0.02;
    groupRef.current.rotation.x += (targetY - groupRef.current.rotation.x) * 0.02;
  });

  return (
    <group ref={groupRef}>
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={positions.length / 3}
            args={[positions, 3]}
          />
          <bufferAttribute
            attach="attributes-sizeOffset"
            count={sizes.length}
            args={[sizes, 1]}
          />
        </bufferGeometry>
        <shaderMaterial
          ref={materialRef}
          vertexShader={pointVertexShader}
          fragmentShader={pointFragmentShader}
          uniforms={uniforms}
          transparent={true}
          depthWrite={false}
        />
      </points>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={positions.length / 3}
            args={[positions, 3]}
          />
          <bufferAttribute
            attach="index"
            count={indices.length}
            args={[indices, 1]}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color="#2a5a54"
          transparent
          opacity={0.15}
          depthWrite={false}
        />
      </lineSegments>
    </group>
  );
}

export default function InteractiveProtein() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="absolute inset-0 z-0 h-full w-full transition-opacity duration-1000">
      <Canvas
        camera={{ position: [0, 0, 24], fov: 35 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        dpr={[1, 2]}
      >
        <ProteinNetwork prefersReducedMotion={!!shouldReduceMotion} />
        <EffectComposer>
          <Bloom
            luminanceThreshold={0.3}
            mipmapBlur
            intensity={0.8}
            radius={0.6}
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
