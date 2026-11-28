# ahmedberrada.com

Source of my portfolio. **Right first. Then fast.** English at `/`, French at `/fr`.

- **Home:** who I am in ten seconds (name, role, CDI line, contact), a live graph of New York's Crosstown line, Siemens Mobility as the flagship story, the Order Book project with a matching engine running in the browser, an AI project in progress, notes, background as a metro map, and contact.
- **Case studies** (`/work/…`): problem, constraints, approach, measured result, how to reproduce, what comes next. Each number traces to a README, CI or a measurement stored in `src/content/bench`.
- **Notes** (`/writing/…`): short technical write-ups of things I measured, with an RSS feed per language (`/writing/feed.xml`, `/fr/writing/feed.xml`).

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # engine, pricer, simulation, CRC, feed and bilingual content tests
npm run typecheck
npm run build
npm start & BASE=http://localhost:3000 npm run smoke   # every page, two widths, axe checks
```

CI (`.github/workflows/ci.yml`) runs lint, typecheck, tests and build on every push, then the smoke test against the production build.

## Reproduce the C++ prototype's numbers

```bash
RUNS=5 scripts/bench-lob-engine.sh                      # as committed: 5 M operations after a warm-up
METHOD=50m RUNS=3 scripts/bench-lob-engine.sh           # the earlier version: 50 M operations, no warm-up
```

The script works on a scratch copy of [lob-engine](https://github.com/Ahmed-Berrada/lob-engine), the archived C++ prototype of [Order_Book](https://github.com/Ahmed-Berrada/Order_Book). It records the machine, compiler, load and every run, and writes one JSON file. To add a machine to the site, run it there and put the JSON in `src/content/bench`.

## Stack

Next.js 16, React 19, TypeScript, Tailwind CSS v4, vitest. Deployed on Vercel. Type: Bricolage Grotesque, Instrument Sans, Martian Mono.
