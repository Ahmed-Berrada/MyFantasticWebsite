import Link from "next/link";
import RadioLink from "./RadioLink";
import SplitFlap from "./SplitFlap";
import { localPath } from "@/src/lib/seo";
import type { Dict } from "@/src/content";
import type { Lang } from "@/src/content/types";

export default function Siemens({ t, lang }: { t: Dict["siemens"]; lang: Lang }) {
  return (
    <section id="siemens" className="border-t border-line-2 py-16 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-20">
          <div className="max-w-[46rem]">
            <p className="text-ink-2">{t.since}</p>
            <h2 className="mt-4 font-display text-[clamp(44px,6.5vw,92px)] leading-[0.92] font-semibold tracking-[-0.015em] [font-variation-settings:'wdth'_88]">{t.title}</h2>
            <p className="mt-3 text-lg text-ink-2">{t.subtitle}</p>
            <p className="mt-10 max-w-[38rem] text-xl leading-relaxed text-pretty">{t.lede}</p>
            <p className="mt-8">
              <Link href={localPath(lang, "/work/siemens-cbtc")} className="link link-tap">
                {t.caseCta}
              </Link>
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:gap-x-8 lg:w-[27rem]">
            {t.flaps.map((f) => (
              <SplitFlap key={f.label} value={f.value} label={f.label} />
            ))}
          </div>
        </div>
        <div className="mt-16">
          <RadioLink t={t.radio} />
        </div>
      </div>
    </section>
  );
}
