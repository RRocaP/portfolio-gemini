"use client";

import { useRef, useEffect, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";
import { useMousePosition } from "@/hooks/use-mouse-position";

interface KineticTextProps {
  text: string;
  className?: string;
  maxRotate?: number;
  maxTranslateY?: number;
  radius?: number;
}

function KineticChar({
  char,
  mouseX,
  mouseY,
  containerRef,
  maxRotate,
  maxTranslateY,
  radius,
}: {
  char: string;
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
  containerRef: React.RefObject<HTMLElement | null>;
  maxRotate: number;
  maxTranslateY: number;
  radius: number;
}) {
  const charRef = useRef<HTMLSpanElement>(null);

  const rawRotate = useMotionValue(0);
  const rawY = useMotionValue(0);
  const rawScale = useMotionValue(1);

  const rotate = useSpring(rawRotate, { damping: 25, stiffness: 200 });
  const y = useSpring(rawY, { damping: 25, stiffness: 200 });
  const scale = useSpring(rawScale, { damping: 25, stiffness: 200 });

  useEffect(() => {
    const update = () => {
      const el = charRef.current;
      const container = containerRef.current;
      if (!el || !container) return;

      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const mx = mouseX.get();
      const my = mouseY.get();

      if (mx === 0 && my === 0) {
        rawRotate.set(0);
        rawY.set(0);
        rawScale.set(1);
        return;
      }

      const dx = mx - cx;
      const dy = my - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < radius) {
        const t = 1 - dist / radius;
        rawRotate.set(-(dx / radius) * maxRotate * t);
        rawY.set(-(dy / radius) * maxTranslateY * t);
        rawScale.set(1 + 0.04 * t);
      } else {
        rawRotate.set(0);
        rawY.set(0);
        rawScale.set(1);
      }
    };

    const unsubX = mouseX.on("change", update);
    const unsubY = mouseY.on("change", update);

    return () => {
      unsubX();
      unsubY();
    };
  }, [mouseX, mouseY, containerRef, radius, maxRotate, maxTranslateY, rawRotate, rawY, rawScale]);

  if (char === " ") {
    return <span>{"\u00A0"}</span>;
  }

  return (
    <motion.span
      ref={charRef}
      style={{ rotate, y, scale, display: "inline-block", willChange: "transform" }}
      aria-hidden="true"
    >
      {char}
    </motion.span>
  );
}

const wordVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

export default function KineticText({
  text,
  className = "",
  maxRotate = 3,
  maxTranslateY = 3,
  radius = 120,
}: KineticTextProps) {
  const shouldReduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLElement>(null);
  const { clientX, clientY } = useMousePosition();

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, []);

  if (shouldReduceMotion || isMobile) {
    return <span className={className}>{text}</span>;
  }

  const words = text.split(" ");

  return (
    <motion.span
      ref={containerRef as React.RefObject<HTMLSpanElement>}
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, wi) => (
          <motion.span
            key={`w-${wi}`}
            variants={wordVariants}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: "inline-block" }}
          >
            {word.split("").map((char, ci) => (
              <KineticChar
                key={`${wi}-${ci}-${char}`}
                char={char}
                mouseX={clientX}
                mouseY={clientY}
                containerRef={containerRef}
                maxRotate={maxRotate}
                maxTranslateY={maxTranslateY}
                radius={radius}
              />
            ))}
            {wi < words.length - 1 && <span>{"\u00A0"}</span>}
          </motion.span>
        ))}
      </span>
    </motion.span>
  );
}
