import Link from "next/link";
import Blocks from "./Blocks";
import JsonLd from "./JsonLd";
import PageEnd from "./PageEnd";
import SiteShell from "./SiteShell";
import { formatDate } from "./WritingList";
import { getDict, getNote, getNotes } from "@/src/content";
import { SITE_URL, authorRef, breadcrumbJsonLd, localPath } from "@/src/lib/seo";
import type { Lang } from "@/src/content/types";
import { notFound } from "next/navigation";

export default function NotePage({ lang, slug }: { lang: Lang; slug: string }) {
  const t = getDict(lang);
  const n = getNote(lang, slug);
  if (!n) notFound();
  const path = `/writing/${n.slug}`;
  const notes = getNotes(lang);
  const following = notes[notes.findIndex((x) => x.slug === n.slug) + 1] ?? null;
  return (
    <SiteShell lang={lang} path={path}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: n.title,
          description: n.summary,
          datePublished: n.date,
          inLanguage: lang,
          mainEntityOfPage: SITE_URL + localPath(lang, path),
          author: authorRef(lang),
        }}
      />
      <JsonLd data={breadcrumbJsonLd(lang, [[t.nav.writing, "/writing"], [n.title, path]])} />
      <article className="mx-auto max-w-7xl px-5 pt-32 pb-24 md:px-8">
        <div className="max-w-5xl">
          <p>
            <Link href={localPath(lang, "/writing")} className="link link-tap text-sm">
              {t.writing.back}
            </Link>
          </p>
          <h1 className="mt-6 max-w-[48rem] font-display text-[clamp(34px,4.6vw,58px)] leading-[1] font-semibold tracking-[-0.02em] text-balance">{n.title}</h1>
          <p className="mt-5 text-ink-2">
            {t.writing.published} {formatDate(n.date, lang)}, {n.minutes} {t.writing.minutes}
          </p>
          <p className="mt-6 max-w-[40rem] text-xl leading-relaxed text-pretty">{n.summary}</p>
          <div className="mt-6">
            <Blocks blocks={n.blocks} lang={lang} heading="h2" />
          </div>
          <PageEnd lang={lang} next={following && { title: following.title, path: `/writing/${following.slug}` }} />
        </div>
      </article>
    </SiteShell>
  );
}
