"use client";

import { useCallback, useRef } from "react";

interface UseRefractionOptions {
  disabled?: boolean;
}

export function useRefraction({
  disabled = false,
}: UseRefractionOptions = {}): React.RefCallback<HTMLElement> {
  const elRef = useRef<HTMLElement | null>(null);
  const listenersRef = useRef<{
    move: (e: PointerEvent) => void;
    leave: () => void;
  } | null>(null);

  const refCallback = useCallback(
    (node: HTMLElement | null) => {
      if (elRef.current && listenersRef.current) {
        elRef.current.removeEventListener(
          "pointermove",
          listenersRef.current.move,
        );
        elRef.current.removeEventListener(
          "pointerleave",
          listenersRef.current.leave,
        );
        listenersRef.current = null;
      }
      elRef.current = node;

      if (!node || disabled) return;

      if (
        typeof window !== "undefined" &&
        window.matchMedia("(hover: none)").matches
      ) {
        return;
      }

      const onMove = (e: PointerEvent) => {
        const rect = node.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        node.style.setProperty("--refraction-x", `${x}px`);
        node.style.setProperty("--refraction-y", `${y}px`);
        node.style.setProperty("--refraction-opacity", "1");
      };

      const onLeave = () => {
        node.style.setProperty("--refraction-opacity", "0");
      };

      node.addEventListener("pointermove", onMove);
      node.addEventListener("pointerleave", onLeave);
      listenersRef.current = { move: onMove, leave: onLeave };
    },
    [disabled],
  );

  return refCallback;
}
