import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ahmed Berrada — Computer Networks & Cloud",
  description:
      "Computer networks and cloud enthusiast. Apprentice at Siemens Mobility, ambassador at ESIEA.",
  openGraph: {
    title: "Ahmed Berrada — Computer Networks & Cloud",
    description: "Building robust computer network and cloud systems.",
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