/**
 * HeroDiffusion — Next.js client wrapper around the framework-agnostic
 * DiffusionField sim (src/lib/diffusion-field.ts).
 *
 * Renders ~3000 dark cubes cycling through a 16 s noise → Lorenz-cluster →
 * breath → dissolve loop. Single InstancedMesh draw call, no orbit, ortho cam.
 * The soft red glow under the cluster is CSS, never in WebGL.
 *
 * Props:
 *   prefersReducedMotion — if true, sim seeks to phase-3 mid-breath and stops.
 *                          Pass framer-motion's `useReducedMotion()` result.
 *   className           — applied to the outer wrapper.
 *   showGlow            — toggle the CSS radial-gradient glow (default true).
 */
"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { DiffusionField } from "@/lib/diffusion-field";

export type HeroDiffusionProps = {
  prefersReducedMotion?: boolean;
  className?: string;
  showGlow?: boolean;
};

export function HeroDiffusion({
  prefersReducedMotion = false,
  className,
  showGlow = true,
}: HeroDiffusionProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fieldRef = useRef<DiffusionField | null>(null);
  const fallbackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let field: DiffusionField;
    try {
      field = new DiffusionField(canvas);
    } catch (err) {
      // WebGL init failed — leave the fallback PNG visible.
      console.warn("[HeroDiffusion] WebGL init failed; using static fallback", err);
      return;
    }
    fieldRef.current = field;
    field.setReducedMotion(prefersReducedMotion);
    field.start();

    // Fade out the fallback once the first WebGL frame is on screen.
    const fade = () => {
      if (fallbackRef.current) fallbackRef.current.style.opacity = "0";
    };
    const fadeRaf = requestAnimationFrame(() => requestAnimationFrame(fade));

    return () => {
      cancelAnimationFrame(fadeRaf);
      field.dispose();
      fieldRef.current = null;
    };
  }, []); // intentionally one-shot — see prefersReducedMotion effect below

  // Respond to prefers-reduced-motion changes without re-creating the sim.
  useEffect(() => {
    fieldRef.current?.setReducedMotion(prefersReducedMotion);
  }, [prefersReducedMotion]);

  return (
    <div className={`relative h-full w-full overflow-hidden ${className ?? ""}`}>
      {showGlow && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 36% 22% at 50% 62%, rgba(200,74,58,0.18) 0%, transparent 70%)",
          }}
        />
      )}
      <div
        ref={fallbackRef}
        aria-hidden="true"
        className="absolute inset-0 transition-opacity duration-700"
        style={{ opacity: 1 }}
      >
        <Image
          src="/hero-diffusion-fallback.png"
          alt=""
          fill
          priority
          sizes="(max-width: 768px) 100vw, 60vw"
          style={{ objectFit: "cover", objectPosition: "center" }}
        />
      </div>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 block h-full w-full"
      />
    </div>
  );
}

export default HeroDiffusion;
