import Link from "next/link";
import SiteShell from "./SiteShell";
import { getDict } from "@/src/content";
import { localPath } from "@/src/lib/seo";
import type { Lang } from "@/src/content/types";

/** 404 inside the normal nav and footer, so a broken link still lands on a page that looks like the site. */
export default function NotFoundPage({ lang }: { lang: Lang }) {
  const d = getDict(lang);
  const t = d.notFound;
  return (
    <SiteShell lang={lang} path="/">
      {/* React 19 hoists this into <head>: not-found files cannot export metadata. */}
      <title>{t.metaTitle}</title>
      <section className="mx-auto max-w-7xl px-5 pt-40 pb-32 md:px-8">
        <p className="text-ink-2">{t.code}</p>
        <h1 className="mt-3 font-display text-[clamp(44px,6.5vw,92px)] leading-[0.92] font-semibold tracking-[-0.02em]">{t.title}</h1>
        <p className="mt-6 max-w-[36rem] text-xl text-ink-2">{t.body}</p>
        <p className="mt-10 flex flex-wrap gap-x-7 gap-y-3">
          <Link href={localPath(lang, "/")} className="link link-tap font-medium">
            {t.back}
          </Link>
          <Link href={`${localPath(lang, "/")}#work`} className="link link-tap">
            {d.nav.work}
          </Link>
          <Link href={localPath(lang, "/writing")} className="link link-tap">
            {d.nav.writing}
          </Link>
        </p>
      </section>
    </SiteShell>
  );
}
