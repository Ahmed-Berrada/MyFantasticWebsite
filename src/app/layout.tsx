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
  "Software engineer building systems that have to be right and fast: safety-critical rail software at Siemens Mobility, plus low-latency engines (order book matching at 163 ns median) and GPU compute. ESIEA 2027, Paris.";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.ahmedberrada.com"),
  title: "Ahmed Berrada, software engineer for critical and low-latency systems",
  description,
  openGraph: {
    title: "Ahmed Berrada, software engineer for critical and low-latency systems",
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
