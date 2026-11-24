"use client";
import { useInView } from "@/src/lib/useInView";

interface Row {
  label: string;
  ns: number;
  display: string;
  highlight?: boolean;
}

// Order-of-magnitude reference figures (after "Latency numbers every programmer should know").
const rows: Row[] = [
  { label: "L1 cache reference", ns: 1, display: "~1 ns" },
  { label: "Mutex lock / unlock", ns: 25, display: "~25 ns" },
  { label: "Main memory reference", ns: 100, display: "~100 ns" },
  { label: "Match one order (lob-engine, median)", ns: 163, display: "163 ns", highlight: true },
  { label: "Round trip within a datacenter", ns: 500_000, display: "~500 µs" },
  { label: "Round trip Paris ↔ New York", ns: 70_000_000, display: "~70 ms" },
];

const MIN = 0.3; // ns, left edge
const MAX = 1e8; // ns, right edge
const pos = (ns: number) => (Math.log10(ns / MIN) / Math.log10(MAX / MIN)) * 100;
const ticks = [
  { ns: 1, label: "1 ns" },
  { ns: 1e3, label: "1 µs" },
  { ns: 1e6, label: "1 ms" },
];

export default function LatencyScale() {
  const [ref, seen] = useInView<HTMLDivElement>(0.3);

  return (
    <figure ref={ref}>
      <div className="relative">
        {/* decade grid */}
        <div className="pointer-events-none absolute inset-y-0 right-[74px] left-0 sm:left-[calc(38%+1rem)]" aria-hidden>
          {ticks.map((t) => (
            <div key={t.ns} className="absolute inset-y-0 border-l border-dashed border-line-2" style={{ left: `${pos(t.ns)}%` }}>
              <span className="absolute -top-0 -translate-x-1/2 font-mono text-[10px] whitespace-nowrap text-muted">{t.label}</span>
            </div>
          ))}
        </div>

        <ul className="relative space-y-2.5 pt-6">
          {rows.map((r, i) => (
            <li key={r.label} className="grid items-center gap-x-4 gap-y-1 sm:grid-cols-[38%_1fr]">
              <span className={`text-sm ${r.highlight ? "font-medium text-ink" : "text-ink-2"}`}>{r.label}</span>
              <div className="flex items-center gap-2.5">
                <div className="relative h-5 flex-1">
                  <div
                    className={`absolute inset-y-0 left-0 rounded-r-sm transition-[width] duration-1000 ease-out ${
                      r.highlight ? "bg-ink" : "bg-line-2"
                    }`}
                    style={{ width: seen ? `${pos(r.ns)}%` : "0%", transitionDelay: `${i * 90}ms` }}
                  />
                </div>
                <span className={`w-16 shrink-0 text-right font-mono text-xs tabular ${r.highlight ? "text-ink" : "text-muted"}`}>
                  {r.display}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <figcaption className="mt-5 text-sm text-muted">
        Log scale. Reference rows are order-of-magnitude figures. In 163 ns, light travels about 49 metres.
      </figcaption>
    </figure>
  );
}
