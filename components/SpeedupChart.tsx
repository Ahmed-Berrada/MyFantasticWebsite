"use client";
import { useInView } from "@/src/lib/useInView";
import { fill, fmtDec } from "@/src/lib/format";
import type { Dict } from "@/src/content";
import { pricerRun } from "@/src/content/bench/pricer";
import type { Lang } from "@/src/content/types";

/** The three timings of the same simulation, drawn to scale. Source: `src/content/bench/pricer.ts`. */
export default function SpeedupChart({ t, lang }: { t: Dict["work"]["pricerChart"]; lang: Lang }) {
  const [ref, seen] = useInView<HTMLDivElement>(0.4);
  const runs = [
    { label: t.python, stack: t.pythonStack, seconds: pricerRun.seconds.python },
    { label: t.numpy, stack: t.numpyStack, seconds: pricerRun.seconds.numpy },
    { label: t.cupy, stack: t.cupyStack, seconds: pricerRun.seconds.cupy, highlight: true },
  ];
  const base = runs[0].seconds;
  const numpy = runs[1].seconds;

  return (
    <figure ref={ref}>
      <ul className="space-y-4">
        {runs.map((r, i) => (
          <li key={r.label}>
            <div className="mb-1.5 flex items-baseline justify-between gap-3">
              <span className="text-sm">
                <span className={r.highlight ? "font-medium" : ""}>{r.label}</span> <span className="font-mono text-xs text-muted">{r.stack}</span>
              </span>
              <span className={`text-right font-mono text-sm tabular ${r.highlight ? "text-ink" : "text-ink-2"}`}>
                {fmtDec(r.seconds, lang, r.seconds < 1 ? 2 : r.seconds < 10 ? 1 : 0)} s{r.highlight ? `, ${fill(t.faster, { n: Math.round(numpy / r.seconds) })}` : ""}
              </span>
            </div>
            <div className="h-2.5 rounded-sm bg-sunken">
              <div
                className={`h-full rounded-sm transition-[width] duration-1000 ease-out ${r.highlight ? "bg-accent" : "bg-line-2"}`}
                style={{ width: seen ? `${Math.max(0.6, (r.seconds / base) * 100)}%` : "0%", transitionDelay: `${i * 150}ms` }}
              />
            </div>
          </li>
        ))}
      </ul>
      <figcaption className="mt-4 text-sm text-muted">{t.caption}</figcaption>
    </figure>
  );
}
