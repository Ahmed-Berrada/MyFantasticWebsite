import Link from "next/link";
import { availableCvs } from "@/src/content/cv";
import { getDict } from "@/src/content";
import { LINKS, localPath } from "@/src/lib/seo";
import type { Lang } from "@/src/content/types";

/**
 * The end of a case study or note: where to go next, and how to get in touch, so a reader who got this far
 * does not have to scroll back up.
 */
export default function PageEnd({ lang, next }: { lang: Lang; next: { title: string; path: string } | null }) {
  const t = getDict(lang).pageEnd;
  const cv = availableCvs().find((c) => c.lang === lang.toUpperCase());
  return (
    <aside className="mt-24 grid gap-10 border-t border-line pt-10 md:grid-cols-2 md:gap-16">
      <div>
        <p className="text-sm text-muted">{next ? t.next : ""}</p>
        {next ? (
          <Link href={localPath(lang, next.path)} className="link mt-2 inline-block font-display text-2xl leading-tight font-medium text-balance md:text-3xl">
            {next.title}
          </Link>
        ) : (
          <Link href={localPath(lang, "/writing")} className="link mt-2 inline-block font-display text-2xl font-medium md:text-3xl">
            {t.allNotes}
          </Link>
        )}
      </div>
      <div>
        <p className="text-sm text-muted">{t.hiring}</p>
        <p className="mt-3 flex flex-wrap gap-x-7 gap-y-3">
          <a href={`mailto:${LINKS.email}`} className="link link-tap font-medium">
            {t.email}
          </a>
          {cv && (
            <a href={cv.href} download className="link link-tap">
              {t.cv}
            </a>
          )}
        </p>
      </div>
    </aside>
  );
}
