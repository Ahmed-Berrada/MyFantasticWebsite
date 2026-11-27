import { monoWidth, wrap } from "@/src/lib/svgText";
import type { Dict } from "@/src/content";

type T = Dict["figures"]["structure"];

const bids = [
  { price: "100.08", n: 4 },
  { price: "100.07", n: 2 },
  { price: "100.06", n: 1 },
];
const asks = [
  { price: "100.09", n: 2 },
  { price: "100.10", n: 4 },
  { price: "100.12", n: 1 },
];

function Side({ x, title, note, levels, side }: { x: number; title: string; note: string; levels: typeof bids; side: "bid" | "ask" }) {
  const fill = side === "bid" ? "var(--bid-soft)" : "var(--ask-soft)";
  const stroke = side === "bid" ? "var(--bid)" : "var(--ask)";
  return (
    <g>
      <text x={x} y={18} fontSize={15} fontWeight={600} fill="var(--ink)" fontFamily="var(--font-instrument)">
        {title}
      </text>
      <text x={x} y={34} fontSize={10.5} fill="var(--muted)" fontFamily="var(--font-martian)">
        {note}
      </text>
      {levels.map((l, i) => {
        const y = 62 + i * 40;
        return (
          <g key={l.price}>
            <rect x={x} y={y} width={72} height={28} rx={4} fill="var(--sheet)" stroke="var(--line-2)" />
            <text x={x + 10} y={y + 18} fontSize={12} fill={stroke} fontFamily="var(--font-martian)">
              {l.price}
            </text>
            <line x1={x + 72} x2={x + 86 + l.n * 32} y1={y + 14} y2={y + 14} stroke="var(--line-2)" />
            {Array.from({ length: l.n }, (_, k) => (
              <rect key={k} x={x + 86 + k * 32} y={y + 5} width={24} height={18} rx={3} fill={fill} stroke={stroke} strokeOpacity={0.7} />
            ))}
          </g>
        );
      })}
    </g>
  );
}

function Box({ x, y, w, title, note }: { x: number; y: number; w: number; title: string; note: string }) {
  const lines = wrap(note, Math.floor((w - 24) / monoWidth(10.5)));
  return (
    <g>
      <rect x={x} y={y} width={w} height={26 + lines.length * 13 + 16} rx={7} fill="var(--sunken)" stroke="var(--line-2)" strokeDasharray="4 3" />
      <text x={x + 12} y={y + 22} fontSize={14} fontWeight={600} fill="var(--ink)" fontFamily="var(--font-instrument)">
        {title}
      </text>
      {lines.map((l, i) => (
        <text key={i} x={x + 12} y={y + 40 + i * 13} fontSize={10.5} fill="var(--muted)" fontFamily="var(--font-martian)">
          {l}
        </text>
      ))}
    </g>
  );
}

/** Static drawing of the data structures of lob-engine, Order Book's C++ prototype. */
export default function BookStructure({ t }: { t: T }) {
  return (
    <figure className="my-10">
      {/* Below 640 px the drawing would shrink its text to 4 or 5 px: keep it legible and let it scroll instead. */}
      <div className="scroll-x overflow-x-auto" tabIndex={0} role="region" aria-label={t.aria}>
        <svg viewBox="0 0 752 296" className="h-auto w-full min-w-[640px]" role="img" aria-label={t.aria}>
          <Side x={4} title={t.bids} note={t.bidsNote} levels={bids} side="bid" />
          <Side x={392} title={t.asks} note={t.asksNote} levels={asks} side="ask" />
          <text x={4} y={52} fontSize={10.5} fill="var(--muted)" fontFamily="var(--font-martian)">
            {t.level}
          </text>
          <text x={90} y={52} fontSize={10.5} fill="var(--muted)" fontFamily="var(--font-martian)">
            {t.fifo}
          </text>
          <Box x={4} y={204} w={356} title={t.pool} note={t.poolNote} />
          <Box x={392} y={204} w={356} title={t.ids} note={t.idsNote} />
        </svg>
      </div>
    </figure>
  );
}
