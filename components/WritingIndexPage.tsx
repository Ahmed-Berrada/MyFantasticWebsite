import JsonLd from "./JsonLd";
import SiteShell from "./SiteShell";
import { NoteList } from "./WritingList";
import { getDict, getNotes } from "@/src/content";
import { SITE_URL, authorRef, localPath } from "@/src/lib/seo";
import { feedPath } from "@/src/lib/feed";
import type { Lang } from "@/src/content/types";

export default function WritingIndexPage({ lang }: { lang: Lang }) {
  const t = getDict(lang);
  const notes = getNotes(lang);
  return (
    <SiteShell lang={lang} path="/writing">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Blog",
          name: t.meta.writingTitle,
          description: t.meta.writingDescription,
          url: SITE_URL + localPath(lang, "/writing"),
          inLanguage: lang,
          author: authorRef(lang),
          blogPost: notes.map((n) => ({
            "@type": "BlogPosting",
            headline: n.title,
            datePublished: n.date,
            url: SITE_URL + localPath(lang, `/writing/${n.slug}`),
          })),
        }}
      />
      <section className="mx-auto max-w-7xl px-5 pt-32 pb-24 md:px-8">
        <h1 className="font-display text-[clamp(44px,6.5vw,92px)] leading-[0.92] font-semibold tracking-[-0.03em]">{t.writing.title}</h1>
        <p className="mt-6 max-w-[36rem] text-xl leading-relaxed text-pretty text-ink-2">{t.writing.lede}</p>
        <p className="mt-3 mb-12 text-sm">
          <a href={feedPath(lang)} className="link link-tap" type="application/rss+xml">
            {t.writing.feed}
          </a>
        </p>
        <NoteList notes={notes} t={t.writing} lang={lang} heading="h2" />
      </section>
    </SiteShell>
  );
}
