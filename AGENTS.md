# AGENTS.md

## Project snapshot
- Portfolio for ahmedberrada.com. Positioning: software that has to be right, then fast. Safety-critical work at
  Siemens Mobility first; low-latency engines (finance as one application) second. Not a finance-only site.
- Stack: Next.js 16 App Router, React 19, TypeScript strict, Tailwind v4, vitest. Deployed on Vercel.
- Two languages: English at `/`, French under `/fr`. Route groups `(en)` and `(fr)/fr` each have their own root layout
  (`<html lang>`), both using `components/RootShell.tsx`. Pages are thin: they call `components/*Page.tsx` with a `lang`.
- No contact form (removed on purpose): email, LinkedIn, GitHub and the two CV PDFs in `public/cv`.

## Content rules (the site's credibility depends on them)
- All copy lives in `src/content`: `en.ts` is the source, `fr.ts` is typed against it (`Dict`), case studies in
  `work.en.ts` / `work.fr.ts`, notes in `writing.en.ts` / `writing.fr.ts`. `content.test.ts` checks that both languages
  have the same shape, placeholders, figures and valid internal links. Change both languages together.
- French typography (no-break space before `? ! : ;`) is applied at load by `src/content/index.ts`. Write plain spaces.
- Every number must trace to the CV (v3), a repository README or CI, or `src/content/bench` (measured with
  `scripts/bench-lob-engine.sh`). Do not round up, merge projects or quote a figure under a project it does not belong to:
  Order Book is one project built twice: **lob-engine** (C++17, archived) is its prototype and owns every latency
  figure; the Java engine (Order_Book repo) owns the correctness work and has no performance numbers until its phase 6.
  Always say which version a number belongs to. `/work/lob-engine` redirects to `/work/order-book`.
- Quote the first published lob-engine figures next to the reproduced ones, and say which is which. The README did not
  record the hardware of the first run; the reproductions are from an HP ProBook 450 G7 (i7-10510U, powersave governor, no pinning).
- Siemens work is internal: only what the CV says. Illustrative frames are labelled as such. No real frames or code.
- No invented testimonials, logos or client claims. The AWS certificate and the `/consulting` page are deliberately not on the site.
- Projects shown: Order Book (Java engine + C++ prototype), market data pipeline, GPU option pricer (last, demoted).

## Design direction (keep it)
- Whiteprint greys + true ink + one safety yellow (`--accent`) as a fill only. `--bid` / `--ask` only inside market-data
  instruments. Type: Bricolage Grotesque (display), Instrument Sans (body), Martian Mono inside instruments.
- The hero is the one bold moment: `TrainGraphCanvas` (pointer reads the timetable) and `ProximityText`. Everything else stays quiet.
- Avoid template tells: no uppercase eyebrows, no 01/02 numbering unless the content is a sequence, no `A · B · C`
  meta strings, no arrow glyphs on links, no icon set, no fade-up on every section. Links use `.link`.
- Demos start only when asked (order book, Monte Carlo). The Monte Carlo simulation runs in a Web Worker
  (`src/lib/montecarlo.worker.ts`); keep heavy work off the main thread. Everything animated pauses off-screen and
  honours `prefers-reduced-motion`.

## Code map
- `src/lib/traingraph.ts`: Marey train graph model. `src/lib/orderbook/*`: price-time priority book and seeded flow.
- `src/lib/montecarlo.ts` + `mcsim.ts` + `montecarlo.worker.ts`: estimator, demo simulation, worker.
- `src/lib/crc.ts`: CRC-32/MPEG-2 (checked against `0x0376E6E7`). `src/lib/seo.ts`: canonical host, hreflang, JSON-LD.
- `src/content/bench/*.json`: measured benchmark runs (source of the results table and histogram).
- `components/figures/*`: figures referenced by id from case-study blocks (`Figure.tsx` maps ids).
- Share images are generated per page (`opengraph-image.tsx` next to each route; `src/lib/og.tsx`).
- `src/lib/feed.ts`: RSS feed of the notes, served at `/writing/feed.xml` in each language.

## SEO and hosting
- Canonical host is `https://www.ahmedberrada.com`; the apex redirects to it (`next.config.ts`). Every page has a canonical
  tag and hreflang (en, fr, x-default); the sitemap lists all pages in both languages with dates from the content.
- A not-found file sits inside each dynamic segment (`[...slug]`, `work/[slug]`, `writing/[slug]`) so 404s render in the
  language's layout.

## Security and quality gates
- `next.config.ts` sends a CSP and the usual security headers. Pages are static, so inline scripts stay allowed; anything
  new from another origin (a font, a script, an API) must be added to the CSP or it will be blocked.
- `content.test.ts` keeps titles (≤ 70, home ≤ 60) and descriptions (≤ 160) short enough for search results.
- `scripts/smoke.mjs` (run in CI) fails on a non-200 page, not exactly one h1, overflow, console errors or any axe
  violation. Standalone links use `link link-tap` for a 24px hit area; links inside sentences use `link` only.

## Workflows
- `npm run dev`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, `npm run smoke`. Do not read `node_modules`.
- Commit and push every small change. Work on a branch, check the Vercel preview, then merge to `main`.
