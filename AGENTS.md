# AGENTS.md

## Project snapshot
- Portfolio for ahmedberrada.com. Positioning: software that has to be right, then fast. Safety-critical work at
  Siemens Mobility first; low-latency engines (finance as one application) second. Not a finance-only site.
- Stack: Next.js 16 App Router, React 19, TypeScript strict, Tailwind v4, vitest. Deployed on Vercel.
- Page (`src/app/page.tsx`): `Navbar`, `Hero`, `Siemens`, `Work` ("Engines"), `Background`, `Contact`.

## Design direction (keep it)
- Whiteprint greys + true ink + one safety yellow (`--accent`) used as a fill only (cursor band, highlighted
  train, hover state). `--bid` / `--ask` only inside market-data instruments.
- Type: Bricolage Grotesque (display, variable wght/wdth/opsz), Instrument Sans (body), Martian Mono only inside
  instruments. Headlines in sentence case.
- The hero is the one bold moment: `TrainGraphCanvas` (Marey train graph, cursor time probe, keyboard latency lane)
  and `ProximityText` (letters swell toward the pointer). Everything else stays quiet.
- Avoid template tells (see the frontend-design skill): no uppercase eyebrows, no 01/02 numbering unless the content
  is a sequence, no "A · B · C" meta strings, no arrow glyphs on links, no single coloured word in a headline,
  no fade-up on every section, no icon set. Links use the `.link` class.
- Every animated component pauses off-screen and honours `prefers-reduced-motion`.

## Content
- Copy for positions, roles, education and tools: `src/content/profile.ts` (from the owner's CV).
- Projects shown: Order Book (Order_Book repo only; never mention or link lob-engine) and the GPU Monte Carlo pricer only. Do not add others unless asked.
- Quoted figures (163 ns, 3.46M ops/s, 295 s / 7.4 s / 0.46 s) come from the CV. Live numbers are labelled as live.

## Code map
- `src/lib/traingraph.ts`: train graph model (stations, runs, dwells, train state). Tests beside it.
- `src/lib/orderbook/engine.ts`: price-time priority book (intrusive FIFO per level, O(1) cancel). `flow.ts`: seeded flow.
- `src/lib/montecarlo.ts`: Black-Scholes and antithetic Monte Carlo estimator.
- `src/lib/useInView.ts`: `useInView`, `useOnScreen`, `usePrefersReducedMotion`, `useScrolledPast`.
- Section ids `siemens`, `work`, `background`, `contact` must match `components/Navbar.tsx`.
- Contact: `components/Contact.tsx` posts `{ name, email, message, company }` to `src/app/api/contact/route.ts`
  (`company` is a honeypot). Needs `RESEND_API_KEY`; recipient `CONTACT_TO` (default ahmed.berrada@proton.me), sender `CONTACT_FROM`.
- Share image and favicon are generated: `src/app/opengraph-image.tsx`, `src/app/icon.tsx`.

## Workflows
- `npm run dev`, `npm run lint`, `npm test` (vitest), `npm run build`.
- Commit and push every small change. Redesign work happens on a branch; Vercel builds a preview per push.
