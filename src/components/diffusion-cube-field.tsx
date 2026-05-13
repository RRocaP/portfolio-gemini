"use client";

import { motion, useReducedMotion } from "framer-motion";

const cubeData = [
  { x: 742, y: 132, size: 64, delay: 0.05, opacity: 0.92 },
  { x: 860, y: 200, size: 52, delay: 0.18, opacity: 0.84 },
  { x: 674, y: 266, size: 50, delay: 0.3, opacity: 0.78 },
  { x: 792, y: 342, size: 72, delay: 0.42, opacity: 0.9 },
  { x: 943, y: 384, size: 44, delay: 0.54, opacity: 0.7 },
  { x: 596, y: 438, size: 43, delay: 0.66, opacity: 0.68 },
] as const;

const diffusionSamples = [
  { x: 158, y: 184, r: 3.8, o: 0.38 },
  { x: 204, y: 251, r: 2.4, o: 0.28 },
  { x: 258, y: 315, r: 5.2, o: 0.44 },
  { x: 332, y: 238, r: 2.2, o: 0.24 },
  { x: 382, y: 379, r: 4.1, o: 0.36 },
  { x: 445, y: 282, r: 3.2, o: 0.33 },
  { x: 486, y: 441, r: 2.6, o: 0.28 },
  { x: 542, y: 352, r: 5.6, o: 0.42 },
  { x: 606, y: 225, r: 2.7, o: 0.3 },
  { x: 655, y: 486, r: 3.4, o: 0.28 },
  { x: 724, y: 406, r: 2.3, o: 0.26 },
  { x: 988, y: 165, r: 3.1, o: 0.26 },
  { x: 1046, y: 488, r: 2.6, o: 0.24 },
] as const;

const denoisePaths = [
  "M132 436 C240 308 370 384 492 294 C614 204 742 210 886 304",
  "M168 216 C300 286 349 150 482 213 C628 282 672 380 834 372",
  "M312 506 C410 420 520 472 616 394 C706 321 766 268 948 226",
] as const;

type CubeProps = {
  x: number;
  y: number;
  size: number;
  delay: number;
  opacity: number;
  reduceMotion: boolean;
};

function DiffusionCube({ x, y, size, delay, opacity, reduceMotion }: CubeProps) {
  const h = size * 0.56;

  return (
    <g transform={`translate(${x} ${y})`}>
      <motion.g
        initial={{ opacity: 0, y: 18, scale: 0.94 }}
        whileInView={{
          opacity,
          y: reduceMotion ? 0 : [0, -10, 0],
          scale: 1,
        }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{
          opacity: { delay, duration: 0.75 },
          scale: { delay, duration: 0.75, ease: [0.16, 1, 0.3, 1] },
          y: reduceMotion
            ? { duration: 0 }
            : {
                delay,
                duration: 8.5 + delay * 2,
                repeat: Infinity,
                ease: "easeInOut",
              },
        }}
      >
        <polygon
          points={`0,${h} ${size},0 ${size * 2},${h} ${size},${h * 2}`}
          fill="url(#diffusionCubeTop)"
          stroke="rgba(21,23,25,0.36)"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
        <polygon
          points={`0,${h} ${size},${h * 2} ${size},${h * 2 + size} 0,${h + size}`}
          fill="url(#diffusionCubeLeft)"
          stroke="rgba(21,23,25,0.22)"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
        <polygon
          points={`${size},${h * 2} ${size * 2},${h} ${size * 2},${h + size} ${size},${h * 2 + size}`}
          fill="url(#diffusionCubeRight)"
          stroke="rgba(21,23,25,0.24)"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d={`M${size} ${h * 2}V${h * 2 + size}M0 ${h}l${size} ${h} ${size}-${h}`}
          fill="none"
          stroke="rgba(255,255,255,0.48)"
          strokeWidth="1.15"
          vectorEffect="non-scaling-stroke"
        />
      </motion.g>
    </g>
  );
}

