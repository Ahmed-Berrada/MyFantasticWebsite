import type { Note } from "./types";

/** Technical notes. Everything quoted was measured or computed; see src/content/bench and src/lib/montecarlo.ts. */
export const notesEn: Note[] = [
  {
    slug: "reading-a-latency-tail",
    title: "Reading a latency tail without fooling yourself",
    summary: "A 68 ms maximum in a matching engine benchmark turned out to be one hash map rehash, at the same operation in every run.",
    date: "2026-11-26",
    minutes: 4,
    blocks: [
      {
        t: "p",
        text: "lob-engine, the C++ prototype of my order book, first published a median of 163 ns and a P99.9 of 5,517 ns, about 34 times the median. A ratio like that needs explaining. Here is how I went looking for what was behind a tail, and what I found.",
      },
      { t: "h", text: "Step 1: make the measurement repeatable" },
      {
        t: "p",
        text: "I wrote a small script that rebuilds the engine on a scratch copy, applies the method the README states (5 million operations, a 100,000 warm-up), runs it several times and records the machine, the compiler, the load and every run. On my laptop, eight runs gave a median of 149 ns, a P99 of 460 ns and a P99.9 of 909 ns. The median and the P99 moved by less than 3% between runs, the P99.9 by about 8%.",
      },
      { t: "h", text: "Step 2: know what the timer costs" },
      {
        t: "p",
        text: "Each operation is wrapped in two clock reads. I measured an empty timed region: about 15 ns. That is 10% of a 149 ns median, so it matters for the median and not at all for a millisecond outlier. I did not subtract it.",
      },
      { t: "h", text: "Step 3: find the biggest outlier, and where it sits" },
      {
        t: "p",
        text: "The benchmark's earlier version ran 50 million operations. Its maximum latency was about 68 ms, and it happened at operation 26,749,413 in both runs I traced. A fixed seed means the same operation does the same work every time, so a maximum that always lands on the same operation is not noise but the program.",
      },
      {
        t: "p",
        text: "At that operation the list of ids to cancel held about 9.4 million entries. The engine's id-to-order map, a plain `std::unordered_map`, had never been told how big to get, so it grows by rehashing, and rehashing millions of entries in one go takes tens of milliseconds.",
      },
      { t: "h", text: "Step 4: change one thing and measure again" },
      { t: "p", text: "On a scratch copy I constructed the map with 30 million buckets. Nothing else changed." },
      { t: "figure", id: "id-map-probe" },
      {
        t: "p",
        text: "The maximum fell from about 68 ms to about 1 ms, and throughput rose by about a third. The maximum did not go to zero: what is left, around a millisecond, I have not explained. It could be the operating system, page faults as the pool grows, or the price trees allocating nodes. I would profile before guessing.",
      },
      { t: "h", text: "What I take from it" },
      {
        t: "list",
        items: [
          "Find where the slowest operations are before trying to speed them up.",
          "A fixed seed turns an outlier into evidence: an outlier at the same operation every run is the program, not the machine.",
          "Change one thing, and keep the before and the after.",
          "Say what you measured on. The README first published no hardware, and its benchmark ran a different operation count from the one it described. Both are fixed now: the README records the machine, and the code runs the method the README states.",
        ],
      },
      { t: "p", text: "The case study has the full tables, the histogram and the commands: [Order Book](/work/order-book)." },
    ],
  },

  {
    slug: "one-writer-per-instrument",
    title: "One writer per instrument: how an order book stays deterministic",
    summary: "Why each instrument gets a single thread, a journal and a sequence number, and what that buys.",
    date: "2026-11-26",
    minutes: 4,
    blocks: [
      {
        t: "p",
        text: "Matching depends on strict order. An incoming buy is matched against resting sells by best price, then by arrival time. Two threads changing the same book would break time priority, and they could fill the same liquidity twice.",
      },
      { t: "h", text: "One writer, many books" },
      {
        t: "p",
        text: "In Order Book each instrument owns a single writer thread and a bounded queue. Different instruments never interact, so they run in parallel with no locks. This is the single-writer pattern popularised by LMAX. The hot path has no locks and no races, and the result is deterministic.",
      },
      { t: "h", text: "Journal first, then match" },
      {
        t: "p",
        text: "Every command is appended to the instrument's journal, which is CRC-framed and synced to disk per command by default, before the writer thread processes it. The engine is a function from a command to a list of events, with no hidden side effects. Crash recovery is therefore a replay of the journal, and the same mechanism serves audit and debugging.",
      },
      { t: "h", text: "What determinism needs" },
      {
        t: "list",
        items: [
          "Order ids are assigned by the engine, per instrument.",
          "Every command gets a gap-free sequence number and one microsecond UTC timestamp, taken at ingress and journaled.",
          "The matching core may use only the JDK: no clock, randomness, threads, I/O or floating point. An architecture test fails the build if that changes.",
        ],
      },
      { t: "h", text: "How it is checked" },
      {
        t: "list",
        items: [
          "Property-based tests (jqwik): the book is never crossed, quantity is conserved, ids and sequences have no gaps.",
          "A reference model: random command streams must give exactly the events of a deliberately simple implementation.",
          "A crash test: a second JVM is killed with SIGKILL, no acknowledged command may be lost, and the recovered state must equal a fresh replay.",
          "Cutting either journal at any byte must recover exactly the complete commands.",
        ],
      },
      { t: "h", text: "What it costs" },
      {
        t: "p",
        text: "A full queue refuses the order at once (`OVERLOADED`) instead of growing without bound, so overload shows up as a visible refusal instead of unbounded queueing delay. And the sync to disk per command is a deliberate trade: no acknowledged order is lost, at the price of throughput. I have not measured that price yet. JMH benchmarking is phase 6 of the project.",
      },
      { t: "p", text: "Code and decisions: [Order Book](/work/order-book)." },
    ],
  },

  {
    slug: "monte-carlo-against-black-scholes",
    title: "Checking a Monte Carlo pricer against the closed form",
    summary: "How to know a simulation is right: compare it with the exact price and let the confidence interval decide.",
    date: "2026-11-26",
    minutes: 4,
    blocks: [
      {
        t: "p",
        text: "A European call under geometric Brownian motion has an exact price, Black-Scholes. That makes it a good test for a Monte Carlo pricer: the simulation must land inside its own confidence interval around the exact value.",
      },
      { t: "h", text: "The check" },
      {
        t: "p",
        text: "The estimator draws a standard normal with Box-Muller, builds the terminal price, discounts the payoff, and reports the mean with a 95% confidence interval (1.96 times the standard error). With antithetic variates each draw Z is paired with −Z, and the pair counts as one sample.",
      },
      {
        t: "p",
        text: "The test fixes the seed, simulates 200,000 pairs and asserts that the distance to Black-Scholes is smaller than the interval. With a fixed seed that is a deterministic test, not a flaky statistical one.",
      },
      { t: "h", text: "What the numbers look like" },
      {
        t: "table",
        head: ["Paths", "Antithetic estimate", "Distance to exact", "Plain estimate"],
        rows: [
          ["1,000", "10.5497 ± 0.6701", "0.0991", "10.6890 ± 0.9589"],
          ["10,000", "10.5729 ± 0.2075", "0.1224", "10.2339 ± 0.2898"],
          ["100,000", "10.4987 ± 0.0651", "0.0482", "10.4768 ± 0.0915"],
          ["1,000,000", "10.4701 ± 0.0204", "0.0195", "10.4625 ± 0.0289"],
        ],
        note: "Exact price 10.4506 (S₀ 100, K 100, r 5%, σ 20%, 1 year). Seed 7, same random generator as the demo on this site.",
      },
      {
        t: "p",
        text: "Each ten-fold increase in paths narrows the interval by about the square root of ten, which is how Monte Carlo converges. And at the same number of paths, antithetic variates give an interval about 30% narrower than plain sampling.",
      },
      {
        t: "p",
        text: "The distance to the exact price at a million paths, 0.0195, is inside the interval of ±0.0204, as it should be about 95% of the time. A result outside the interval, run after run, would mean a bug.",
      },
      { t: "h", text: "The GPU numbers" },
      {
        t: "p",
        text: "The GPU pricer in the Monte-Carlo-Option-Pricing repository started as a notebook. Its first run priced a call with 100 million paths: 295 s in pure Python, 7.4 s with vectorised NumPy and 0.46 s on a GPU with CuPy. That is 16 times faster than NumPy, which is the comparison that matters; the 647 times against a Python loop says more about the loop than about the GPU.",
      },
      {
        t: "p",
        text: "The notebook did not record the GPU model, so treat the speedup as indicative. The repository is now a tested package whose benchmark script records the CPU, the GPU and every timing, and whose test suite checks every backend against Black-Scholes the way this note describes. The demo on the home page uses the same estimator in TypeScript, and the test above is part of this site's test suite.",
      },
    ],
  },
];
