"use client";

import { useMemo } from "react";

/**
 * ML/AI protein network — pure SVG port of the original Astro
 * CollaborationNetworkViz, preserved palette + pulse-ring motion:
 *
 *   - PRIMARY hub  → red gradient (#EF4444 → #DC2626)
 *   - INSTITUTION  → blue gradient (#3B82F6 → #2563EB)
 *   - COLLABORATOR → DARK GREEN gradient (#10B981 → #059669)  ← the "green dark dots that pulse"
 *
 * Each node carries a separate pulse-ring concentric circle that
 * expands and fades on infinite loop. Connection lines from centre,
 * dark grey with a soft glow filter. CSS-only animations, no per-frame JS.
 */

type Tone = "primary" | "institution" | "collaborator";

type Node = {
  id: string;
  /** percent-based viewbox coords (0..100) — matches Astro original */
  x: number;
  y: number;
  size: number;
  tone: Tone;
  /** ring animation delay (s) */
  delay: number;
  label?: string;
  institution?: string;
  publications?: number;
};

// Mirrors the Astro original's nodePositions but with 4 extra collaborator dots
// (the user wanted *more* green pulsing dots, not just a six-node diagram).
const NODES: Node[] = [
  { id: "ramon", x: 50, y: 50, size: 6.5, tone: "primary", delay: 0, label: "Ramon Roca Pinilla", institution: "CMRI", publications: 16 },
  { id: "cmri", x: 25, y: 25, size: 5, tone: "institution", delay: 0.3, label: "Children's Medical Research Institute", institution: "Sydney, AU", publications: 3 },
  { id: "uab", x: 75, y: 25, size: 5.2, tone: "institution", delay: 0.6, label: "Universitat Autònoma de Barcelona", institution: "Barcelona, ES", publications: 10 },
  { id: "intl_1", x: 15, y: 75, size: 4, tone: "collaborator", delay: 0.9, label: "European Collaborators", institution: "Various EU", publications: 5 },
  { id: "intl_2", x: 85, y: 75, size: 3.6, tone: "collaborator", delay: 1.2, label: "US Research Partners", institution: "Various US", publications: 3 },
  { id: "australia", x: 50, y: 86, size: 4.4, tone: "collaborator", delay: 1.5, label: "Australian Networks", institution: "Various AU", publications: 4 },
  // Extra green-dark collaborator dots — more of the "pulsing" ones the user wants
  { id: "co_1", x: 32, y: 60, size: 3.2, tone: "collaborator", delay: 0.4, label: "Co-author", institution: "EU lab", publications: 2 },
  { id: "co_2", x: 68, y: 58, size: 3.4, tone: "collaborator", delay: 0.7, label: "Co-author", institution: "US lab", publications: 2 },
  { id: "co_3", x: 38, y: 38, size: 3.0, tone: "collaborator", delay: 1.0, label: "Co-author", institution: "CMRI", publications: 3 },
  { id: "co_4", x: 62, y: 40, size: 3.0, tone: "collaborator", delay: 1.3, label: "Co-author", institution: "UAB", publications: 3 },
  { id: "co_5", x: 22, y: 48, size: 2.8, tone: "collaborator", delay: 0.55, label: "Co-author", institution: "EU lab", publications: 1 },
  { id: "co_6", x: 78, y: 48, size: 2.8, tone: "collaborator", delay: 0.85, label: "Co-author", institution: "US lab", publications: 1 },
  { id: "co_7", x: 42, y: 72, size: 2.6, tone: "collaborator", delay: 1.1, label: "Co-author", institution: "AU lab", publications: 1 },
  { id: "co_8", x: 58, y: 70, size: 2.6, tone: "collaborator", delay: 1.4, label: "Co-author", institution: "AU lab", publications: 1 },
];

const TONE_FILL: Record<Tone, string> = {
  primary: "url(#primaryGradient)",
  institution: "url(#institutionGradient)",
  collaborator: "url(#collaboratorGradient)",
};

const TONE_RING: Record<Tone, string> = {
  primary: "#EF4444",
  institution: "#3B82F6",
  collaborator: "#10B981",
};

