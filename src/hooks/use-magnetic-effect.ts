"use client";

import { useCallback, useRef, useEffect } from "react";
import {
  useMotionValue,
  useSpring,
  type MotionValue,
} from "framer-motion";

interface UseMagneticEffectOptions {
  strength?: number;
  radius?: number;
  disabled?: boolean;
}

interface MagneticResult {
  ref: React.RefCallback<HTMLElement>;
  x: MotionValue<number>;
  y: MotionValue<number>;
}

const springConfig = { damping: 20, stiffness: 300, mass: 0.5 };

export function useMagneticEffect({
  strength = 6,
  radius = 100,
  disabled = false,
}: UseMagneticEffectOptions = {}): MagneticResult {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, springConfig);
  const y = useSpring(rawY, springConfig);

  const elRef = useRef<HTMLElement | null>(null);
  const listenerRef = useRef<{
    move: (e: MouseEvent) => void;
    leave: () => void;
  } | null>(null);

  const effectiveRadius = useRef(radius);

  useEffect(() => {
    const update = () => {
      effectiveRadius.current =
        typeof window !== "undefined" && window.innerWidth < 480
          ? radius * 0.5
          : radius;
    };
    update();
    window.addEventListener("resize", update, { passive: true });
    return () => window.removeEventListener("resize", update);
  }, [radius]);

  const ref = useCallback(
    (node: HTMLElement | null) => {
      if (elRef.current && listenerRef.current) {
        elRef.current.removeEventListener(
          "mousemove",
          listenerRef.current.move,
        );
        elRef.current.removeEventListener(
          "mouseleave",
          listenerRef.current.leave,
        );
        listenerRef.current = null;
      }
      elRef.current = node;

      if (!node || disabled) return;

      if (
        typeof window !== "undefined" &&
        window.matchMedia("(hover: none)").matches
      ) {
        return;
      }

      const onMove = (e: MouseEvent) => {
        const rect = node.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const r = effectiveRadius.current;

        if (dist < r) {
          const factor = (1 - dist / r) * strength;
          rawX.set((dx / dist) * factor || 0);
          rawY.set((dy / dist) * factor || 0);
        } else {
          rawX.set(0);
          rawY.set(0);
        }
      };

      const onLeave = () => {
        rawX.set(0);
        rawY.set(0);
      };

      node.addEventListener("mousemove", onMove);
      node.addEventListener("mouseleave", onLeave);
      listenerRef.current = { move: onMove, leave: onLeave };
    },
    [disabled, strength, rawX, rawY],
  );

  return { ref, x, y };
}
