import Link from "next/link";
import LiveOrderBook from "./LiveOrderBook";
import AiPlaceholder from "./AiPlaceholder";
import PhoneReveal from "./PhoneReveal";
import { localPath } from "@/src/lib/seo";
import type { Dict } from "@/src/content";
import type { Lang } from "@/src/content/types";

interface ProjectLink {
  label: string;
  href: string;
  /** Internal page path (language-neutral). External links open in a new tab. */
  internal?: boolean;
}

function Project({
  title,
  plain,
  facts,
  links,
  lang,
  extra,
  children,
}: {
  title: string;
  plain: string;
  facts: string[];
  links: ProjectLink[];
  lang: Lang;
  /** More evidence under the facts, in the text column. */
  extra?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <article className="mt-12 border-t border-line pt-10 md:mt-16">
      <div className={`grid gap-10 [&>*]:min-w-0 ${children ? "lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-20" : ""}`}>
        {/* Beside a tall demo, the text column travels with it instead of leaving a void under the links. */}
        <div className={children ? "lg:sticky lg:top-24 lg:self-start" : ""}>
          <h3 className="font-display text-4xl leading-tight font-medium tracking-tight md:text-5xl">{title}</h3>
          <p className="mt-3 mb-6 max-w-[40rem] text-lg leading-relaxed text-ink text-pretty">{plain}</p>
          <ul className="max-w-[40rem] space-y-3 text-ink-2">
            {facts.map((f) => (
              <li key={f} className="relative pl-6 leading-relaxed before:absolute before:top-[0.8em] before:left-0 before:h-px before:w-3.5 before:bg-ink">
                {f}
              </li>
            ))}
          </ul>
          <p className="mt-6 flex flex-wrap gap-x-7 gap-y-3">
            {links.map((l) =>
              l.internal ? (
                <Link key={l.href} href={localPath(lang, l.href)} className="link link-tap font-medium">
                  {l.label}
                </Link>
              ) : (
                <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="link link-tap">
                  {l.label}
                </a>
              ),
            )}
          </p>
          {extra && <div className="mt-12 max-w-[40rem]">{extra}</div>}
        </div>
        {children}
      </div>
    </article>
  );
}

export default function Work({ t, lang }: { t: Dict["work"]; lang: Lang }) {
  return (
    <section id="work" className="border-t border-line-2 py-14 md:py-20">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,36rem)] lg:items-end lg:gap-24">
          <h2 className="font-display text-[clamp(44px,6.5vw,92px)] leading-[0.92] font-semibold tracking-[-0.02em]">{t.title}</h2>
          <p className="text-xl leading-relaxed text-pretty text-ink-2">{t.lede}</p>
        </div>

        <Project
          lang={lang}
          title={t.orderBook.title}
          plain={t.orderBook.plain}
          facts={t.orderBook.facts}
          links={[
            { label: t.caseCta, href: "/work/order-book", internal: true },
            { label: t.orderBook.repo, href: "https://github.com/Ahmed-Berrada/Order_Book" },
            { label: t.orderBook.prototype, href: "https://github.com/Ahmed-Berrada/lob-engine" },
          ]}
        >
          <PhoneReveal label={t.orderBook.show}>
            <LiveOrderBook t={t.orderBookUi} lang={lang} />
            <p className="mt-3 text-sm text-muted">{t.orderBook.demo}</p>
          </PhoneReveal>
        </Project>

        {/* The AI project, while it is being built: what it is and when it lands, beside a quiet animation. */}
        <article className="mt-12 grid gap-8 border-t border-line pt-10 md:mt-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-center lg:gap-20">
          <div>
            <h3 className="font-display text-4xl leading-tight font-medium tracking-tight md:text-5xl">{t.ai.title}</h3>
            <p className="mt-3 max-w-[36rem] text-lg leading-relaxed text-ink-2 text-pretty">{t.ai.plain}</p>
          </div>
          <AiPlaceholder header={t.ai.header} status={t.ai.status} aria={t.ai.aria} />
        </article>
      </div>
    </section>
  );
}
