import ProximityText from "./ProximityText";
import TrainGraphCanvas from "./TrainGraphCanvas";
import { LINKS } from "@/src/lib/seo";
import type { Dict } from "@/src/content";

interface Props {
  t: Dict["hero"];
  /** CV PDF in this page's language, and in the other one. Null when not published. */
  cvHref: string | null;
  cvOtherHref: string | null;
}

/** Profile first: who, what, level and availability, with the two actions. The thesis comes directly under. */
export default function Hero({ t, cvHref, cvOtherHref }: Props) {
  return (
    <section id="top" className="relative flex flex-col overflow-hidden pt-20 xl:block xl:min-h-[100dvh]">
      {/* From xl the instrument shares the page's centred column and fades out behind the text; below, it sits
          under the text, because at 1024 px the text column covers half of the graph. */}
      <div className="relative order-2 mx-5 mb-16 h-[320px] sm:h-[400px] xl:absolute xl:inset-x-0 xl:top-16 xl:mx-auto xl:mb-0 xl:h-[calc(100dvh-4rem)] xl:max-w-7xl xl:px-8">
        <div className="h-full w-full xl:[mask-image:linear-gradient(90deg,transparent_0%,transparent_26%,#000_50%)]">
          <TrainGraphCanvas labels={t.graph} covered={{ query: "(min-width: 1280px)", fraction: 0.45 }} />
        </div>
      </div>

      <div className="pointer-events-none relative order-1 mx-auto w-full max-w-7xl px-5 pt-10 pb-12 md:px-8 xl:pt-[9vh] xl:pb-20">
        <div className="max-w-[34rem] [&_a]:pointer-events-auto">
          <h1 className="font-display text-[clamp(30px,3.2vw,42px)] leading-[1.05] font-semibold tracking-[-0.02em]">{t.name}</h1>
          <p className="mt-2 text-xl text-ink-2">{t.role}</p>
          <p className="mt-5 max-w-[31rem] leading-relaxed text-ink-2 text-pretty">{t.status}</p>

          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
            <a
              href={`mailto:${LINKS.email}`}
              className="rounded-[3px] bg-ink px-5 py-3 font-medium text-ground transition-colors duration-200 hover:bg-accent hover:text-ink active:translate-y-px"
            >
              {t.email}
            </a>
            {cvHref && (
              <a href={cvHref} className="rounded-[3px] border border-line-2 px-5 py-3 font-medium transition-colors duration-200 hover:border-ink active:translate-y-px">
                {t.cv}
              </a>
            )}
            {cvOtherHref && (
              <a href={cvOtherHref} className="link link-tap text-sm">
                {t.cvOther}
              </a>
            )}
          </div>

          <p className="mt-12 font-display text-[clamp(56px,8vw,118px)] leading-[0.86] tracking-[-0.035em]">
            <ProximityText text={t.thesis[0]} className="block" />
            <ProximityText text={t.thesis[1]} className="block" />
          </p>
          <p className="mt-7 max-w-[31rem] text-lg leading-relaxed text-ink-2 text-pretty">{t.intro}</p>
        </div>
      </div>
    </section>
  );
}
