import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Instrument_Sans, Martian_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  axes: ["opsz", "wdth"],
  variable: "--font-bricolage",
  display: "swap",
});

const body = Instrument_Sans({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-instrument",
  display: "swap",
});

const mono = Martian_Mono({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-martian",
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

export const viewport: Viewport = { themeColor: "#eceef0" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
        <a href="#main" className="skip-link">Skip to content</a>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
