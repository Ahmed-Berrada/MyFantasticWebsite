import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ahmed Berrada - CS Student · Finance, AI & Data enthusiast",
  description: "Portfolio - Data Scientist, AI Engineer & Quantitative Analysis enthusiast. Showcasing projects in finance, machine learning, and data engineering. Passionate about leveraging technology to solve complex problems and drive innovation.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
