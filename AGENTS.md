# AGENTS.md

## Project Snapshot
- Stack: Next.js 16 App Router + React 19 + TypeScript strict mode.
- App is a single-page portfolio assembled in `src/app/page.tsx` from `Navbar`, `Hero`, `About`, `Projects`, `Skills`, `Contact`.
- Styling is mostly inline style objects inside components, with design tokens in `src/app/globals.css`.
- `CLAUDE.md` delegates to this file (`@AGENTS.md`), so keep this file current.

## Architecture and Data Flow
- Main rendering flow: `src/app/layout.tsx` -> `src/app/page.tsx` -> section components in `components/`.
- Section navigation depends on DOM ids and lowercase link labels (`Navbar.go()` + `scrollIntoView`): keep ids like `about`, `projects`, `skills`, `contact` aligned with `links` in `components/Navbar.tsx`.
- Contact flow: `components/Contact.tsx` sends `POST /api/contact` with `{ name, email, message }`; backend handler is `src/app/api/contact/route.ts`.
- Email backend uses Resend via dynamic import and requires `RESEND_API_KEY`.
- Market data client lives in `src/lib/marketApi.ts` (Railway API, timeout + payload normalization). It is currently not imported by UI components.

## Developer Workflows
- Install deps: `npm install`
- Dev server: `npm run dev`
- Lint: `npm run lint`
- Production build/start: `npm run build` then `npm run start`
- There is no test script configured in `package.json`.

## Project-Specific Conventions
- Use `"use client"` for interactive sections; all files in `components/` currently run on client side.
- Keep visual system consistent by reusing CSS variables from `:root` in `src/app/globals.css` (`--bg`, `--accent`, `--text-dim`, etc.).
- Animation pattern is standardized: elements use `.fade-in`, then `IntersectionObserver` adds `.visible` (see `About`, `Projects`, `Skills`, `Contact`).
- Responsive behavior is often defined via component-local `<style>{`@media ...`}</style>` blocks, not separate CSS modules.
- Path alias `@/*` maps to project root (see `tsconfig.json`), e.g. `import Navbar from "@/components/Navbar"`.
- Tailwind is installed, but the current UI mostly does not use utility classes.

## Integration and Risk Notes
- `src/app/api/contact/route.ts` sends to fixed recipient `aberrada@et.esiea.fr` and returns simple JSON `{ success: true }` or `{ error: string }`.
- `src/lib/marketApi.ts` uses hardcoded base URL `https://marketdatapipeline-production.up.railway.app` and resilient parsing helpers (`asRecord`, `asNumber`, `normalizeOhlcv`).
- `components/Projects.tsx` links one card to `/marketdatapipeline`, but no corresponding route exists under `src/app/`.
- Fonts are loaded via Google Fonts `@import` in `src/app/globals.css`; no `next/font` usage in current implementation.

## Agent Editing Guardrails
- Preserve section ids and navbar labels when renaming sections; breaking this silently breaks smooth-scroll navigation.
- For contact changes, update both `components/Contact.tsx` and `src/app/api/contact/route.ts` contract together.
- Prefer extending existing inline-style/component patterns over introducing a new styling paradigm in a small change.
- Keep edits minimal and localized: this repo favors self-contained components with local state/effects.
