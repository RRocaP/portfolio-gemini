"use client";

/**
 * 1:1 TSX port of the user's original Astro CollaborationNetworkViz
 * (from /Users/ramon/Portfolio commit d438bac). Same node positions,
 * same gradients, same connection lines, same pulse-ring CSS keyframes.
 * Only differences from the original are framework-syntactic (Astro → JSX)
 * and the surrounding stats/sidebar are stripped — the SVG itself is verbatim.
 */

type NodeDef = {
  id: string;
  x: number;
  y: number;
  size: number; // matches original `pos.size` (radius = size/10)
  type: "primary" | "institution" | "collaborator";
  name: string;
};

const nodePositions: NodeDef[] = [
  { id: "ramon",           x: 50, y: 50, size: 60, type: "primary",       name: "Ramon Roca Pinilla" },
  { id: "cmri",            x: 25, y: 25, size: 45, type: "institution",   name: "Children's Medical Research Institute" },
  { id: "uab",             x: 75, y: 25, size: 50, type: "institution",   name: "Universitat Autònoma de Barcelona" },
  { id: "international_1", x: 15, y: 75, size: 35, type: "collaborator",  name: "European Collaborators" },
  { id: "international_2", x: 85, y: 75, size: 30, type: "collaborator",  name: "US Research Partners" },
  { id: "australia",       x: 50, y: 85, size: 40, type: "collaborator",  name: "Australian Networks" },
];

const fillGradient: Record<NodeDef["type"], string> = {
  primary:       "url(#primaryGradient)",
  institution:   "url(#institutionGradient)",
  collaborator:  "url(#collaboratorGradient)",
};

const pulseStroke: Record<NodeDef["type"], string> = {
  primary:       "#EF4444",
  institution:   "#3B82F6",
  collaborator:  "#10B981",
};

export function MLProteinNetwork({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none relative h-full min-h-[26rem] w-full overflow-hidden rounded-2xl bg-[#0E1219] ${className}`}
    >
      <svg
        className="w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <radialGradient id="primaryGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" style={{ stopColor: "#EF4444", stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: "#DC2626", stopOpacity: 0.8 }} />
          </radialGradient>
          <radialGradient id="institutionGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" style={{ stopColor: "#3B82F6", stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: "#2563EB", stopOpacity: 0.8 }} />
          </radialGradient>
          <radialGradient id="collaboratorGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" style={{ stopColor: "#10B981", stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: "#059669", stopOpacity: 0.8 }} />
          </radialGradient>

          <filter id="glow">
            <feGaussianBlur stdDeviation="0.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Connection lines from centre to each satellite */}
        {nodePositions.slice(1).map((node, index) => (
          <line
            key={`l-${node.id}`}
            x1="50" y1="50"
            x2={node.x} y2={node.y}
            stroke="#374151"
            strokeWidth="0.3"
            opacity="0.6"
            filter="url(#glow)"
            className="connection-line"
            style={{ animationDelay: `${index * 0.2}s` }}
          />
        ))}

        {/* Network nodes */}
        {nodePositions.map((pos, index) => (
          <g
            key={`n-${pos.id}`}
            className="network-node"
            style={{ animationDelay: `${index * 0.3}s` }}
          >
            <circle
              cx={pos.x}
              cy={pos.y}
              r={pos.size / 10}
              fill={fillGradient[pos.type]}
              stroke="#1F2937"
              strokeWidth="0.5"
            />
            <circle
              cx={pos.x}
              cy={pos.y}
              r={pos.size / 10}
              fill="none"
              stroke={pulseStroke[pos.type]}
              strokeWidth="0.2"
              opacity="0"
              className="pulse-ring"
            />
          </g>
        ))}
      </svg>

      <style jsx>{`
        .network-node {
          animation: nodeAppear 0.6s ease-out;
          animation-fill-mode: both;
        }
        .connection-line {
          stroke-dasharray: 10;
          stroke-dashoffset: 10;
          animation: drawLine 1s ease-out forwards;
          animation-fill-mode: both;
        }
        @keyframes nodeAppear {
          from { opacity: 0; transform: scale(0.3); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes drawLine {
          to { stroke-dashoffset: 0; }
        }
        .pulse-ring {
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%   { opacity: 1;   r: 0; }
          70%  { opacity: 0.5; r: 8; }
          100% { opacity: 0;   r: 12; }
        }
        @media (prefers-reduced-motion: reduce) {
          .network-node, .connection-line, .pulse-ring {
            animation: none !important;
          }
          .pulse-ring { display: none; }
        }
      `}</style>
    </div>
  );
}