export function MLProteinNetwork({ className = "" }: { className?: string }) {
  // Connection lines from centre (ramon) to every other node — direct port
  // of the Astro original's nodePositions.slice(1).map(line)
  const center = useMemo(() => NODES.find((n) => n.id === "ramon")!, []);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none relative h-full min-h-[26rem] w-full overflow-hidden ${className}`}
    >
      {/* Dark backdrop card — the green-dark dots need a dark substrate to feel right */}
      <div className="absolute inset-0 rounded-2xl bg-[#0E1219] shadow-[0_24px_80px_rgba(21,23,25,0.18)]" />

      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 h-full w-full"
        role="img"
      >
        <defs>
          {/* Original palette — preserved verbatim */}
          <radialGradient id="primaryGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#EF4444" stopOpacity="1" />
            <stop offset="100%" stopColor="#DC2626" stopOpacity="0.85" />
          </radialGradient>
          <radialGradient id="institutionGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="1" />
            <stop offset="100%" stopColor="#2563EB" stopOpacity="0.85" />
          </radialGradient>
          <radialGradient id="collaboratorGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#10B981" stopOpacity="1" />
            <stop offset="100%" stopColor="#059669" stopOpacity="0.85" />
          </radialGradient>

          {/* Soft glow on the connection lines */}
          <filter id="lineGlow">
            <feGaussianBlur stdDeviation="0.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Connection lines from centre */}
        <g className="ml-net__lines">
          {NODES.filter((n) => n.id !== "ramon").map((n, i) => (
            <line
              key={`l-${n.id}`}
              x1={center.x}
              y1={center.y}
              x2={n.x}
              y2={n.y}
              stroke="#374151"
              strokeWidth="0.3"
              opacity="0.6"
              filter="url(#lineGlow)"
              className="ml-net__line"
              style={{ animation: `ml-line-draw 1.1s ease-out both`, animationDelay: `${i * 0.18}s` }}
            />
          ))}
        </g>

        {/* Nodes — each with a pulse ring + the filled circle */}
        <g className="ml-net__nodes">
          {NODES.map((n) => (
            <g key={n.id} className="ml-net__node">
              {/* Pulse ring — concentric circle expanding outward, infinite */}
              <circle
                cx={n.x}
                cy={n.y}
                r={n.size / 2}
                fill="none"
                stroke={TONE_RING[n.tone]}
                strokeWidth="0.2"
                opacity="0"
                className="ml-net__ring"
                style={{ animationDelay: `${n.delay}s` }}
              />
              {/* Outer halo */}
              <circle
                cx={n.x}
                cy={n.y}
                r={n.size / 2 * 1.45}
                fill={TONE_RING[n.tone]}
                opacity="0.16"
                className="ml-net__halo"
                style={{ animationDelay: `${n.delay}s` }}
              />
              {/* Filled node */}
              <circle
                cx={n.x}
                cy={n.y}
                r={n.size / 2}
                fill={TONE_FILL[n.tone]}
                stroke="#1F2937"
                strokeWidth="0.3"
                className="ml-net__dot"
                style={{ animationDelay: `${n.delay}s` }}
              />
            </g>
          ))}
        </g>
      </svg>

      <style jsx>{`
        .ml-net__ring {
          transform-origin: center;
          transform-box: fill-box;
          animation: ml-net-ring 2.4s ease-out infinite;
        }
        .ml-net__halo {
          animation: ml-net-halo 3.4s ease-in-out infinite;
        }
        .ml-net__dot {
          transform-origin: center;
          transform-box: fill-box;
          animation: ml-net-breathe 3.2s ease-in-out infinite;
        }

        @keyframes ml-net-ring {
          0% {
            r: var(--r, 2);
            opacity: 0.95;
            stroke-width: 0.4;
          }
          70% {
            opacity: 0.4;
            stroke-width: 0.18;
          }
          100% {
            r: calc(var(--r, 2) + 5);
            opacity: 0;
            stroke-width: 0.1;
          }
        }
        @keyframes ml-net-halo {
          0%,
          100% {
            opacity: 0.12;
          }
          50% {
            opacity: 0.32;
          }
        }
        @keyframes ml-net-breathe {
          0%,
          100% {
            transform: scale(1);
            filter: brightness(1);
          }
          50% {
            transform: scale(1.08);
            filter: brightness(1.18);
          }
        }
        @keyframes ml-line-draw {
          from {
            stroke-dasharray: 60;
            stroke-dashoffset: 60;
            opacity: 0;
          }
          to {
            stroke-dasharray: none;
            stroke-dashoffset: 0;
            opacity: 0.6;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .ml-net__ring,
          .ml-net__halo,
          .ml-net__dot,
          .ml-net__line {
            animation: none !important;
          }
          .ml-net__ring {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
