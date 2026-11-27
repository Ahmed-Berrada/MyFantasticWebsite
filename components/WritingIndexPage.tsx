import SiteShell from "./SiteShell";
import { NoteList } from "./WritingList";
import { getDict, getNotes } from "@/src/content";
import type { Lang } from "@/src/content/types";

export default function WritingIndexPage({ lang }: { lang: Lang }) {
  const t = getDict(lang);
  return (
    <SiteShell lang={lang} path="/writing">
      <section className="mx-auto max-w-7xl px-5 pt-32 pb-24 md:px-8">
        <h1 className="font-display text-[clamp(44px,6.5vw,92px)] leading-[0.92] font-semibold tracking-[-0.03em]">{t.writing.title}</h1>
        <p className="mt-6 mb-12 max-w-[36rem] text-xl leading-relaxed text-pretty text-ink-2">{t.writing.lede}</p>
        <NoteList notes={getNotes(lang)} t={t.writing} lang={lang} heading="h2" />
      </section>
    </SiteShell>
  );
}
