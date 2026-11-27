import type { CaseStudy } from "./types";

/**
 * Case studies, one template: problem, constraints, approach, measured result, how to reproduce, what comes next.
 * Every figure is traceable: CV v3, the repositories' READMEs and CI, or src/content/bench (measured 2026-11-26).
 */
export const casesEn: CaseStudy[] = [
  {
    slug: "lob-engine",
    title: "lob-engine, a matching engine in C++17",
    plain: "A matching engine I wrote to find out how fast an order book can be, and where the time goes.",
    stack: "C++17, CMake, single thread",
    status: "Measured, with two reproductions on one laptop. The README does not record the hardware behind its own figures.",
    repos: [{ label: "lob-engine on GitHub", href: "https://github.com/Ahmed-Berrada/lob-engine" }],
    updated: "2026-11-26",
    sections: [
      {
        id: "problem",
        blocks: [
          { t: "p", text: "A matching engine is the core of an electronic exchange. It pairs buyers and sellers who agree on a price and emits the resulting trades." },
          {
            t: "p",
            text: "Three things are asked of it: it must be deterministic (same input, same trades), fair (best price first, then first come first served) and fast. This project is about the third, measured honestly.",
          },
        ],
      },
      {
        id: "constraints",
        blocks: [
          {
            t: "list",
            items: [
              "One thread per book. Arrival order defines priority, so a book is sequential by nature, and locks would only add jitter.",
              "Integer prices, as 64-bit ticks (one tick is 0.01 EUR). Floating point breaks equality.",
              "No allocation per order on the hot path.",
              "A seeded random generator, so any run can be repeated exactly.",
            ],
          },
        ],
      },
      {
        id: "approach",
        blocks: [
          {
            t: "p",
            text: "Bids and asks are two `std::map` price trees, so the best price is at `begin()`. Each price level is an intrusive doubly linked list of orders in arrival order, and every order is carved from a pre-allocated pool block, so adding or removing one is a handful of pointer writes. A hash map from order id to order gives O(1) cancel.",
          },
          { t: "figure", id: "lob-structure" },
          {
            t: "table",
            head: ["Operation", "Cost"],
            rows: [
              ["Add, no match", "O(log n)"],
              ["Add, match at the best level", "O(1)"],
              ["Add, sweeping K levels", "O(K + log n)"],
              ["Cancel", "O(1)"],
              ["Best bid or best ask", "O(1)"],
            ],
            note: "n is the number of active price levels.",
          },
        ],
      },
      {
        id: "result",
        blocks: [
          {
            t: "p",
            text: "Three sets of numbers from the same benchmark program (`bench/benchmark.cpp`). The first is what the README publishes. The other two are mine, from the script linked under How to reproduce, on an HP ProBook 450 G7.",
          },
          { t: "figure", id: "lob-results" },
          { t: "h", text: "How to read these numbers" },
          {
            t: "p",
            text: "The benchmark mixes 60 % adds, 25 % cancels and 15 % aggressive orders around a mid price, with seed 42. It times every operation with two reads of `std::chrono::high_resolution_clock`. On this laptop that pair costs about 15 ns, measured with an empty timed region, and it is not subtracted.",
          },
          {
            t: "p",
            text: "The timed region also contains the random price and quantity draws and the bookkeeping of the list of ids to cancel, so every figure is an upper bound on the engine's own time. The draw that picks the action sits outside the timed region but inside the throughput clock, which is why throughput is a little below one over the mean.",
          },
          { t: "h", text: "Same code, different answers" },
          {
            t: "p",
            text: "The README says 5 million operations after a warm-up. The committed benchmark runs 50 million operations with the warm-up call commented out. Same engine, different median: 149 ns at 5 million operations, 229 ns at 50 million.",
          },
          {
            t: "p",
            text: "The cancel list grows by about 0.35 ids per operation (60 % adds minus 25 % cancels), so late operations touch much more memory. I have not profiled the cache behaviour. That is my explanation, not a measurement.",
          },
          { t: "figure", id: "lob-histogram" },
          {
            t: "p",
            text: "Half of the operations finish in under 150 ns and 99 % in under 460 ns. The slowest 0.1 % take 900 ns or more, up to a maximum of about 1.6 ms.",
          },
          { t: "h", text: "The 68 ms outlier is a hash map rehash" },
          {
            t: "p",
            text: "In the 50 million run the maximum latency is about 68 ms, and it happens at the same operation, number 26,749,413, in both runs I traced. With a fixed seed that is a deterministic event. At that point the benchmark's list holds about 9.4 million ids, and the engine's id-to-order `std::unordered_map` is not pre-sized, so a rehash is the obvious suspect.",
          },
          {
            t: "p",
            text: "I tested it on a scratch copy. Constructing the map with 30 million buckets up front drops the maximum to 1.1 to 1.4 ms and lifts throughput from 3.25 to 4.25 million operations a second. The repository is unchanged. The price is memory: the bucket array alone is about 240 MB.",
          },
          { t: "figure", id: "id-map-probe" },
          { t: "h", text: "What I cannot tell you" },
          {
            t: "p",
            text: "The README does not say which machine produced its figures, so I cannot tell whether the gap between its 5.5 µs P99.9 and my 0.9 µs is hardware, load or a different version of the code. My runs were on a laptop with the powersave governor, no core pinning and a load average around 1.2 from background processes. Run the script on your own machine: the numbers are meant to be checked.",
          },
        ],
      },
      {
        id: "reproduce",
        blocks: [
          { t: "p", text: "The benchmark as committed:" },
          {
            t: "code",
            text: "git clone https://github.com/Ahmed-Berrada/lob-engine && cd lob-engine\ncmake -S . -B build -DCMAKE_BUILD_TYPE=Release && cmake --build build -j\n./build/tests    # unit tests\n./build/bench    # 50 M operations, no warm-up",
          },
          {
            t: "p",
            text: "For the README's method (5 million operations after a 100,000 warm-up), with the machine, compiler and every run written to a JSON file, use [scripts/bench-lob-engine.sh](https://github.com/Ahmed-Berrada/MyFantasticWebsite/blob/main/scripts/bench-lob-engine.sh) from this site's repository. It works on a scratch copy and leaves lob-engine untouched:",
          },
          { t: "code", text: "RUNS=5 scripts/bench-lob-engine.sh                     # README method\nMETHOD=committed RUNS=3 scripts/bench-lob-engine.sh    # as committed" },
          { t: "p", text: "Release builds use `-O3 -march=native`, so results depend on the CPU." },
        ],
      },
      {
        id: "next",
        blocks: [
          {
            t: "list",
            items: [
              "Pin the benchmark to an isolated core and publish a full histogram with every run.",
              "Pre-size the id map inside the engine and measure the memory cost against the latency gain.",
              "The latency items already on the README roadmap: CPU pinning, huge pages, a template on the side to remove branches, lock-free single-producer queues between input, engine and output, and prefetching.",
              "Run the tests under the address and undefined-behaviour sanitizers, with a fuzz target, in CI.",
            ],
          },
        ],
      },
    ],
  },

  {
    slug: "order-book",
    title: "Order Book, a trading venue core in Java 21",
    plain: "The core of a trading venue: it takes orders over FIX or REST, writes each one to a journal before matching it, and can rebuild its exact state after a crash.",
    stack: "Java 21, Spring Boot, QuickFIX/J, FIX 4.4",
    status: "Phases 0 to 3 complete (core, durability, connectivity). Phase 4, venue functionality, in progress. No performance numbers yet: JMH benchmarking is phase 6.",
    repos: [{ label: "Order_Book on GitHub", href: "https://github.com/Ahmed-Berrada/Order_Book" }],
    updated: "2026-11-26",
    sections: [
      {
        id: "problem",
        blocks: [
          {
            t: "p",
            text: "A venue has to give every participant the same answer to the same input, survive a crash without losing an acknowledged order, and be explainable afterwards. Speed matters later. Being right comes first.",
          },
        ],
      },
      {
        id: "constraints",
        blocks: [
          {
            t: "list",
            items: [
              "The matching core is plain Java with no I/O. Spring is banned from it by the build (maven-enforcer) and by architecture tests (ArchUnit): no clock, randomness, threads, I/O or floating point.",
              "One writer thread and one bounded queue per instrument. A full queue refuses the order at once (`OVERLOADED`) instead of queuing without limit.",
              "Prices are `long` ticks and order ids are assigned by the engine, per instrument. Every command gets a gap-free sequence number and one microsecond UTC timestamp, taken at ingress and journaled. That is what makes replay exact.",
            ],
          },
        ],
      },
      {
        id: "approach",
        blocks: [
          { t: "figure", id: "order-path" },
          {
            t: "p",
            text: "Each command is appended to the instrument's journal (CRC-framed, synced to disk per command by default) and then processed by the single writer thread. Matching returns events. Execution reports, market data and the drop copy are built from those events, and the same journal serves crash recovery, audit and replay.",
          },
          {
            t: "p",
            text: "Interfaces: FIX 4.4 order entry with a drop copy for risk systems, a REST API described with OpenAPI, a level-2 market data feed over WebSocket and a sequenced binary feed with retransmission.",
          },
          {
            t: "p",
            text: "Deliberately simple first: cancel is O(n) inside a price level and the book sides are `TreeMap`s. Both are to be measured with JMH before being optimised.",
          },
        ],
      },
      {
        id: "result",
        blocks: [
          { t: "p", text: "This project is about correctness, so the evidence is tests and gates, not speed." },
          {
            t: "table",
            head: ["What is checked", "How"],
            rows: [
              ["The book is never crossed, quantity is conserved, ids and sequences have no gaps, replay is deterministic", "Property-based tests (jqwik)"],
              ["Random command streams give exactly the events of a deliberately simple reference implementation", "jqwik with a naive oracle"],
              ["No acknowledged command is lost after a crash, and the recovered state equals a fresh replay", "A second JVM killed with SIGKILL"],
              ["Cutting either journal at any byte recovers exactly the complete commands", "jqwik on the journal"],
              ["A FIX member can log on, trade, cancel, query status and get every reject code, and resend works after a disconnect", "QuickFIX/J initiators over a socket"],
              ["A consumer that loses one UDP packet in five rebuilds every book by retransmission alone", "Real UDP and TCP sockets"],
              ["The matching core uses only the JDK", "ArchUnit"],
              ["At least 90 % line and branch coverage", "JaCoCo, enforced by `./mvnw verify` in CI"],
            ],
          },
          {
            t: "p",
            text: "CI is green on main (GitHub Actions runs `./mvnw verify`). The repository also defines a mutation-testing profile (PIT, with an 80 % threshold on every engine module). It is run on demand, not in CI, so I do not quote a score.",
          },
          { t: "p", text: "Performance: none published yet. JMH micro-benchmarks and the zero-allocation hot path are phase 6. For latency work, see [lob-engine](/work/lob-engine)." },
        ],
      },
      {
        id: "reproduce",
        blocks: [
          {
            t: "code",
            text: "git clone https://github.com/Ahmed-Berrada/Order_Book && cd Order_Book\n./mvnw verify                          # build, tests and quality gates\n./mvnw -pl engine-core,engine-journal,engine-service,market-data -am -Pmutation verify   # mutation testing, slow\n./mvnw -pl api -am install -DskipTests && ./mvnw -pl api spring-boot:run   # REST on :8080, FIX on :9878",
          },
          {
            t: "code",
            text: "curl -s -X POST localhost:8080/api/v1/instruments/AAPL/orders \\\n  -H 'Content-Type: application/json' \\\n  -d '{\"side\":\"SELL\",\"type\":\"LIMIT\",\"price\":\"185.30\",\"quantity\":10}'",
          },
        ],
      },
      {
        id: "next",
        blocks: [
          {
            t: "list",
            items: [
              "Phase 4: self-trade prevention, auctions, trading phases and circuit breakers.",
              "Phase 6: JMH micro-benchmarks, a zero-allocation hot path and published latency with its methodology.",
            ],
          },
        ],
      },
    ],
  },

  {
    slug: "cbtc-validation",
    title: "Test tooling for a 5G radio signalling system",
    plain: "The tools that test the radio software of New York's Crosstown subway signalling: a train and trackside simulator, a scenario library and a test bench.",
    stack: "Python, pytest, Robot Framework, GitLab CI/CD, QEMU/KVM, Linux network namespaces",
    status: "Siemens Mobility, since September 2025. Delivered for CRG release 4.2. Internal tooling: no code or protocol details are published here.",
    repos: [],
    updated: "2026-11-26",
    sections: [
      {
        id: "problem",
        blocks: [
          {
            t: "p",
            text: "The radio software, called the CRG, exchanges messages with equipment on the train and along the track. Without that equipment it cannot be tested. When I joined there was no test bench, no tool and no product to start from.",
          },
        ],
      },
      {
        id: "constraints",
        blocks: [
          {
            t: "list",
            items: [
              "Safety-critical software, developed under CENELEC EN 50128.",
              "Scrum, in English, with the radio, embedded software and test teams in France and India.",
              "Messages must be byte-exact: UDP framing and a CRC-32/MPEG-2 checksum.",
              "People who do not write code have to be able to write and run scenarios.",
            ],
          },
        ],
      },
      {
        id: "approach",
        blocks: [
          { t: "figure", id: "cbtc-bench" },
          {
            t: "list",
            items: [
              "The CRG Message Generator, in Python. It simulates the onboard and wayside equipment (CC, ZC, WRG) and generates byte-exact radio messages from YAML/XML configuration. A pytest suite checks its conformance and produces JUnit-XML reports.",
              "A Robot Framework library of business-level keywords, so a scenario reads like the requirement it checks.",
              "The execution environment, built with the team: GitLab CI/CD and runners, the CRG virtualised with QEMU/KVM inside Linux network namespaces, and automatic archiving of reports and logs. I am the test bench owner.",
            ],
          },
        ],
      },
      {
        id: "result",
        blocks: [
          {
            t: "table",
            head: ["Measure", "Value"],
            rows: [
              ["Message types supported", "200+"],
              ["Scenarios", "300+"],
              ["Users", "9 validators: 5 developers and 4 trained non-developers, who write and run their own scenarios"],
              ["Delivered for", "CRG release 4.2"],
              ["Without this tool", "the software cannot be tested"],
            ],
          },
          {
            t: "p",
            text: "I cannot publish real frames or code. The radio scene on the [home page](/) uses an illustrative frame layout and a real CRC-32/MPEG-2, checked against the standard test value `0x0376E6E7`.",
          },
        ],
      },
      {
        id: "reproduce",
        blocks: [
          { t: "p", text: "The tooling is internal, so the project itself cannot be reproduced outside Siemens. The checksum can:" },
          {
            t: "code",
            text: "def crc32_mpeg2(data: bytes) -> int:\n    crc = 0xFFFFFFFF\n    for b in data:\n        crc ^= b << 24\n        for _ in range(8):\n            crc = ((crc << 1) ^ 0x04C11DB7) & 0xFFFFFFFF if crc & 0x80000000 else (crc << 1) & 0xFFFFFFFF\n    return crc\n\nassert crc32_mpeg2(b\"123456789\") == 0x0376E6E7",
          },
        ],
      },
      { id: "next", blocks: [{ t: "p", text: "The apprenticeship runs until August 2027." }] },
    ],
  },

  {
    slug: "market-data-pipeline",
    title: "Market data pipeline",
    plain: "A pipeline that fetches stock and crypto prices on a schedule, checks and stores them, and serves them through an API and a dashboard.",
    stack: "Python, TimescaleDB, Airflow, Cloud Run, FastAPI, Next.js",
    status: "Deployed on Cloud Run and Vercel, with a public dashboard. Throughput and API latency are not measured yet.",
    repos: [
      { label: "Pipeline on GitHub", href: "https://github.com/Ahmed-Berrada/Market_data_pipeline" },
      { label: "Dashboard", href: "https://marketdatapipeline.ahmedberrada.com/" },
    ],
    updated: "2026-11-26",
    sections: [
      {
        id: "problem",
        blocks: [
          {
            t: "p",
            text: "Prices come from public APIs at different rhythms and with gaps. They have to be fetched on a schedule, validated, stored so that time-range queries stay fast, and served to a dashboard.",
          },
        ],
      },
      {
        id: "constraints",
        blocks: [
          {
            t: "list",
            items: [
              "Free public sources: Yahoo Finance for one-minute bars on seven stocks and funds (SPY, NVDA, MSFT, SIE.DE, GOOGL, PLTR, URTH) and CoinGecko for five-minute prices on BTC, ETH, SOL and XRP.",
              "Two environments: Airflow with Docker Compose locally, and Cloud Run Jobs with Cloud Scheduler in production, without Airflow.",
            ],
          },
        ],
      },
      {
        id: "approach",
        blocks: [
          {
            t: "p",
            text: "Each pipeline follows the same four tasks: extract, transform, load, log success. After loading, it refreshes the TimescaleDB continuous aggregates. The transform step cleans and validates the data and computes a 20-period and a 50-period simple moving average and daily returns.",
          },
          {
            t: "table",
            head: ["Layer", "Choice"],
            rows: [
              ["Storage", "TimescaleDB Cloud hypertables with 7-day chunks, compression after 7 days (segmented by symbol), continuous aggregates refreshed hourly over a 3-day window"],
              ["Scheduling", "Airflow DAGs locally, Cloud Run Jobs and Cloud Scheduler in production"],
              ["API", "FastAPI on Cloud Run: OHLCV history, latest price, indicators, pipeline status"],
              ["Dashboard", "Next.js with candlestick and line charts, hosted on Vercel"],
            ],
          },
        ],
      },
      {
        id: "result",
        blocks: [
          {
            t: "p",
            text: "What exists and can be inspected: the [dashboard](https://marketdatapipeline.ahmedberrada.com/) and the code. What does not exist yet: a measurement of ingestion throughput or API latency. I would add both before quoting any number.",
          },
        ],
      },
      {
        id: "reproduce",
        blocks: [
          {
            t: "code",
            text: "git clone https://github.com/Ahmed-Berrada/Market_data_pipeline && cd Market_data_pipeline\n# set DATABASE_URL and X_CG_DEMO_API_KEY in .env, as the README describes\npsql \"$DATABASE_URL\" -f db/schema.sql\ndocker compose up -d        # Airflow on :8080, API on :8000\npip install -r requirements.txt && python scripts/backfill.py --days 365\ncurl http://localhost:8000/api/stocks/SPY/latest",
          },
        ],
      },
      {
        id: "next",
        blocks: [
          {
            t: "list",
            items: ["Measure ingestion throughput and API latency, and publish the method with the numbers."],
          },
        ],
      },
    ],
  },
];
