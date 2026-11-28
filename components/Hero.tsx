import ProximityText from "./ProximityText";
import TrainGraphCanvas from "./TrainGraphCanvas";
import { crosstownStations } from "@/src/content/crosstown";
import { LINKS } from "@/src/lib/seo";
import type { Dict } from "@/src/content";

interface Props {
  t: Dict["hero"];
  /** CV PDF in this page's language, and in the other one. Null when not published. */
  cvHref: string | null;
  cvOtherHref: string | null;
}

/**
 * The ten-second answer: who (the name, largest), what (the role), what for (the CDI line), how to reach (three
 * actions). The slogan follows as a subtitle; the Crosstown graph sits beside the text, not under it.
 */
export default function Hero({ t, cvHref, cvOtherHref }: Props) {
  return (
    <section id="top" className="pt-16">
      <div className="mx-auto max-w-7xl px-5 pt-12 pb-14 md:px-8 md:pt-16 xl:grid xl:min-h-[calc(100dvh-4rem)] xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] xl:items-center xl:gap-16 xl:pt-10">
        <div>
          <h1 className="font-display text-[clamp(52px,8vw,112px)] leading-[0.9] tracking-[-0.02em]">
            <ProximityText text={t.name} rest={{ wght: 600, wdth: 86 }} peak={{ wght: 800, wdth: 92 }} radius={170} />
          </h1>
          <p className="mt-6 max-w-[36rem] text-xl leading-snug text-pretty md:text-2xl">{t.role}</p>
          <p className="mt-6 flex items-center gap-3 font-medium">
            <span aria-hidden className="size-3 shrink-0 bg-accent" />
            {t.open}
          </p>
          <p className="mt-2 max-w-[34rem] text-ink-2 text-pretty">{t.status}</p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href={`mailto:${LINKS.email}`}
              className="rounded-[3px] bg-ink px-5 py-3 font-medium text-ground transition-colors duration-200 hover:bg-accent hover:text-ink active:scale-[0.98]"
            >
              {t.email}
            </a>
            {cvHref && (
              <a href={cvHref} className="rounded-[3px] border border-line-2 px-5 py-3 font-medium transition-colors duration-200 hover:border-ink active:scale-[0.98]">
                {t.cv}
              </a>
            )}
            <a
              href={LINKS.linkedin}
              target="_blank"
              rel="noreferrer"
              className="rounded-[3px] border border-line-2 px-5 py-3 font-medium transition-colors duration-200 hover:border-ink active:scale-[0.98]"
            >
              {t.linkedin}
            </a>
          </div>
          {cvOtherHref && (
            <p className="mt-4">
              <a href={cvOtherHref} className="link link-tap text-sm">
                {t.cvOther}
              </a>
            </p>
          )}

          <p className="mt-10 font-display text-3xl leading-tight font-medium tracking-[-0.01em] text-ink-2 md:text-4xl">
            {t.thesis[0]} {t.thesis[1]}
          </p>
        </div>

        <div className="mt-10 h-[230px] sm:h-[360px] xl:mt-0 xl:h-[460px]">
          <TrainGraphCanvas labels={t.graph} stations={crosstownStations} />
        </div>
      </div>
    </section>
  );
}
