"use client";
import { useOnScreen, usePrefersReducedMotion } from "@/src/lib/useInView";
import { monoWidth, wrap } from "@/src/lib/svgText";

export interface FlowNode {
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  sub?: string;
  core?: boolean;
}

export interface FlowEdge {
  id: string;
  d: string;
  dashed?: boolean;
  label?: { text: string; x: number; y: number };
}

export interface FlowDot {
  edge: string;
  begin: number;
  dur?: number;
  accent?: boolean;
}

interface Props {
  /** Unique per diagram on a page: SVG motion paths are referenced by id. */
  uid: string;
  aria: string;
  width: number;
  height: number;
  nodes: FlowNode[];
  edges: FlowEdge[];
  dots: FlowDot[];
  /** The same flow as a plain list for narrow screens, where the drawing would be too small to read. */
  steps: { title: string; sub?: string; core?: boolean }[];
  caption?: string;
}

const SUB = 10.5;
const TITLE_CHAR = 7.4; // average advance of the 14 px semibold title face

export default function FlowDiagram({ uid, aria, width, height, nodes, edges, dots, steps, caption }: Props) {
  const reduced = usePrefersReducedMotion();
  const [ref, onScreen] = useOnScreen<HTMLDivElement>();
  const animate = !reduced && onScreen;

  return (
    <figure ref={ref} className="my-10">
      <ol className="space-y-2 sm:hidden" aria-label={aria}>
        {steps.map((s, i) => (
          <li key={s.title}>
            <div className={`rounded-[6px] border px-4 py-3 ${s.core ? "border-ink bg-ink text-ground" : "border-line-2 bg-sheet"}`}>
              <p className="font-medium">{s.title}</p>
              {s.sub && <p className={`font-mono text-xs ${s.core ? "text-[#b9bec8]" : "text-muted"}`}>{s.sub}</p>}
            </div>
            {i < steps.length - 1 && <div className="mx-auto h-4 w-px bg-line-2" aria-hidden />}
          </li>
        ))}
      </ol>

      <svg viewBox={`0 0 ${width} ${height}`} className="hidden h-auto w-full sm:block" role="img" aria-label={aria}>
        <defs>
          <marker id={`${uid}-arrow`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,1 L9,5 L0,9 z" fill="var(--ink-2)" />
          </marker>
        </defs>
        {edges.map((e) => (
          <path
            key={e.id}
            id={`${uid}-${e.id}`}
            d={e.d}
            fill="none"
            stroke="var(--ink-2)"
            strokeWidth={1.4}
            strokeDasharray={e.dashed ? "4 4" : undefined}
            markerEnd={`url(#${uid}-arrow)`}
          />
        ))}
        {edges.map(
          (e) =>
            e.label && (
              <text key={`${e.id}-l`} x={e.label.x} y={e.label.y} fontSize={10.5} textAnchor="middle" fill="var(--muted)" fontFamily="var(--font-martian)">
                {e.label.text}
              </text>
            ),
        )}
        {nodes.map((n) => {
          const titleLines = wrap(n.title, Math.floor((n.w - 24) / TITLE_CHAR));
          const subLines = n.sub ? wrap(n.sub, Math.floor((n.w - 24) / monoWidth(SUB))) : [];
          const subStart = 23 + (titleLines.length - 1) * 17 + 17;
          return (
            <g key={n.title}>
              <rect x={n.x} y={n.y} width={n.w} height={n.h} rx={7} fill={n.core ? "var(--ink)" : "var(--sheet)"} stroke={n.core ? "var(--ink)" : "var(--line-2)"} />
              {titleLines.map((l, i) => (
                <text key={i} x={n.x + 12} y={n.y + 23 + i * 17} fontSize={14} fontWeight={600} fill={n.core ? "var(--ground)" : "var(--ink)"} fontFamily="var(--font-instrument)">
                  {l}
                </text>
              ))}
              {subLines.map((l, i) => (
                <text key={i} x={n.x + 12} y={n.y + subStart + i * 13} fontSize={SUB} fill={n.core ? "#b9bec8" : "var(--muted)"} fontFamily="var(--font-martian)">
                  {l}
                </text>
              ))}
            </g>
          );
        })}
        {animate &&
          dots.map((d, i) => (
            <circle key={i} r={3.6} fill={d.accent ? "var(--accent)" : "var(--ink)"} stroke="var(--ink)" strokeWidth={d.accent ? 1 : 0}>
              <animateMotion dur={`${d.dur ?? 1.4}s`} begin={`${d.begin}s`} repeatCount="indefinite">
                <mpath href={`#${uid}-${d.edge}`} />
              </animateMotion>
            </circle>
          ))}
      </svg>
      {caption && <figcaption className="mt-3 text-sm text-muted">{caption}</figcaption>}
    </figure>
  );
}
