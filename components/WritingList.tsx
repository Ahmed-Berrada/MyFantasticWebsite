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
          <Link href={localPath(lang, `/writing/${n.slug}`)} className="group grid gap-2 py-7 transition-colors duration-200 hover:bg-sunken md:grid-cols-[minmax(0,1fr)_12rem] md:gap-10 md:px-4">
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

export default function WritingList({ notes, t, lang }: { notes: Note[]; t: Dict["writing"]; lang: Lang }) {
  return (
    <section id="writing" className="border-t border-line-2 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="mb-12 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,36rem)] lg:items-end lg:gap-24">
          <h2 className="font-display text-[clamp(44px,6.5vw,92px)] leading-[0.92] font-semibold tracking-[-0.03em]">{t.title}</h2>
          <p className="text-xl leading-relaxed text-pretty text-ink-2">{t.lede}</p>
        </div>
        <NoteList notes={notes} t={t} lang={lang} />
        <p className="mt-8">
          <Link href={localPath(lang, "/writing")} className="link font-medium">
            {t.all}
          </Link>
        </p>
      </div>
    </section>
  );
}
