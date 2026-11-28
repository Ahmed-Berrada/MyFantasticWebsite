"use client";
import { useEffect, useMemo, useRef } from "react";
import { prng } from "@/src/lib/prng";
import { useOnScreen, usePrefersReducedMotion } from "@/src/lib/useInView";

const W = 560;
const H = 300;
const LAYERS = [3, 5, 6, 5, 2];
const PULSES = 9;

interface Props {
  status: string;
  header: string;
  aria: string;
}

/**
 * Stand-in for the AI project while it is built: a small layered network with signals travelling through it.
 * SMIL animations, paused while off-screen and never started under reduced motion. Nothing here claims a result.
 */
export default function AiPlaceholder({ status, header, aria }: Props) {
  const reduced = usePrefersReducedMotion();
  const [ref, onScreen] = useOnScreen<HTMLDivElement>();
  const svg = useRef<SVGSVGElement>(null);

  const { nodes, edges, routes } = useMemo(() => {
    const rand = prng(7);
    const nodes = LAYERS.map((n, l) =>
      Array.from({ length: n }, (_, i) => ({ x: 48 + (l * (W - 96)) / (LAYERS.length - 1), y: ((i + 1) * H) / (n + 1) })),
    );
    const edges: [number, number, number, number][] = [];
    nodes.slice(0, -1).forEach((layer, l) =>
      layer.forEach((a) => nodes[l + 1].forEach((b) => edges.push([a.x, a.y, b.x, b.y]))),
    );
    // Each pulse follows one path from the first layer to the last.
    const routes = Array.from({ length: PULSES }, () =>
      nodes.map((layer) => layer[Math.floor(rand() * layer.length)]).map((p, i) => `${i ? "L" : "M"}${p.x},${p.y}`).join(" "),
    );
    return { nodes, edges, routes };
  }, []);

  useEffect(() => {
    const el = svg.current;
    if (!el) return;
    if (reduced || !onScreen) el.pauseAnimations();
    else el.unpauseAnimations();
  }, [reduced, onScreen]);

  return (
    <div ref={ref} className="overflow-hidden rounded-[6px] border border-line-2 bg-ink">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 font-mono text-xs">
        <span className="text-[#b9bec8]">{header}</span>
        <span className="flex items-center gap-2 text-ground">
          <span className="relative flex size-2">
            {!reduced && <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60" />}
            <span className="relative inline-flex size-2 rounded-full bg-accent" />
          </span>
          {status}
        </span>
      </div>
      <svg ref={svg} viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label={aria}>
        {edges.map(([x1, y1, x2, y2], i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#ffffff" strokeOpacity={0.07} />
        ))}
        {nodes.flat().map((n, i) => (
          <circle key={i} cx={n.x} cy={n.y} r={5} fill="#121417" stroke="#5d636d" strokeWidth={1.5} />
        ))}
        {routes.map((d, i) => (
          <g key={i}>
            <path d={d} fill="none" stroke="#ffc400" strokeOpacity={0.18} strokeWidth={1.5} />
            <circle r={4} fill="#ffc400">
              <animateMotion dur={`${2.6 + (i % 4) * 0.45}s`} begin={`-${i * 0.37}s`} repeatCount="indefinite" path={d} keyPoints="0;1" keyTimes="0;1" calcMode="linear" />
            </circle>
          </g>
        ))}
      </svg>
    </div>
  );
}
