# ahmedberrada.com

Source of my portfolio. **Right first. Then fast.**

The hero is a live train graph (a Marey diagram): move the pointer to read the timetable, type to put timed
pulses on a signal lane, each labelled with how long this page took to get your key on screen. Further down,
a price-time priority matching engine (TypeScript port of the layout in my C++
[lob-engine](https://github.com/Ahmed-Berrada/lob-engine)) and a Monte Carlo pricer run live in the page.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # engine and pricing tests
npm run build
```

The contact form needs `RESEND_API_KEY`. Optional: `CONTACT_TO`, `CONTACT_FROM`.

## Stack

Next.js 16, React 19, TypeScript, Tailwind CSS v4, vitest. Deployed on Vercel. Type: Bricolage Grotesque, Instrument Sans, Martian Mono.
