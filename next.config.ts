import type { NextConfig } from "next";

const dev = process.env.NODE_ENV !== "production";

/**
 * Pages are static, so a per-request nonce is not possible: inline scripts (Next's hydration data, JSON-LD) stay
 * allowed, and everything else is locked to this origin. Vercel Analytics and Speed Insights load from /_vercel.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval' https://va.vercel-scripts.com" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  `connect-src 'self'${dev ? " ws: https://va.vercel-scripts.com" : ""}`,
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    // One canonical host: the apex domain permanently redirects to www.
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "ahmedberrada.com" }],
        destination: "https://www.ahmedberrada.com/:path*",
        permanent: true,
      },
      // lob-engine was the C++ prototype of Order Book; both now share one case study.
      { source: "/work/lob-engine", destination: "/work/order-book", permanent: true },
      { source: "/fr/work/lob-engine", destination: "/fr/work/order-book", permanent: true },
    ];
  },
};

export default nextConfig;
