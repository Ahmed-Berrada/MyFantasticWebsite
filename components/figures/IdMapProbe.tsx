import { lobIdMapProbe as p } from "@/src/content/bench";
import type { Dict } from "@/src/content";
import type { Lang } from "@/src/content/types";
import { fill, fmtDec, fmtInt, fmtNs } from "@/src/lib/format";

type T = Dict["figures"]["probe"];

const pair = (a: number, b: number) => [Math.min(a, b), Math.max(a, b)] as const;

/** Before and after pre-sizing the engine's id map, from the scratch-copy measurements. */
export default function IdMapProbe({ t, lang }: { t: T; lang: Lang }) {
  const rows: { label: string; a: string; b: string }[] = [
    {
      label: t.max,
      a: fill(t.range, { a: fmtDec(pair(...(p.unmodified.maxNs as [number, number]))[0] / 1e6, lang, 1), b: fmtNs(pair(...(p.unmodified.maxNs as [number, number]))[1], lang) }),
      b: fill(t.range, { a: fmtDec(pair(...(p.idMapPresized.maxNs as [number, number]))[0] / 1e6, lang, 1), b: fmtNs(pair(...(p.idMapPresized.maxNs as [number, number]))[1], lang) }),
    },
    {
      label: t.throughput,
      a: fill(t.range, { a: fmtDec(Math.min(...p.unmodified.throughputMops), lang, 2), b: `${fmtDec(Math.max(...p.unmodified.throughputMops), lang, 2)} M ops/s` }),
      b: fill(t.range, { a: fmtDec(Math.min(...p.idMapPresized.throughputMops), lang, 2), b: `${fmtDec(Math.max(...p.idMapPresized.throughputMops), lang, 2)} M ops/s` }),
    },
    {
      label: t.p50,
      a: fill(t.range, { a: fmtInt(Math.min(...p.unmodified.p50Ns), lang), b: fmtNs(Math.max(...p.unmodified.p50Ns), lang) }),
      b: fill(t.range, { a: fmtInt(Math.min(...p.idMapPresized.p50Ns), lang), b: fmtNs(Math.max(...p.idMapPresized.p50Ns), lang) }),
    },
    {
      label: t.p999,
      a: fill(t.range, { a: fmtInt(Math.min(...p.unmodified.p999Ns), lang), b: fmtNs(Math.max(...p.unmodified.p999Ns), lang) }),
      b: fill(t.range, { a: fmtInt(Math.min(...p.idMapPresized.p999Ns), lang), b: fmtNs(Math.max(...p.idMapPresized.p999Ns), lang) }),
    },
  ];
  return (
    <figure className="my-10">
      <div className="scroll-x overflow-x-auto" tabIndex={0} role="region" aria-labelledby="idmapprobe-caption">
        <table className="w-full min-w-[480px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-line-2">
              <th className="px-3 py-2.5 font-medium text-ink-2">{t.metric}</th>
              <th className="px-3 py-2.5 font-medium text-ink-2">{t.unmodified}</th>
              <th className="px-3 py-2.5 font-medium text-ink-2">{t.presized}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label} className="border-b border-line">
                <th scope="row" className="px-3 py-2.5 font-medium">
                  {r.label}
                </th>
                <td className="px-3 py-2.5 font-mono text-[13px] tabular">{r.a}</td>
                <td className="px-3 py-2.5 font-mono text-[13px] tabular">{r.b}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <figcaption id="idmapprobe-caption" className="mt-3 max-w-[46rem] text-sm text-muted">{t.note}</figcaption>
    </figure>
  );
}
