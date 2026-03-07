"use client";

import { useEffect } from "react";
import { useMotionValue, useReducedMotion } from "framer-motion";

// Singleton: one global mousemove listener shared across all consumers
let listenerCount = 0;
let globalHandler: ((e: MouseEvent) => void) | null = null;
let rawX = 0;
let rawY = 0;
let normX = 0.5;
let normY = 0.5;
const subscribers = new Set<() => void>();

function ensureListener() {
  if (globalHandler) return;

  // No-op on touch-only devices
  if (
    typeof window !== "undefined" &&
    window.matchMedia("(hover: none)").matches
  ) {
    return;
  }

  globalHandler = (e: MouseEvent) => {
    rawX = e.clientX;
    rawY = e.clientY;
    normX = e.clientX / window.innerWidth;
    normY = 1.0 - e.clientY / window.innerHeight; // GL convention: 0 = bottom
    subscribers.forEach((fn) => fn());
  };
  window.addEventListener("mousemove", globalHandler, { passive: true });
}

function removeListener() {
  if (globalHandler) {
    window.removeEventListener("mousemove", globalHandler);
    globalHandler = null;
  }
}

/**
 * Shared mouse position hook — singleton global listener.
 * Returns normalized [0,1] values (GL convention: y=0 bottom, y=1 top)
 * and raw pixel clientX/clientY via MotionValues (no re-renders).
 */
export function useMousePosition() {
  const shouldReduceMotion = useReducedMotion();

  const nx = useMotionValue(0.5);
  const ny = useMotionValue(0.5);
  const cx = useMotionValue(0);
  const cy = useMotionValue(0);

  useEffect(() => {
    if (shouldReduceMotion) return;

    listenerCount++;
    ensureListener();

    const update = () => {
      nx.set(normX);
      ny.set(normY);
      cx.set(rawX);
      cy.set(rawY);
    };
    subscribers.add(update);

    return () => {
      subscribers.delete(update);
      listenerCount--;
      if (listenerCount <= 0) {
        listenerCount = 0;
        removeListener();
      }
    };
  }, [shouldReduceMotion, nx, ny, cx, cy]);

  return { nx, ny, clientX: cx, clientY: cy };
}
