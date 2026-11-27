import { lobCommittedMethod, lobPublished, lobReadmeMethod, summarize, type BenchRun, type Summary } from "@/src/content/bench";
import type { Dict } from "@/src/content";
import type { Lang } from "@/src/content/types";
import { fill, fmtMops, fmtNs } from "@/src/lib/format";

type T = Dict["figures"]["results"];

const ROWS: { key: keyof BenchRun; label: keyof T }[] = [
  { key: "throughput", label: "throughput" },
  { key: "mean", label: "mean" },
  { key: "p50", label: "p50" },
  { key: "p99", label: "p99" },
  { key: "p999", label: "p999" },
  { key: "max", label: "max" },
];

function value(key: keyof BenchRun, v: number, lang: Lang, t: T): string {
  return key === "throughput" ? fill(t.perSecond, { n: fmtMops(v, lang) }) : fmtNs(v, lang);
}

function Cell({ s, k, lang, t }: { s: Summary; k: keyof BenchRun; lang: Lang; t: T }) {
  return (
    <td className="px-3 py-2.5 align-top">
      <span className="font-mono text-[13px] tabular text-ink">{value(k, s.median, lang, t)}</span>
      <span className="mt-0.5 block font-mono text-[11px] tabular text-muted">
        {fill(t.range, { a: value(k, s.min, lang, t), b: value(k, s.max, lang, t) })}
      </span>
    </td>
  );
}

/** The published figures next to two reproductions, computed from the stored runs. */
export default function LobResults({ t, lang }: { t: T; lang: Lang }) {
  const a = summarize(lobReadmeMethod);
  const b = summarize(lobCommittedMethod);
  const m = lobReadmeMethod.machine;
  const load = ((lobReadmeMethod.loadAverage1m.before + lobReadmeMethod.loadAverage1m.after) / 2).toFixed(1).replace(".", lang === "fr" ? "," : ".");
  return (
    <figure className="my-10">
      <div className="overflow-x-auto" tabIndex={0} role="region" aria-labelledby="lobresults-caption">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-line-2 align-bottom">
              <th className="px-3 py-2.5 font-medium text-ink-2">{t.metric}</th>
              <th className="px-3 py-2.5 font-medium text-ink-2">{t.published}</th>
              <th className="px-3 py-2.5 font-medium text-ink-2">{fill(t.readme, { n: lobReadmeMethod.runs.length })}</th>
              <th className="px-3 py-2.5 font-medium text-ink-2">{fill(t.committed, { n: lobCommittedMethod.runs.length })}</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map(({ key, label }) => {
              const pub = (lobPublished as Record<string, number>)[key];
              return (
                <tr key={key} className="border-b border-line">
                  <th scope="row" className="px-3 py-2.5 align-top font-medium">
                    {t[label] as string}
                  </th>
                  <td className="px-3 py-2.5 align-top font-mono text-[13px] tabular">
                    {pub === undefined ? <span className="text-muted">{t.notPublished}</span> : value(key, pub, lang, t)}
                  </td>
                  <Cell s={a[key]} k={key} lang={lang} t={t} />
                  <Cell s={b[key]} k={key} lang={lang} t={t} />
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <figcaption id="lobresults-caption" className="mt-3 max-w-[46rem] text-sm text-muted">
        {fill(t.machine, { model: m.model, cpu: m.cpu.replace(/\(R\)|\(TM\)/g, ""), os: m.os, compiler: m.compiler.replace(/\s*\(.*?\)/, ""), governor: m.governor, load })}
      </figcaption>
    </figure>
  );
}
