import Link from "next/link";
import { localPath } from "@/src/lib/seo";
import type { Dict } from "@/src/content";
import type { Lang } from "@/src/content/types";

/**
 * The flagship: the project in a few sentences, then what was built, in order, from joining to delivery. Each
 * figure appears once, in the step it belongs to. The radio demo lives in the case study.
 */
export default function Siemens({ t, lang }: { t: Dict["siemens"]; lang: Lang }) {
  const last = t.path.length - 1;
  return (
    <section id="siemens" className="border-t border-line-2 py-16 md:py-28">
      <div className="mx-auto grid max-w-7xl gap-14 px-5 md:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-20">
        <div>
          <p className="text-ink-2">{t.since}</p>
          <h2 className="mt-4 font-display text-[clamp(44px,6vw,84px)] leading-[0.92] font-semibold tracking-[-0.015em] [font-variation-settings:'wdth'_88]">{t.title}</h2>
          <p className="mt-3 text-lg text-ink-2">{t.subtitle}</p>
          <p className="mt-8 max-w-[36rem] text-xl leading-relaxed text-pretty">{t.lede}</p>
          <p className="mt-8">
            <Link href={localPath(lang, "/work/cbtc-validation")} className="link link-tap font-medium">
              {t.caseCta}
            </Link>
          </p>
        </div>

        <div>
          <h3 className="font-mono text-xs text-muted">{t.pathLabel}</h3>
          <ol className="relative mt-6">
            {/* the line the steps hang on */}
            <span aria-hidden className="absolute top-2 bottom-2 left-[7px] w-0.5 bg-ink" />
            {t.path.map((step, i) => (
              <li key={step.text} className="relative grid grid-cols-[1.75rem_1fr] gap-x-3 pb-7 last:pb-0">
                <span
                  aria-hidden
                  className={`relative mt-1.5 block rounded-full border-[3px] border-ink ${
                    i === last ? "size-4 bg-accent" : step.when ? "size-4 bg-ink" : "ml-[3px] size-2.5 border-2 bg-ground"
                  }`}
                />
                <div>
                  {step.when && <p className="font-mono text-xs text-ink-2 tabular">{step.when}</p>}
                  <p className={`leading-relaxed text-pretty ${i === last ? "font-medium text-ink" : "text-ink-2"}`}>{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
