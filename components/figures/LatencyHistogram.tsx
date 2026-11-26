import { histogramRun, lobReadmeMethod } from "@/src/content/bench";
import type { Dict } from "@/src/content";
import type { Lang } from "@/src/content/types";
import { fill, fmtNs } from "@/src/lib/format";

type T = Dict["figures"]["histogram"];

const W = 752;
const H = 300;
const M = { l: 46, r: 14, t: 18, b: 56 };
const PW = W - M.l - M.r;
const PH = H - M.t - M.b;

const decadeLabel = (v: number) => (v >= 1e6 ? `${v / 1e6} ms` : v >= 1e3 ? `${v / 1e3} µs` : `${v} ns`);
const countLabel = (v: number) => (v >= 1e6 ? `${v / 1e6}M` : v >= 1e3 ? `${v / 1e3}k` : `${v}`);

/** Every operation of one run, on log-log axes, with P50, P99 and P99.9 marked. Static SVG. */
export default function LatencyHistogram({ t, lang }: { t: T; lang: Lang }) {
  const r = lobReadmeMethod;
  const run = histogramRun(r);
  const step = Math.pow(2, 1 / r.histogram.bucketsPerOctave);
  const buckets = r.histogram.buckets;
  const lo = Math.pow(10, Math.floor(Math.log10(buckets[0][0])));
  const hi = Math.pow(10, Math.ceil(Math.log10(buckets[buckets.length - 1][0] * step)));
  const span = Math.log(hi / lo);
  const x = (v: number) => M.l + (Math.log(v / lo) / span) * PW;
  const maxCount = Math.max(...buckets.map(([, c]) => c));
  const yTop = Math.log10(maxCount) + 0.4;
  const y = (c: number) => M.t + PH - ((Math.log10(c) + 0.4) / yTop) * PH;

  const decades: number[] = [];
  for (let v = lo; v <= hi * 1.001; v *= 10) decades.push(v);
  const counts: number[] = [];
  for (let c = 1; c <= maxCount; c *= 10) counts.push(c);

  const marks = [
    { v: run.p50, label: "P50" },
    { v: run.p99, label: "P99" },
    { v: run.p999, label: "P99.9" },
  ];

  return (
    <figure className="my-10">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={t.aria}>
        {counts.map((c) => (
          <g key={c}>
            <line x1={M.l} x2={W - M.r} y1={y(c)} y2={y(c)} stroke="var(--line)" />
            <text x={M.l - 6} y={y(c) + 3.5} fontSize={10} textAnchor="end" fill="var(--muted)" fontFamily="var(--font-martian)">
              {countLabel(c)}
            </text>
          </g>
        ))}
        {decades.map((v) => (
          <g key={v}>
            <line x1={x(v)} x2={x(v)} y1={M.t} y2={M.t + PH} stroke="var(--line)" strokeDasharray="2 4" />
            <text x={x(v)} y={M.t + PH + 16} fontSize={10} textAnchor={v === decades[decades.length - 1] ? "end" : "middle"} fill="var(--muted)" fontFamily="var(--font-martian)">
              {decadeLabel(v)}
            </text>
          </g>
        ))}
        {buckets.map(([b, c]) => (
          <rect key={b} x={x(b)} y={y(c)} width={Math.max(1, x(b * step) - x(b) - 0.6)} height={M.t + PH - y(c)} fill="var(--ink-2)" opacity={0.78} />
        ))}
        {marks.map((m, i) => (
          <g key={m.label}>
            <line x1={x(m.v)} x2={x(m.v)} y1={M.t + 6 + i * 16} y2={M.t + PH} stroke="var(--ink)" strokeWidth={1.4} />
            <rect x={x(m.v) - 2} y={M.t + 6 + i * 16 - 2} width={4} height={4} fill="var(--accent)" stroke="var(--ink)" strokeWidth={1} />
            <text x={x(m.v) + 7} y={M.t + 10 + i * 16} fontSize={11} fill="var(--ink)" fontFamily="var(--font-martian)" stroke="var(--ground)" strokeWidth={4} strokeLinejoin="round" paintOrder="stroke">
              {m.label} {fmtNs(m.v, lang)}
            </text>
          </g>
        ))}
        <text x={M.l + PW / 2} y={H - 8} fontSize={11} textAnchor="middle" fill="var(--ink-2)" fontFamily="var(--font-instrument)">
          {t.x}
        </text>
        <text x={12} y={M.t + PH / 2} fontSize={11} textAnchor="middle" fill="var(--ink-2)" fontFamily="var(--font-instrument)" transform={`rotate(-90 12 ${M.t + PH / 2})`}>
          {t.y}
        </text>
      </svg>
      <figcaption className="mt-3 text-sm text-muted">{fill(t.caption, { n: r.runs.length })}</figcaption>
    </figure>
  );
}
