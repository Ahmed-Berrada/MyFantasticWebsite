import type { CaseStudy } from "./types";

/**
 * Case studies, one template: problem, constraints, approach, measured result, how to reproduce, what comes next.
 * Every figure is traceable: CV v3, the repositories' READMEs and CI, or src/content/bench (measured 2026-11-26).
 */
export const casesEn: CaseStudy[] = [
  {
    slug: "order-book",
    title: "Order Book: a matching engine, from C++ prototype to venue core",
    plain: "A matching engine built twice: in C++ to learn how fast a book can match, then in Java 21 as a venue core that journals every order and survives a crash.",
    stack: "C++17 prototype; Java 21, Spring Boot, QuickFIX/J, FIX 4.4",
    status: "C++ prototype: measured, then archived. Java engine: phases 0 to 3 complete, phase 4 in progress, no performance numbers until phase 6.",
    repos: [
      { label: "Order_Book on GitHub", href: "https://github.com/Ahmed-Berrada/Order_Book" },
      { label: "C++ prototype (lob-engine, archived)", href: "https://github.com/Ahmed-Berrada/lob-engine" },
    ],
    updated: "2026-11-27",
    sections: [
      {
        id: "problem",
        blocks: [
          { t: "p", text: "A matching engine is the core of an electronic exchange. It pairs buyers and sellers who agree on a price and emits the resulting trades." },
          {
            t: "p",
            text: "Three things are asked of it: it must be deterministic (same input, same trades), fair (best price first, then first come first served) and fast. I built it twice. The C++ prototype, lob-engine, asked how fast a book can match and where the time goes. The Java engine asks what a venue needs: the same answer to the same input for every participant, no acknowledged order lost in a crash, and a record that explains everything afterwards. Speed matters, but being right comes first.",
          },
        ],
      },
      {
        id: "constraints",
        blocks: [
          {
            t: "list",
            items: [
              "One writer per book. Arrival order defines priority, so a book is sequential by nature, and locks would only add jitter. In Java each instrument has one writer thread and a bounded queue, and a full queue refuses the order at once (`OVERLOADED`) instead of queuing without limit.",
              "Integer prices, as 64-bit ticks, in both versions. Floating point breaks equality.",
              "The Java matching core is plain Java with no I/O. Spring is banned from it by the build (maven-enforcer) and by architecture tests (ArchUnit): no clock, randomness, threads, I/O or floating point.",
              "Order ids are assigned by the engine, per instrument. Every command gets a gap-free sequence number and one microsecond UTC timestamp, taken at ingress and journaled. That is what makes replay exact.",
              "The C++ prototype takes every order from a pre-allocated pool, so an order costs no malloc. The hot path is not allocation-free: the id map and each new price level allocate a node, and a match returns its trades in a vector. Its benchmark uses a fixed seed, so any run can be repeated exactly.",
            ],
          },
        ],
      },
      {
        id: "approach",
        blocks: [
          { t: "h", text: "The venue core, in Java" },
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
          { t: "h", text: "The prototype, in C++" },
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
          { t: "h", text: "Correctness: the Java engine" },
          { t: "p", text: "The evidence here is tests and gates, not speed." },
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
          {
            t: "p",
            text: "The Java engine has no performance numbers yet: JMH micro-benchmarks and the zero-allocation hot path are phase 6. Every figure below is the C++ prototype's and says nothing about the Java code.",
          },
          { t: "h", text: "Speed: the C++ prototype" },
          {
            t: "p",
            text: "Three sets of numbers from the prototype's benchmark program (`bench/benchmark.cpp`). The first is what its README first published. The other two are mine, from the script linked under How to reproduce, on an HP ProBook 450 G7.",
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
            text: "The README described 5 million operations after a warm-up, but until November 2026 the committed benchmark ran 50 million operations with the warm-up call commented out. Same engine, different median: 149 ns at 5 million operations, 229 ns at 50 million. The benchmark now runs the method the README describes.",
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
          { t: "h", text: "The 70 ms outlier is a hash map rehash" },
          {
            t: "p",
            text: "In the 50 million run the maximum latency is 68 to 73 ms: 68 ms in the two runs I traced for the experiment below, 72 to 73 ms in the three runs of the results table. In both traced runs it happens at the same operation, number 26,749,413. With a fixed seed that is a deterministic event. At that point the benchmark's list holds about 9.4 million ids, and the engine's id-to-order `std::unordered_map` is not pre-sized, so a rehash is the obvious suspect.",
          },
          {
            t: "p",
            text: "I tested it on a scratch copy. Constructing the map with 30 million buckets up front drops the maximum to 1.1 to 1.4 ms and lifts throughput from 3.25 to 4.25 million operations a second. The engine is unchanged. The price is memory: the bucket array alone is about 240 MB.",
          },
          { t: "figure", id: "id-map-probe" },
          { t: "h", text: "What I cannot tell you" },
          {
            t: "p",
            text: "The README did not record which machine produced its first figures, so I cannot tell whether the gap between its 5.5 µs P99.9 and my 0.9 µs is hardware, load or a different version of the code. My runs were on a laptop with the powersave governor, no core pinning and a load average around 1.2 from background processes. Run the script on your own machine: the numbers are meant to be checked.",
          },
        ],
      },
      {
        id: "reproduce",
        blocks: [
          { t: "p", text: "The Java engine:" },
          {
            t: "code",
            text: "git clone https://github.com/Ahmed-Berrada/Order_Book && cd Order_Book\n./mvnw verify                          # build, tests and quality gates\n./mvnw -pl engine-core,engine-journal,engine-service,market-data -am -Pmutation verify   # mutation testing, slow\n./mvnw -pl api -am install -DskipTests && ./mvnw -pl api spring-boot:run   # REST on :8080, FIX on :9878",
          },
          {
            t: "code",
            text: "curl -s -X POST localhost:8080/api/v1/instruments/AAPL/orders \\\n  -H 'Content-Type: application/json' \\\n  -d '{\"side\":\"SELL\",\"type\":\"LIMIT\",\"price\":\"185.30\",\"quantity\":10}'",
          },
          { t: "p", text: "The C++ prototype:" },
          {
            t: "code",
            text: "git clone https://github.com/Ahmed-Berrada/lob-engine && cd lob-engine\ncmake -S . -B build -DCMAKE_BUILD_TYPE=Release && cmake --build build -j\n./build/tests    # unit tests\n./build/bench    # 5 M operations after a 100 K warm-up",
          },
          {
            t: "p",
            text: "To record the machine, the compiler and every run in a JSON file, use [scripts/bench-lob-engine.sh](https://github.com/Ahmed-Berrada/MyFantasticWebsite/blob/main/scripts/bench-lob-engine.sh) from this site's repository. It works on a scratch copy and leaves lob-engine untouched:",
          },
          { t: "code", text: "RUNS=8 scripts/bench-lob-engine.sh              # as committed\nMETHOD=50m RUNS=3 scripts/bench-lob-engine.sh   # the earlier 50 M version" },
          { t: "p", text: "Release builds use `-O3 -march=native`, so results depend on the CPU." },
        ],
      },
      {
        id: "next",
        blocks: [
          {
            t: "list",
            items: [
              "Phase 4: self-trade prevention, auctions, trading phases and circuit breakers.",
              "Phase 6: JMH micro-benchmarks, a zero-allocation hot path and published latency for the Java engine, with its methodology, pinned to an isolated core, with the full histogram of every run.",
              "Carry the prototype's lesson over: size the Java engine's id map up front, and measure the memory cost against the latency gain.",
            ],
          },
        ],
      },
    ],
  },

  {
    slug: "cbtc-validation",
    title: "Test tooling for 5G CBTC radio software at Siemens Mobility",
    plain: "The tools that test the safety-critical radio software of the CBTC signalling on New York's Crosstown line: a simulator, a scenario library and a test bench.",
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
          {
            t: "p",
            text: "To be precise about my part: I do not write the safety-critical software. I designed and developed the simulator, the CRG Message Generator, and I own the test bench; the execution environment around it was built with the team.",
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
              ["Why it matters", "the CRG only runs against train and trackside equipment; on the bench, the simulator is that equipment"],
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
            text: "def crc32_mpeg2(data: bytes) -> int:\n    crc = 0xFFFFFFFF\n    for b in data:\n        crc ^= b << 24\n        for _ in range(8):\n            if crc & 0x80000000:\n                crc = ((crc << 1) ^ 0x04C11DB7) & 0xFFFFFFFF\n            else:\n                crc = (crc << 1) & 0xFFFFFFFF\n    return crc\n\nassert crc32_mpeg2(b\"123456789\") == 0x0376E6E7",
          },
        ],
      },
      {
        id: "next",
        blocks: [
          {
            t: "p",
            text: "I remain test bench owner until the apprenticeship ends in August 2027. From September 2027 I am looking for a permanent role: critical or embedded software, test and validation tooling, or performance-sensitive systems.",
          },
        ],
      },
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
