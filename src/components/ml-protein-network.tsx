"use client";

import { useMemo } from "react";

/**
 * ML/AI protein network — pure SVG.
 *
 * Dots = residues, edges = predicted contacts. The composition is hand-tuned
 * (asymmetric density: dense core + sparse loop + lone outlier) so it reads
 * as a *folded protein with a binding pocket*, not a uniform graph demo.
 *
 * Animations are CSS-only (no per-frame JS) so the cost is essentially zero:
 *   - residue dots breathe at staggered phases via `pulse-N` keyframes
 *   - travelling pulses ride select edges via stroke-dashoffset animation
 *   - whole group drifts slowly via a translate3d keyframe
 *
 * Palette is the page's warm cream + oxblood + gold register, matched to
 * the favicon. Hover any residue → its neighbours brighten via the
 * `:has(...:hover)` CSS selector.
 */

type Node = {
  id: string;
  x: number;
  y: number;
  r: number;
  tone: "pearl" | "cream" | "gold" | "coral" | "oxblood";
  /** delay (s) for the breathing animation */
  delay: number;
  /** mark as hub — bigger, more prominent halo */
  hub?: boolean;
};

type Edge = {
  from: string;
  to: string;
  weight?: number; // 0..1, affects opacity + thickness
  pulse?: boolean; // travelling pulse along this edge
};

// Hand-tuned residue layout. Viewbox is 800×800; coords centre on (400,400).
// Three regions: dense core (top-right), sparse loop (bottom-left), outlier.
const NODES: Node[] = [
  // Dense core — the active site
  { id: "h", x: 480, y: 320, r: 14, tone: "oxblood", delay: 0, hub: true }, // hub
  { id: "a1", x: 440, y: 260, r: 7, tone: "gold", delay: 0.4 },
  { id: "a2", x: 520, y: 270, r: 6, tone: "cream", delay: 0.8 },
  { id: "a3", x: 560, y: 330, r: 7, tone: "gold", delay: 1.2 },
  { id: "a4", x: 550, y: 390, r: 6, tone: "pearl", delay: 1.6 },
  { id: "a5", x: 500, y: 410, r: 7, tone: "gold", delay: 2.0 },
  { id: "a6", x: 430, y: 380, r: 6, tone: "cream", delay: 2.4 },
  { id: "a7", x: 410, y: 320, r: 6, tone: "pearl", delay: 2.8 },
  { id: "a8", x: 470, y: 220, r: 5, tone: "pearl", delay: 0.6 },
  { id: "a9", x: 580, y: 250, r: 5, tone: "cream", delay: 1.0 },
  { id: "a10", x: 610, y: 360, r: 5, tone: "pearl", delay: 1.4 },
  { id: "a11", x: 590, y: 430, r: 5, tone: "gold", delay: 1.8 },
  { id: "a12", x: 470, y: 460, r: 5, tone: "pearl", delay: 2.2 },
  { id: "a13", x: 390, y: 430, r: 5, tone: "cream", delay: 2.6 },
  { id: "a14", x: 370, y: 360, r: 5, tone: "pearl", delay: 3.0 },
  { id: "a15", x: 380, y: 280, r: 5, tone: "pearl", delay: 0.2 },
  { id: "a16", x: 540, y: 460, r: 4, tone: "cream", delay: 1.5 },
  { id: "a17", x: 620, y: 410, r: 4, tone: "pearl", delay: 2.5 },
  { id: "a18", x: 640, y: 310, r: 4, tone: "cream", delay: 0.9 },
  { id: "a19", x: 510, y: 350, r: 5, tone: "coral", delay: 1.7 }, // accent
  { id: "a20", x: 460, y: 350, r: 4, tone: "pearl", delay: 2.1 },

  // Sparse loop — a flexible region extending down-left
  { id: "h2", x: 280, y: 480, r: 11, tone: "oxblood", delay: 0.3, hub: true }, // secondary hub
  { id: "b1", x: 330, y: 440, r: 5, tone: "gold", delay: 1.1 },
  { id: "b2", x: 320, y: 510, r: 5, tone: "cream", delay: 1.9 },
  { id: "b3", x: 240, y: 520, r: 5, tone: "pearl", delay: 0.7 },
  { id: "b4", x: 250, y: 450, r: 5, tone: "gold", delay: 1.5 },
  { id: "b5", x: 220, y: 580, r: 4, tone: "pearl", delay: 2.3 },
  { id: "b6", x: 290, y: 580, r: 4, tone: "cream", delay: 0.5 },

  // Lone outlier — a binding partner, tethered by a single edge
  { id: "o1", x: 160, y: 220, r: 6, tone: "coral", delay: 1.3 },
  { id: "o2", x: 200, y: 180, r: 4, tone: "pearl", delay: 2.7 },
];