export function DiffusionCubeField() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.figure
      className="relative m-0 mb-12 min-h-[31rem] overflow-hidden rounded-lg border border-[#151719] bg-[#eafeef] shadow-[0_28px_90px_rgba(21,23,25,0.06)] md:mb-14 md:min-h-[36rem]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_74%_37%,rgba(126,118,199,0.18),rgba(126,118,199,0)_45%),radial-gradient(ellipse_at_26%_58%,rgba(117,214,199,0.28),rgba(117,214,199,0)_50%),linear-gradient(180deg,rgba(255,255,255,0.52),rgba(234,254,239,0.76))]" />
      <svg
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1200 620"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern
            id="diffusionFieldGrid"
            width="48"
            height="48"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M48 0H0V48"
              fill="none"
              stroke="rgba(21,23,25,0.08)"
              strokeWidth="0.8"
            />
          </pattern>
          <radialGradient id="diffusionDensity" cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="36%" stopColor="#beece9" stopOpacity="0.48" />
            <stop offset="72%" stopColor="#a89de0" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#eafeef" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="diffusionPath" x1="120" x2="1020" y1="210" y2="470">
            <stop offset="0%" stopColor="#151719" stopOpacity="0.22" />
            <stop offset="42%" stopColor="#168f9b" stopOpacity="0.68" />
            <stop offset="100%" stopColor="#8176cf" stopOpacity="0.44" />
          </linearGradient>
          <linearGradient id="diffusionPulse" x1="120" x2="1020" y1="210" y2="470">
            <stop offset="0%" stopColor="#fff8ef" stopOpacity="0" />
            <stop offset="50%" stopColor="#fff8ef" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#7de1ed" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="diffusionCubeTop" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#9fe4e7" />
          </linearGradient>
          <linearGradient id="diffusionCubeLeft" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#bff0e3" />
            <stop offset="100%" stopColor="#5eb8a9" />
          </linearGradient>
          <linearGradient id="diffusionCubeRight" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#c6bdf0" />
            <stop offset="100%" stopColor="#6e88d6" />
          </linearGradient>
          <filter id="diffusionGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="12" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="0 0 0 0 0.31 0 0 0 0 0.85 0 0 0 0 0.82 0 0 0 0.42 0"
            />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect width="1200" height="620" fill="url(#diffusionFieldGrid)" opacity="0.42" />
        <motion.ellipse
          cx="438"
          cy="338"
          rx="296"
          ry="178"
          fill="url(#diffusionDensity)"
          animate={
            shouldReduceMotion
              ? undefined
              : {
                  opacity: [0.7, 0.98, 0.7],
                  scale: [1, 1.025, 1],
                }
          }
          transition={{ duration: 9.5, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "438px 338px" }}
        />

        {[0, 1, 2, 3, 4, 5].map((index) => (
          <motion.ellipse
            key={index}
            cx="438"
            cy="338"
            rx={92 + index * 52}
            ry={44 + index * 30}
            fill="none"
            stroke={index % 2 ? "rgba(129,118,207,0.28)" : "rgba(21,23,25,0.15)"}
            strokeWidth="1.05"
            vectorEffect="non-scaling-stroke"
            transform={`rotate(${-22 + index * 4} 438 338)`}
            animate={
              shouldReduceMotion
                ? undefined
                : {
                    opacity: [0.2, 0.42, 0.2],
                    rotate: [-22 + index * 4, -19 + index * 4, -22 + index * 4],
                  }
            }
            transition={{
              duration: 7.8 + index,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

        <g filter="url(#diffusionGlow)">
          {denoisePaths.map((path, index) => (
            <g key={path}>
              <motion.path
                d={path}
                fill="none"
                stroke="url(#diffusionPath)"
                strokeWidth={index === 0 ? 2.2 : 1.25}
                strokeDasharray={index === 1 ? "5 12" : "2 10"}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                initial={{ pathLength: shouldReduceMotion ? 1 : 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: index === 0 ? 0.64 : 0.44 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ delay: 0.12 + index * 0.16, duration: 1.1, ease: "easeOut" }}
              />
              {!shouldReduceMotion ? (
                <motion.path
                  d={path}
                  fill="none"
                  stroke="url(#diffusionPulse)"
                  strokeWidth="4.2"
                  strokeDasharray="0 52 40 520"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                  animate={{ strokeDashoffset: [0, -520] }}
                  transition={{
                    delay: index * 0.38,
                    duration: 5.2,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              ) : null}
            </g>
          ))}
        </g>

        {diffusionSamples.map((sample, index) => (
          <motion.circle
            key={`${sample.x}-${sample.y}`}
            cx={sample.x}
            cy={sample.y}
            r={sample.r}
            fill={index % 3 === 0 ? "#151719" : index % 3 === 1 ? "#238e90" : "#8176cf"}
            opacity={sample.o}
            animate={
              shouldReduceMotion
                ? undefined
                : { opacity: [sample.o * 0.45, sample.o, sample.o * 0.45] }
            }
            transition={{
              duration: 4.6 + index * 0.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

        <g>
          {cubeData.map((cube) => (
            <DiffusionCube
              key={`${cube.x}-${cube.y}`}
              x={cube.x}
              y={cube.y}
              size={cube.size}
              delay={cube.delay}
              opacity={cube.opacity}
              reduceMotion={Boolean(shouldReduceMotion)}
            />
          ))}
        </g>

        <path
          d="M690 524 C770 476 838 514 928 462 C1006 416 1032 330 1110 300"
          fill="none"
          stroke="rgba(21,23,25,0.24)"
          strokeDasharray="4 12"
          strokeWidth="1.3"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d="M686 126 C740 84 832 96 888 150 C952 212 908 292 988 330 C1032 350 1078 340 1112 312"
          fill="none"
          stroke="rgba(21,23,25,0.18)"
          strokeDasharray="3 10"
          strokeWidth="1.1"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_62%_50%,rgba(234,254,239,0)_42%,rgba(234,254,239,0.18)_72%,rgba(234,254,239,0.82)_100%)]" />
      <figcaption className="sr-only">
        Machine-learning protein design visualized as a diffusion field, attention
        paths, and latent cube states.
      </figcaption>
    </motion.figure>
  );
}
