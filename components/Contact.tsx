"use client";
import { useState } from "react";
import ProximityText from "./ProximityText";
import { LINKS } from "@/src/lib/seo";
import type { Dict } from "@/src/content";

interface Props {
  t: Dict["contact"];
  cvEn: string | null;
  cvFr: string | null;
}

/** Email first: a mail link, a copy button, the two profiles and the two CVs. No form to run or lose messages in. */
export default function Contact({ t, cvEn, cvFr }: Props) {
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(LINKS.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${LINKS.email}`;
    }
  };

  return (
    <section id="contact" className="border-t border-line-2 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <h2 className="max-w-[56rem] font-display text-[clamp(40px,6vw,84px)] leading-[0.95] font-semibold tracking-[-0.02em] text-balance">
          <ProximityText text={t.title} rest={{ wght: 560, wdth: 88 }} peak={{ wght: 800, wdth: 94 }} radius={160} />
        </h2>
        <p className="mt-8 max-w-[38rem] text-xl leading-relaxed text-ink-2 text-pretty">{t.lede}</p>

        <div className="mt-12 flex flex-wrap items-center gap-x-4 gap-y-3">
          <a href={`mailto:${LINKS.email}`} className="link font-display text-2xl md:text-4xl">
            {LINKS.email}
          </a>
          <button
            onClick={copyEmail}
            className="rounded-[3px] border border-line-2 px-3 py-1.5 text-sm transition-colors hover:border-ink active:translate-y-px"
            aria-live="polite"
          >
            {copied ? t.copied : t.copy}
          </button>
        </div>
        <p className="mt-6 flex flex-wrap gap-x-7 gap-y-2">
          <a href={LINKS.linkedin} target="_blank" rel="noreferrer" className="link link-tap">
            {t.linkedin}
          </a>
          <a href={LINKS.github} target="_blank" rel="noreferrer" className="link link-tap">
            {t.github}
          </a>
          {cvEn && (
            <a href={cvEn} className="link link-tap">
              {t.cvEn}
            </a>
          )}
          {cvFr && (
            <a href={cvFr} className="link link-tap">
              {t.cvFr}
            </a>
          )}
        </p>
      </div>
    </section>
  );
}
