import Link from "next/link";
import Blocks from "./Blocks";
import JsonLd from "./JsonLd";
import SiteShell from "./SiteShell";
import { formatDate } from "./WritingList";
import { getCase, getDict } from "@/src/content";
import { SITE_URL, authorRef, breadcrumbJsonLd, localPath } from "@/src/lib/seo";
import type { Lang } from "@/src/content/types";
import { notFound } from "next/navigation";

/** One case study in the shared template: problem, constraints, approach, measured result, reproduce, next. */
export default function CasePage({ lang, slug }: { lang: Lang; slug: string }) {
  const t = getDict(lang);
  const c = getCase(lang, slug);
  if (!c) notFound();
  return (
    <SiteShell lang={lang} path={`/work/${c.slug}`}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "TechArticle",
          headline: c.title,
          description: c.plain,
          dateModified: c.updated,
          inLanguage: lang,
          mainEntityOfPage: SITE_URL + localPath(lang, `/work/${c.slug}`),
          author: authorRef(lang),
          ...(c.repos.length
            ? { about: c.repos.map((r) => ({ "@type": "SoftwareSourceCode", name: r.label, codeRepository: r.href })) }
            : {}),
        }}
      />
      <JsonLd data={breadcrumbJsonLd(lang, [[c.title, `/work/${c.slug}`]])} />
      <article className="mx-auto max-w-5xl px-5 pt-32 pb-24 md:px-8">
        <p>
          <Link href={`${localPath(lang, "/")}#work`} className="link text-sm">
            {t.case.back}
          </Link>
        </p>
        <h1 className="mt-6 max-w-[48rem] font-display text-[clamp(36px,5vw,64px)] leading-[0.98] font-semibold tracking-[-0.03em] text-balance">{c.title}</h1>
        <p className="mt-6 max-w-[40rem] text-xl leading-relaxed text-pretty">{c.plain}</p>

        <dl className="mt-10 grid gap-x-10 gap-y-3 border-y border-line py-6 text-[15px] sm:grid-cols-[8rem_1fr]">
          <dt className="text-muted">{t.case.status}</dt>
          <dd className="text-ink-2">{c.status}</dd>
          <dt className="text-muted">Stack</dt>
          <dd className="font-mono text-[13px] text-ink-2">{c.stack}</dd>
          <dt className="text-muted">{t.case.updated}</dt>
          <dd className="text-ink-2">{formatDate(c.updated, lang)}</dd>
          {c.repos.length > 0 && (
            <>
              <dt className="text-muted">{t.case.code}</dt>
              <dd className="flex flex-wrap gap-x-6 gap-y-2">
                {c.repos.map((r) => (
                  <a key={r.href} href={r.href} target="_blank" rel="noreferrer" className="link">
                    {r.label}
                  </a>
                ))}
              </dd>
            </>
          )}
        </dl>

        {c.sections.map((s) => (
          <section key={s.id} id={s.id} className="mt-20">
            <h2 className="font-display text-3xl leading-tight font-semibold tracking-[-0.02em] md:text-4xl">{t.case.sections[s.id]}</h2>
            <Blocks blocks={s.blocks} lang={lang} />
          </section>
        ))}
      </article>
    </SiteShell>
  );
}
