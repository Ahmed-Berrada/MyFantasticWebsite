"use client";
import { errorCopy } from "@/src/content/errors";
import type { Lang } from "@/src/content/types";

/** Shown by each language's error boundary instead of a blank screen when a component throws while rendering. */
export default function ErrorPage({ lang, reset }: { lang: Lang; reset: () => void }) {
  const t = errorCopy[lang];
  return (
    <main id="main" className="mx-auto flex min-h-[100dvh] max-w-7xl flex-col justify-center px-5 py-24 md:px-8">
      <p className="text-ink-2">{t.code}</p>
      <h1 className="mt-3 font-display text-5xl leading-[0.95] font-semibold tracking-[-0.02em]">{t.title}</h1>
      <p className="mt-6 max-w-[36rem] text-xl text-ink-2">{t.body}</p>
      <p className="mt-8 flex flex-wrap gap-x-7 gap-y-3">
        <button type="button" onClick={reset} className="link link-tap">
          {t.retry}
        </button>
        <a href={lang === "fr" ? "/fr" : "/"} className="link link-tap">
          {t.back}
        </a>
      </p>
    </main>
  );
}
