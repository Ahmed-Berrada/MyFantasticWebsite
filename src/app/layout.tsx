import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ahmed Berrada — Scalable AI for Financial Systems",
  description: "Computer Science student (Class of 2027) building cloud-native data and AI systems for finance use cases.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
