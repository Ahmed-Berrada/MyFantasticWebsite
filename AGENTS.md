# AGENTS.md

## Project snapshot
- Portfolio for ahmedberrada.com. Audience: hiring managers in fintech and low-latency systems.
- Stack: Next.js 16 App Router, React 19, TypeScript strict, Tailwind v4, vitest. Deployed on Vercel.
- Single page assembled in `src/app/page.tsx`: `Navbar`, `Hero`, `Work`, `Experience`, `Stack`, `Contact`.

## Design direction (keep it)
- Light "engineering spec sheet": paper `--paper`, ink `--ink`, one action colour `--signal` (cobalt).
  `--bid` / `--ask` are for market data only; `--amber` for "running" states.
- Fonts: IBM Plex Sans + IBM Plex Mono via `next/font` (`--font-sans`, `--font-mono`). Numbers use `.tabular`.
- Motion only when it demonstrates the work (live order book, message flow, GBM paths, CI run, latency bars).
  No decorative gradients, blobs or parallax. Every animated component pauses off-screen and honours
  `prefers-reduced-motion` (`usePrefersReducedMotion`).
- Tokens live in `src/app/globals.css` (`:root` + `@theme inline`). Use Tailwind classes such as `text-ink-2`, `bg-sunken`.

## Content
- All copy for positions, roles, education and stack: `src/content/profile.ts` (sourced from the owner's CV).
- Projects shown: Order Book (Order_Book + lob-engine) and the GPU Monte Carlo pricer only. Do not add others unless asked.
- Figures quoted (163 ns, 3.46M ops/s, 295 s / 7.4 s / 0.46 s) come from the CV; keep them in sync with it.

## Code map
- `src/lib/orderbook/engine.ts`: price-time priority book (intrusive FIFO per level, O(1) cancel). `flow.ts`: seeded synthetic flow.
- `src/lib/montecarlo.ts`: Black-Scholes and antithetic Monte Carlo estimator.
- `src/lib/useInView.ts`: `useInView`, `useOnScreen`, `useReveal` (adds `.is-visible` to `.reveal` children), `usePrefersReducedMotion`, `useScrolledPast`.
- Section ids `work`, `experience`, `stack`, `contact` must match the links in `components/Navbar.tsx`.
- Contact: `components/Contact.tsx` posts `{ name, email, message, company }` to `src/app/api/contact/route.ts`
  (`company` is a honeypot). Needs `RESEND_API_KEY`; recipient `CONTACT_TO` (default ahmed.berrada@proton.me), sender `CONTACT_FROM`.
- Share image and favicon are generated: `src/app/opengraph-image.tsx`, `src/app/icon.tsx`.

## Workflows
- `npm run dev`, `npm run lint`, `npm test` (vitest), `npm run build`.
- Commit and push every small change. Redesign work happens on a branch; Vercel builds a preview per push.
