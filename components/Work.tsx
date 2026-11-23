"use client";
import { ArrowUpRight } from "lucide-react";
import SectionHeader from "./SectionHeader";
import ArchitectureDiagram from "./ArchitectureDiagram";
import LatencyScale from "./LatencyScale";
import MonteCarloLab from "./MonteCarloLab";
import SpeedupChart from "./SpeedupChart";
import { useReveal } from "@/src/lib/useInView";

const orderBookDecisions = [
  {
    title: "One writer per instrument",
    body: "LMAX-style: a single thread owns each book, so the hot path takes no locks and event order is deterministic.",
  },
  {
    title: "Journal first, then match",
    body: "Every accepted order is appended to a write-ahead journal. After a crash, replaying it rebuilds the exact same book.",
  },
  {
    title: "Venue-style order entry",
    body: "FIX 4.4 sessions through QuickFIX/J, plus a REST interface described with OpenAPI.",
  },
  {
    title: "Correctness enforced by tooling",
    body: "Property-based tests (jqwik), mutation testing (PIT), ArchUnit rules and JaCoCo coverage, all gated in CI.",
  },
];

export default function Work() {
  const ref = useReveal<HTMLElement>();

  return (
    <section id="work" ref={ref} className="border-t border-line py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <SectionHeader
          index="01"
          label="Selected work"
          title="Two systems, measured end to end."
          lede="I build trading infrastructure the way safety-critical software is built: deterministic, journaled, and tested until it is boring."
        />

        {/* ---- Order book ---- */}
        <article className="reveal">
          <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-line pb-5">
            <div>
              <p className="font-mono text-xs text-muted">Project A · Java 21 · C++17 · FIX 4.4</p>
              <h3 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">Order Book: limit order book matching engine</h3>
            </div>
            <div className="flex gap-2">
              <RepoLink href="https://github.com/Ahmed-Berrada/Order_Book" label="Order_Book" />
              <RepoLink href="https://github.com/Ahmed-Berrada/lob-engine" label="lob-engine" />
            </div>
          </div>

          <div className="grid gap-12 pt-10 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
            <ol className="space-y-6">
              {orderBookDecisions.map((d, i) => (
                <li key={d.title} className="grid grid-cols-[2rem_1fr]">
                  <span className="font-mono text-sm text-signal tabular">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <p className="font-medium">{d.title}</p>
                    <p className="mt-1 leading-relaxed text-ink-2">{d.body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div>
              <p className="mb-4 font-mono text-xs tracking-wider text-muted uppercase">Message path</p>
              <ArchitectureDiagram />
            </div>
          </div>

          <div className="mt-14 grid gap-10 border-t border-line pt-10 lg:grid-cols-[1fr_2fr] lg:gap-16">
            <div>
              <p className="font-mono text-xs tracking-wider text-muted uppercase">C++17 prototype</p>
              <p className="mt-3 text-lg leading-relaxed text-ink-2">
                Pool allocator and intrusive lists keep each order in pre-allocated memory, so cancel is{" "}
                <span className="font-mono text-ink">O(1)</span> and nothing is allocated on the hot path.
              </p>
              <dl className="mt-6 grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-muted">Median latency</dt>
                  <dd className="font-mono text-2xl">163 ns</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted">Throughput</dt>
                  <dd className="font-mono text-2xl">3.46M/s</dd>
                </div>
              </dl>
            </div>
            <div>
              <p className="mb-1 font-mono text-xs tracking-wider text-muted uppercase">Latency in context</p>
              <LatencyScale />
            </div>
          </div>
        </article>

        {/* ---- Monte Carlo ---- */}
        <article className="reveal mt-28">
          <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-line pb-5">
            <div>
              <p className="font-mono text-xs text-muted">Project B · Python · NumPy · Numba CUDA · CuPy</p>
              <h3 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">GPU-accelerated Monte Carlo option pricer</h3>
            </div>
            <RepoLink href="https://github.com/Ahmed-Berrada/Monte-Carlo-Option-Pricing" label="Monte-Carlo-Option-Pricing" />
          </div>

          <div className="grid gap-12 pt-10 lg:grid-cols-[1.25fr_1fr] lg:gap-16">
            <div>
              <MonteCarloLab />
              <p className="mt-3 text-sm text-muted">
                Running live in your browser: antithetic variates, Box-Muller normals, converging on the closed-form price.
              </p>
            </div>
            <div>
              <p className="text-lg leading-relaxed text-ink-2">
                Prices European options by simulating geometric Brownian motion under the risk-neutral measure. Every path
                is independent, so the problem is embarrassingly parallel. Moving it from Python loops to NumPy, then to
                the GPU, cuts the same run from five minutes to under half a second.
              </p>
              <div className="mt-10">
                <p className="mb-4 font-mono text-xs tracking-wider text-muted uppercase">Same simulation, three runtimes</p>
                <SpeedupChart />
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

export function RepoLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 rounded-md border border-line-2 bg-surface px-3 py-1.5 font-mono text-xs transition-colors hover:border-ink"
    >
      {label} <ArrowUpRight size={13} />
    </a>
  );
}
