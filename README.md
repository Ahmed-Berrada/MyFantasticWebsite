# ahmedberrada.com

Source of my portfolio. **Right first. Then fast.** English at `/`, French at `/fr`.

- **Home:** a live train graph (a Marey diagram you can read with the pointer), the Siemens Mobility work, projects with running demos (a matching engine in the browser, a Monte Carlo pricer in a Web Worker), notes, background and contact.
- **Case studies** (`/work/…`): problem, constraints, approach, measured result, how to reproduce, what comes next. Each number traces to a README, CI or a measurement stored in `src/content/bench`.
- **Notes** (`/writing/…`): short technical write-ups of things I measured.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # engine, pricer, simulation, CRC and bilingual content tests
npm run build
```

## Reproduce the lob-engine numbers

```bash
RUNS=5 scripts/bench-lob-engine.sh                      # README method: 5 M operations after a warm-up
METHOD=committed RUNS=3 scripts/bench-lob-engine.sh     # the benchmark exactly as committed (50 M operations)
```

The script works on a scratch copy of [lob-engine](https://github.com/Ahmed-Berrada/lob-engine), records the machine, compiler, load and every run, and writes one JSON file. To add a machine to the site, run it there and put the JSON in `src/content/bench`.

## Stack

Next.js 16, React 19, TypeScript, Tailwind CSS v4, vitest. Deployed on Vercel. Type: Bricolage Grotesque, Instrument Sans, Martian Mono.
