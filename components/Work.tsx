import ArchitectureDiagram from "./ArchitectureDiagram";
import LatencyScale from "./LatencyScale";
import LiveOrderBook from "./LiveOrderBook";
import MonteCarloLab from "./MonteCarloLab";
import SpeedupChart from "./SpeedupChart";

const orderBookDecisions = [
  {
    title: "One writer per instrument",
    body: "A single thread owns each book, LMAX-style. The hot path takes no locks and the order of events is deterministic.",
  },
  {
    title: "Journal first, then match",
    body: "Every accepted order goes to a write-ahead journal before it is matched. After a crash, replaying the journal rebuilds the exact same book.",
  },
  {
    title: "Orders in the way a venue takes them",
    body: "FIX 4.4 order entry through QuickFIX/J, plus a REST API.",
  },
  {
    title: "Correctness checked by machines",
    body: "Property-based tests (jqwik), mutation testing (PIT), ArchUnit rules and JaCoCo coverage, all enforced in CI.",
  },
];

function Repo({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="link">
      {children}
    </a>
  );
}

export default function Work() {
  return (
    <section id="work" className="border-t border-line-2 py-24 md:py-36">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,36rem)] lg:items-end lg:gap-24">
          <h2 className="font-display text-[clamp(44px,6.5vw,92px)] leading-[0.92] font-semibold tracking-[-0.03em]">Engines</h2>
          <p className="text-xl leading-relaxed text-pretty text-ink-2">
            Side projects where the same rules meet a stopwatch. Markets make a good test: a matching engine has to be
            correct before it is fast, and fast enough that nanoseconds show.
          </p>
        </div>

        {/* Matching engine */}
        <article className="mt-24">
          <header className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4 border-b border-line pb-6">
            <div>
              <h3 className="font-display text-4xl leading-tight font-medium tracking-tight md:text-5xl">A matching engine</h3>
              <p className="mt-2 text-lg text-ink-2">Deterministic price-time priority, in Java 21 and C++17.</p>
            </div>
            <Repo href="https://github.com/Ahmed-Berrada/Order_Book">Order_Book on GitHub</Repo>
          </header>

          <div className="grid grid-cols-1 gap-14 pt-12 lg:grid-cols-[minmax(0,500px)_1fr] lg:gap-20 [&>*]:min-w-0">
            <div>
              <LiveOrderBook />
              <p className="mt-3 text-sm text-muted">
                The same data structure, ported to TypeScript and running in this page. The benchmark button times one
                million orders on your machine.
              </p>
            </div>
            <div className="space-y-8">
              {orderBookDecisions.map((d) => (
                <div key={d.title}>
                  <h4 className="text-lg font-semibold">{d.title}</h4>
                  <p className="mt-1.5 leading-relaxed text-ink-2">{d.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-20">
            <h4 className="text-lg font-semibold">The path an order takes</h4>
            <div className="mt-6 max-w-4xl">
              <ArchitectureDiagram />
            </div>
          </div>

          <div className="mt-20 grid gap-12 lg:grid-cols-[minmax(0,22rem)_1fr] lg:gap-20">
            <div>
              <p className="font-display text-[clamp(56px,7vw,96px)] leading-none font-semibold tracking-[-0.03em] tabular">163 ns</p>
              <p className="mt-3 text-lg leading-relaxed text-ink-2">
                Median latency of the C++17 version, at 3.46 million operations a second. A pool allocator and
                intrusive lists keep every order in memory allocated up front, so cancel is O(1) and the hot path never
                allocates.
              </p>
            </div>
            <div>
              <h4 className="mb-5 text-lg font-semibold">How long 163 ns is</h4>
              <LatencyScale />
            </div>
          </div>
        </article>

        {/* Monte Carlo */}
        <article className="mt-36">
          <header className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4 border-b border-line pb-6">
            <div>
              <h3 className="font-display text-4xl leading-tight font-medium tracking-tight md:text-5xl">A GPU option pricer</h3>
              <p className="mt-2 text-lg text-ink-2">Monte Carlo in Python, NumPy, Numba CUDA and CuPy.</p>
            </div>
            <Repo href="https://github.com/Ahmed-Berrada/Monte-Carlo-Option-Pricing">Monte-Carlo-Option-Pricing</Repo>
          </header>

          <div className="grid grid-cols-1 gap-14 pt-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-20 [&>*]:min-w-0">
            <div>
              <MonteCarloLab />
              <p className="mt-3 text-sm text-muted">
                Running here as you watch: antithetic variates and Box-Muller normals, converging on the closed-form
                Black-Scholes price.
              </p>
            </div>
            <div>
              <p className="text-xl leading-relaxed text-pretty">
                European options under geometric Brownian motion. Every simulated path is independent of every other,
                so the work maps onto a GPU. On CuPy the same simulation runs 16 times faster than vectorised NumPy: 0.46 s
                instead of 7.4 s, against 295 s in pure Python.
              </p>
              <div className="mt-12">
                <SpeedupChart />
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
