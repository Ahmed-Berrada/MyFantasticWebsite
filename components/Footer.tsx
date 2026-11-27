import Link from "next/link";
import { LINKS, localPath } from "@/src/lib/seo";
import { fill } from "@/src/lib/format";
import type { Dict } from "@/src/content";
import type { Lang } from "@/src/content/types";

export default function Footer({ t, lang, altPath }: { t: Dict; lang: Lang; altPath: string }) {
  return (
    <footer className="mx-auto max-w-7xl px-5 pt-8 pb-12 md:px-8">
      <div className="flex flex-wrap items-baseline justify-between gap-x-10 gap-y-3 border-t border-line pt-8 text-sm text-ink-2">
        <p>
          {fill(t.footer.rights, { year: new Date().getFullYear() })}. {t.footer.status}
        </p>
        <p className="flex flex-wrap gap-x-6 gap-y-2">
          <Link href={localPath(lang, "/writing")} className="link link-tap">
            {t.nav.writing}
          </Link>
          <a href={LINKS.github} target="_blank" rel="noreferrer" className="link link-tap">
            {t.nav.github}
          </a>
          <a href={LINKS.linkedin} target="_blank" rel="noreferrer" className="link link-tap">
            {t.contact.linkedin}
          </a>
          <a href={altPath} hrefLang={t.nav.switchLang} lang={t.nav.switchLang} className="link link-tap">
            {t.nav.switchLabel}
          </a>
        </p>
      </div>
      <p className="mt-4 text-sm text-muted">{t.footer.live}</p>
    </footer>
  );
}
