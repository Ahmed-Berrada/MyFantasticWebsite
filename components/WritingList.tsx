import Link from "next/link";
import { localPath } from "@/src/lib/seo";
import type { Dict } from "@/src/content";
import type { Lang, Note } from "@/src/content/types";

export function formatDate(iso: string, lang: Lang): string {
  return new Date(iso).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

/** A list of notes: title, one line, date and reading time. */
export function NoteList({ notes, t, lang, heading = "h3" }: { notes: Note[]; t: Dict["writing"]; lang: Lang; heading?: "h2" | "h3" }) {
  const H = heading;
  return (
    <ul className="border-t border-line">
      {notes.map((n) => (
        <li key={n.slug} className="border-b border-line">
          <Link href={localPath(lang, `/writing/${n.slug}`)} className="group grid gap-2 py-7 transition-colors duration-200 hover:bg-sunken md:-mx-4 md:grid-cols-[minmax(0,1fr)_12rem] md:gap-10 md:px-4">
            <div>
              <H className="font-display text-2xl leading-tight font-medium tracking-tight group-hover:underline group-hover:decoration-line-2 group-hover:underline-offset-4 md:text-3xl">{n.title}</H>
              <p className="mt-2 max-w-[40rem] text-ink-2 text-pretty">{n.summary}</p>
            </div>
            <p className="text-sm text-muted md:text-right">
              {formatDate(n.date, lang)}
              <br />
              {n.minutes} {t.minutes}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/**
 * The home page's writing section: compact, one line per note (title and date), newest first, so it shows that
 * the work goes on without taking a screen. Summaries live on /writing.
 */
export default function WritingList({ notes, t, lang }: { notes: Note[]; t: Dict["writing"]; lang: Lang }) {
  return (
    <section id="writing" className="border-t border-line-2 py-14 md:py-20">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 md:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] lg:gap-20">
        <div>
          <h2 className="font-display text-[clamp(40px,5vw,68px)] leading-[0.95] font-semibold tracking-[-0.02em]">{t.title}</h2>
          <p className="mt-5 hidden max-w-[26rem] text-lg leading-relaxed text-pretty text-ink-2 md:block">{t.lede}</p>
          <p className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
            <Link href={localPath(lang, "/writing")} className="link link-tap font-medium">
              {t.all}
            </Link>
            <a href={localPath(lang, "/writing/feed.xml")} type="application/rss+xml" className="link link-tap">
              {t.feed}
            </a>
          </p>
        </div>
        <ol className="border-t border-line">
          {notes.map((n) => (
            <li key={n.slug} className="border-b border-line">
              <Link
                href={localPath(lang, `/writing/${n.slug}`)}
                className="group grid gap-1 py-4 transition-colors duration-200 hover:bg-sunken sm:grid-cols-[minmax(0,1fr)_auto] sm:items-baseline sm:gap-6 md:-mx-3 md:px-3"
              >
                <span className="font-display text-xl leading-snug font-medium group-hover:underline group-hover:decoration-line-2 group-hover:underline-offset-4">{n.title}</span>
                <span className="text-sm text-muted tabular">{formatDate(n.date, lang)}</span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
