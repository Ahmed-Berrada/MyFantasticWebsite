import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-sans",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

const description =
  "Software engineer focused on low-latency trading systems and safety-critical automation. Order book matching engine (C++17 / Java 21, 163 ns median), GPU Monte Carlo pricer. Siemens Mobility, ESIEA 2027.";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.ahmedberrada.com"),
  title: "Ahmed Berrada · Low-latency & critical systems engineer",
  description,
  openGraph: {
    title: "Ahmed Berrada · Low-latency & critical systems engineer",
    description,
    url: "https://www.ahmedberrada.com",
    siteName: "Ahmed Berrada",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { themeColor: "#f6f5f1" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${plexSans.variable} ${plexMono.variable}`}>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
