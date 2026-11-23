import { ArrowDown, ArrowUpRight } from "lucide-react";
import CountUp from "./CountUp";
import LiveOrderBook from "./LiveOrderBook";
import { profile } from "@/src/content/profile";

const figures = [
  { value: 163, unit: "ns", label: "median match latency", note: "C++17 engine" },
  { value: 3.46, decimals: 2, unit: "M/s", label: "orders processed", note: "single thread" },
  { value: 641, unit: "×", label: "Monte Carlo speedup", note: "Python → CUDA" },
  { value: 200, unit: "", label: "automated scenarios", note: "Siemens Mobility" },
];

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-28 pb-16 md:pt-36 md:pb-24">
      <div className="grid-paper pointer-events-none absolute inset-0 -z-10 opacity-70" aria-hidden />

      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 md:px-8 lg:grid-cols-[1fr_minmax(0,500px)] lg:gap-16">
        <div>
          <p className="mb-7 inline-flex items-center gap-2 rounded-full border border-line-2 bg-surface px-3 py-1 text-xs text-ink-2">
            <span className="size-1.5 rounded-full bg-bid" aria-hidden />
            {profile.availability}
          </p>

          <h1 className="text-[40px] leading-[1.04] font-semibold tracking-[-0.03em] text-balance sm:text-5xl lg:text-[60px]">
            Trading systems, engineered like <span className="whitespace-nowrap text-signal">safety&#8209;critical</span> software.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-2 text-pretty">
            I&apos;m Ahmed, a final-year engineering student at ESIEA. At Siemens Mobility I build the simulator and test
            automation for a safety-critical 5G train radio on the New York City subway. On my own time I build matching
            engines and pricers, and measure them in nanoseconds.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#work"
              className="inline-flex items-center gap-2 rounded-md bg-signal px-5 py-3 text-sm font-medium text-white transition-transform hover:-translate-y-px"
            >
              See the engineering <ArrowDown size={16} />
            </a>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-md border border-line-2 bg-surface px-5 py-3 text-sm font-medium transition-colors hover:border-ink"
            >
              Get in touch <ArrowUpRight size={16} />
            </a>
          </div>
        </div>

        <LiveOrderBook />
      </div>

      <ul className="mx-auto mt-16 grid max-w-6xl grid-cols-2 gap-px overflow-hidden border-y border-line bg-line md:mt-20 md:grid-cols-4 md:rounded-xl md:border">
        {figures.map((f) => (
          <li key={f.label} className="bg-paper px-5 py-5 md:px-6">
            <p className="font-mono text-2xl font-medium tracking-tight md:text-3xl">
              <CountUp to={f.value} decimals={f.decimals} />
              <span className="ml-0.5 text-signal">{f.unit}</span>
            </p>
            <p className="mt-1 text-sm text-ink-2">{f.label}</p>
            <p className="font-mono text-[11px] text-muted">{f.note}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
