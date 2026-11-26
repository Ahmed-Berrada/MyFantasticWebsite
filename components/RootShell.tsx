import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { body, display, mono } from "@/src/lib/fonts";
import type { Lang } from "@/src/content/types";

/** The <html> and <body> of every page; each language group renders it with its own lang. */
export default function RootShell({ lang, skip, children }: { lang: Lang; skip: string; children: React.ReactNode }) {
  return (
    <html lang={lang} className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
        <a href="#main" className="skip-link">
          {skip}
        </a>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
