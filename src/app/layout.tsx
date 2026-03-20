import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Alex Morgan — AI × Quantitative Finance",
  description:
      "Engineering student specializing in LLMs and Quantitative Finance. ex-Citadel, ex-Two Sigma.",
  openGraph: {
    title: "Alex Morgan — AI × Quantitative Finance",
    description: "Engineering the intersection of LLMs and Quantitative Finance.",
    type: "website",
  },
};

export default function RootLayout({
                                     children,
                                   }: {
  children: React.ReactNode;
}) {
  return (
      <html lang="en" className="dark">
      <head>
        {/* Geist Mono via CDN (or replace with next/font if using Vercel) */}
        <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700;800&display=swap"
            rel="stylesheet"
        />
      </head>
      <body>{children}</body>
      </html>
  );
}