const EDGES: Edge[] = [
  // Hub spokes (dense core)
  { from: "h", to: "a1", weight: 1, pulse: true },
  { from: "h", to: "a2" },
  { from: "h", to: "a3", weight: 0.9, pulse: true },
  { from: "h", to: "a4" },
  { from: "h", to: "a5", weight: 0.9 },
  { from: "h", to: "a6" },
  { from: "h", to: "a7", weight: 0.8 },
  { from: "h", to: "a19", weight: 0.85, pulse: true },
  { from: "h", to: "a20", weight: 0.7 },
  // Core ring
  { from: "a1", to: "a8", weight: 0.7 },
  { from: "a2", to: "a9", weight: 0.7 },
  { from: "a3", to: "a9", weight: 0.6 },
  { from: "a3", to: "a10", weight: 0.7 },
  { from: "a3", to: "a18", weight: 0.6 },
  { from: "a4", to: "a10", weight: 0.7 },
  { from: "a4", to: "a11", weight: 0.7 },
  { from: "a4", to: "a17", weight: 0.5 },
  { from: "a5", to: "a11", weight: 0.6 },
  { from: "a5", to: "a16", weight: 0.7 },
  { from: "a5", to: "a12", weight: 0.6 },
  { from: "a6", to: "a12", weight: 0.6 },
  { from: "a6", to: "a13", weight: 0.7 },
  { from: "a7", to: "a14", weight: 0.6 },
  { from: "a7", to: "a15", weight: 0.7 },
  { from: "a1", to: "a8", weight: 0.5 },
  { from: "a8", to: "a15", weight: 0.5 },
  { from: "a9", to: "a18", weight: 0.55 },
  { from: "a10", to: "a18", weight: 0.55 },
  { from: "a11", to: "a17", weight: 0.5 },
  { from: "a12", to: "a16", weight: 0.55 },
  { from: "a13", to: "a14", weight: 0.65 },
  { from: "a14", to: "a15", weight: 0.55 },
  // Loop connections
  { from: "h2", to: "b1", weight: 1, pulse: true },
  { from: "h2", to: "b2", weight: 0.9 },
  { from: "h2", to: "b3", weight: 0.8 },
  { from: "h2", to: "b4", weight: 0.9 },
  { from: "b3", to: "b5", weight: 0.55 },
  { from: "b3", to: "b6", weight: 0.6 },
  { from: "b2", to: "b6", weight: 0.55 },
  { from: "b1", to: "a6", weight: 0.6 }, // bridge from loop to core
  { from: "b4", to: "a14", weight: 0.55 },
  // Outlier — a single tether
  { from: "o1", to: "a15", weight: 0.45, pulse: true },
  { from: "o1", to: "o2", weight: 0.5 },
];

const TONE_FILL: Record<Node["tone"], string> = {
  pearl: "url(#nodePearl)",
  cream: "url(#nodeCream)",
  gold: "url(#nodeGold)",
  coral: "url(#nodeCoral)",
  oxblood: "url(#nodeOxblood)",
};

const TONE_HALO: Record<Node["tone"], string> = {
  pearl: "rgba(247,244,238,0.55)",
  cream: "rgba(237,226,205,0.55)",
  gold: "rgba(196,149,106,0.55)",
  coral: "rgba(240,168,155,0.65)",
  oxblood: "rgba(218,41,28,0.62)",
};

