"use client";
import { useOnScreen, usePrefersReducedMotion } from "@/src/lib/useInView";

interface Node {
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  sub: string;
  tone?: "core";
}

const nodes: Node[] = [
  { x: 4, y: 52, w: 132, h: 54, title: "FIX 4.4", sub: "QuickFIX/J" },
  { x: 4, y: 186, w: 132, h: 54, title: "REST", sub: "OpenAPI" },
  { x: 176, y: 119, w: 132, h: 54, title: "Sequencer", sub: "WAL journal" },
  { x: 348, y: 119, w: 132, h: 54, title: "Matching", sub: "single writer", tone: "core" },
  { x: 520, y: 52, w: 116, h: 54, title: "Executions", sub: "reports" },
  { x: 520, y: 186, w: 116, h: 54, title: "Market data", sub: "L2 depth" },
];

const paths = {
  fix: "M136,79 C160,79 150,146 176,146",
  rest: "M136,213 C160,213 150,146 176,146",
  seq: "M308,146 L348,146",
  exec: "M480,146 C500,146 496,79 520,79",
  md: "M480,146 C500,146 496,213 520,213",
  wal: "M242,173 L242,226",
};

const dots: { path: keyof typeof paths; begin: number; color: string; dur?: number }[] = [
  { path: "fix", begin: 0, color: "var(--accent)" },
  { path: "fix", begin: 0.8, color: "var(--accent)" },
  { path: "rest", begin: 0.4, color: "var(--accent)" },
  { path: "seq", begin: 0.2, color: "var(--ink)", dur: 0.8 },
  { path: "seq", begin: 0.6, color: "var(--ink)", dur: 0.8 },
  { path: "wal", begin: 0.1, color: "var(--running)", dur: 0.9 },
  { path: "exec", begin: 0.5, color: "var(--bid)" },
  { path: "md", begin: 0.9, color: "var(--bid)" },
  { path: "md", begin: 0.1, color: "var(--bid)" },
];

export default function ArchitectureDiagram() {
  const reduced = usePrefersReducedMotion();
  const [ref, onScreen] = useOnScreen<HTMLDivElement>();
  const animate = !reduced && onScreen;

  return (
    <div ref={ref} className="w-full">
      {/* Narrow screens: the same flow, stacked. */}
      <ol className="space-y-2 sm:hidden" aria-label="Order flow">
        {[
          ["FIX 4.4 and REST", "order entry"],
          ["Sequencer", "write-ahead journal, replay on restart"],
          ["Matching", "single writer per instrument"],
          ["Executions and market data", "reports and L2 depth"],
        ].map(([title, sub], i, all) => (
          <li key={title}>
            <div className={`rounded-lg border px-4 py-3 ${i === 2 ? "border-ink bg-ink text-ground" : "border-line-2 bg-sheet"}`}>
              <p className="font-medium">{title}</p>
              <p className={`font-mono text-xs ${i === 2 ? "text-[#b9bec8]" : "text-muted"}`}>{sub}</p>
            </div>
            {i < all.length - 1 && <div className="mx-auto h-4 w-px bg-line-2" aria-hidden />}
          </li>
        ))}
      </ol>

      <svg viewBox="0 0 640 270" className="hidden h-auto w-full sm:block" role="img" aria-labelledby="arch-title">
        <title id="arch-title">
          Order flow: FIX and REST gateways feed a sequencer that journals every order, then a single-writer matching
          thread per instrument publishes executions and market data.
        </title>
        {Object.entries(paths).map(([k, d]) => (
          <path key={k} id={`arch-${k}`} d={d} fill="none" stroke="var(--line-2)" strokeWidth={1.5} strokeDasharray={k === "wal" ? "4 4" : undefined} />
        ))}

        {nodes.map((n) => (
          <g key={n.title}>
            <rect
              x={n.x}
              y={n.y}
              width={n.w}
              height={n.h}
              rx={8}
              fill={n.tone === "core" ? "var(--ink)" : "var(--sheet)"}
              stroke={n.tone === "core" ? "var(--ink)" : "var(--line-2)"}
            />
            <text x={n.x + 14} y={n.y + 24} fontSize={16} fontWeight={500} fill={n.tone === "core" ? "var(--ground)" : "var(--ink)"} fontFamily="var(--font-sans)">
              {n.title}
            </text>
            <text x={n.x + 14} y={n.y + 42} fontSize={12.5} fill={n.tone === "core" ? "#b9bec8" : "var(--muted)"} fontFamily="var(--font-mono)">
              {n.sub}
            </text>
          </g>
        ))}

        {/* Journal on disk */}
        <g>
          <rect x={188} y={226} width={108} height={34} rx={6} fill="var(--sunken)" stroke="var(--line-2)" strokeDasharray="4 3" />
          <text x={242} y={247} fontSize={12} textAnchor="middle" fill="var(--ink-2)" fontFamily="var(--font-mono)">
            journal, replay
          </text>
        </g>

        {animate &&
          dots.map((d, i) => (
            <circle key={i} r={3.5} fill={d.color}>
              <animateMotion dur={`${d.dur ?? 1.2}s`} begin={`${d.begin}s`} repeatCount="indefinite" rotate="auto">
                <mpath href={`#arch-${d.path}`} />
              </animateMotion>
            </circle>
          ))}
      </svg>
    </div>
  );
}
