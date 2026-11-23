# ahmedberrada.com

Source of my portfolio: **trading systems, engineered like safety-critical software.**

The hero runs a real price-time priority matching engine in your browser (TypeScript port of the layout
used in my C++ [lob-engine](https://github.com/Ahmed-Berrada/lob-engine): intrusive FIFO per price level,
O(1) cancel, seeded and replayable order flow). The Monte Carlo section prices a European call live with
antithetic variates and converges on Black-Scholes.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # engine and pricing tests
npm run build
```

The contact form needs `RESEND_API_KEY`. Optional: `CONTACT_TO`, `CONTACT_FROM`.

## Stack

Next.js 16, React 19, TypeScript, Tailwind CSS v4, vitest. Deployed on Vercel.