// Curved bezier path between two nodes. The bow is perpendicular to the
// chord — small for short edges, larger for long ones — so the network
// reads as organic strands instead of a stiff stick figure.
function curvedPath(x1: number, y1: number, x2: number, y2: number) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const bow = Math.min(28, len * 0.16);
  return `M ${x1} ${y1} Q ${mx + nx * bow} ${my + ny * bow} ${x2} ${y2}`;
}

export function MLProteinNetwork({ className = "" }: { className?: string }) {
  const nodeById = useMemo(() => {
    const m = new Map<string, Node>();
    for (const n of NODES) m.set(n.id, n);
    return m;
  }, []);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none relative h-full min-h-[26rem] w-full overflow-hidden ${className}`}
    >
      {/* Soft warm halo wash behind the network */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_56%_46%,rgba(240,168,155,0.20),rgba(218,41,28,0.05)_36%,rgba(245,238,225,0)_72%),radial-gradient(ellipse_at_30%_28%,rgba(255,250,242,0.85),rgba(255,250,242,0)_58%)]" />

      <svg
        viewBox="0 0 800 800"
        preserveAspectRatio="xMidYMid meet"
        className="ml-net__svg absolute inset-0 h-full w-full"
        role="img"
      >
        <defs>
          {/* Radial gradients per tone — soft inner glow + darker rim for depth */}
          <radialGradient id="nodePearl" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="55%" stopColor="#f7f4ee" stopOpacity="1" />
            <stop offset="100%" stopColor="#c4956a" stopOpacity="0.95" />
          </radialGradient>
          <radialGradient id="nodeCream" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#fff8e9" stopOpacity="1" />
            <stop offset="55%" stopColor="#f3ead7" stopOpacity="1" />
            <stop offset="100%" stopColor="#9a8463" stopOpacity="0.95" />
          </radialGradient>
          <radialGradient id="nodeGold" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#f8e7c8" stopOpacity="1" />
            <stop offset="55%" stopColor="#d6a87a" stopOpacity="1" />
            <stop offset="100%" stopColor="#7a5436" stopOpacity="1" />
          </radialGradient>
          <radialGradient id="nodeCoral" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#ffd6c8" stopOpacity="1" />
            <stop offset="55%" stopColor="#f0a89b" stopOpacity="1" />
            <stop offset="100%" stopColor="#a04a3a" stopOpacity="1" />
          </radialGradient>
          <radialGradient id="nodeOxblood" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#ffb0a4" stopOpacity="1" />
            <stop offset="40%" stopColor="#da291c" stopOpacity="1" />
            <stop offset="100%" stopColor="#5e1410" stopOpacity="1" />
          </radialGradient>

          {/* Edge gradient unused now — solid stroke reads more reliably across angles */}
          <linearGradient id="edgePulse" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="rgba(255,244,222,0)" />
            <stop offset="50%" stopColor="rgba(255,244,222,1)" />
            <stop offset="100%" stopColor="rgba(255,244,222,0)" />
          </linearGradient>

          {/* Soft drop shadow for nodes — gives perceptual depth */}
          <filter id="nodeShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2.2" />
            <feOffset dx="0" dy="3" result="off" />
            <feFlood floodColor="#23201a" floodOpacity="0.18" />
            <feComposite in2="off" operator="in" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Halo blur for hub aura */}
          <filter id="haloBlur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" />
          </filter>
        </defs>

        {/* Group with slow drift */}
        <g className="ml-net__drift">
          {/* Edges — drawn first so they sit under the nodes */}
          <g className="ml-net__edges">
            {EDGES.map((e, i) => {
              const a = nodeById.get(e.from);
              const b = nodeById.get(e.to);
              if (!a || !b) return null;
              const d = curvedPath(a.x, a.y, b.x, b.y);
              const w = e.weight ?? 0.6;
              return (
                <g key={`e-${i}`} className="ml-net__edge">
                  {/* Solid warm-ink stroke — visible against cream bg */}
                  <path
                    d={d}
                    fill="none"
                    stroke="#7a5436"
                    strokeWidth={0.8 + w * 1.4}
                    strokeLinecap="round"
                    opacity={0.45 + w * 0.35}
                  />
                  {e.pulse && (
                    <path
                      d={d}
                      fill="none"
                      stroke="url(#edgePulse)"
                      strokeWidth={2.2}
                      strokeLinecap="round"
                      strokeDasharray="34 240"
                      style={{
                        animation: `ml-net-pulse ${4.5 + i * 0.6}s linear infinite`,
                      }}
                    />
                  )}
                </g>
              );
            })}
          </g>

          {/* Hub auras — toned down so they support, not dominate */}
          <g className="ml-net__halos">
            {NODES.filter((n) => n.hub).map((n) => (
              <circle
                key={`halo-${n.id}`}
                cx={n.x}
                cy={n.y}
                r={n.r * 3.5}
                fill={TONE_HALO[n.tone]}
                filter="url(#haloBlur)"
                opacity={0.28}
                className="ml-net__hub-halo"
                style={{ animationDelay: `${n.delay}s` }}
              />
            ))}
          </g>

          {/* Nodes */}
          <g className="ml-net__nodes">
            {NODES.map((n) => (
              <g
                key={n.id}
                className={`ml-net__node ${n.hub ? "ml-net__node--hub" : ""}`}
                style={{ animationDelay: `${n.delay}s` }}
                data-id={n.id}
              >
                {/* Outer halo (low alpha, blurred edge feel via separate circle) */}
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={n.r * 2.2}
                  fill={TONE_HALO[n.tone]}
                  opacity={n.hub ? 0.35 : 0.15}
                  className="ml-net__node-halo"
                />
                {/* The dot itself */}
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={n.r}
                  fill={TONE_FILL[n.tone]}
                  filter="url(#nodeShadow)"
                  className="ml-net__node-dot"
                />
              </g>
            ))}
          </g>
        </g>
      </svg>

      <style jsx>{`
        .ml-net__drift {
          transform-origin: 400px 400px;
          animation: ml-net-drift 22s ease-in-out infinite;
        }

        .ml-net__node {
          transform-origin: center;
          transform-box: fill-box;
          animation: ml-net-breathe 6s ease-in-out infinite;
        }
        .ml-net__node--hub {
          animation: ml-net-breathe-hub 4.2s ease-in-out infinite;
        }
        .ml-net__node-halo {
          transform-origin: center;
          transform-box: fill-box;
          animation: ml-net-halo 6s ease-in-out infinite;
        }
        .ml-net__node--hub .ml-net__node-halo {
          animation: ml-net-halo-hub 4.2s ease-in-out infinite;
        }
        .ml-net__hub-halo {
          transform-origin: center;
          transform-box: fill-box;
          animation: ml-net-aura 5s ease-in-out infinite;
        }

        @keyframes ml-net-drift {
          0%,
          100% {
            transform: translate3d(0, 0, 0) rotate(0deg);
          }
          50% {
            transform: translate3d(-6px, 4px, 0) rotate(0.4deg);
          }
        }
        @keyframes ml-net-breathe {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.92;
          }
          50% {
            transform: scale(1.12);
            opacity: 1;
          }
        }
        @keyframes ml-net-breathe-hub {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.22);
          }
        }
        @keyframes ml-net-halo {
          0%,
          100% {
            opacity: 0.12;
            transform: scale(1);
          }
          50% {
            opacity: 0.28;
            transform: scale(1.35);
          }
        }
        @keyframes ml-net-halo-hub {
          0%,
          100% {
            opacity: 0.32;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.55);
          }
        }
        @keyframes ml-net-aura {
          0%,
          100% {
            opacity: 0.4;
            transform: scale(1);
          }
          50% {
            opacity: 0.72;
            transform: scale(1.15);
          }
        }
        @keyframes ml-net-pulse {
          0% {
            stroke-dashoffset: 260;
          }
          100% {
            stroke-dashoffset: -260;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .ml-net__drift,
          .ml-net__node,
          .ml-net__node--hub,
          .ml-net__node-halo,
          .ml-net__hub-halo {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
