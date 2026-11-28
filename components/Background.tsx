import MetroMap from "./MetroMap";
import type { Dict } from "@/src/content";

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-line pt-5">
      <h3 className="font-mono text-xs text-muted">{title}</h3>
      <div className="mt-3 text-[15px] leading-relaxed text-ink-2">{children}</div>
    </div>
  );
}

/** The path as a metro map, then education, tools and languages side by side: reference material, kept compact. */
export default function Background({ t }: { t: Dict["background"] }) {
  return (
    <section id="background" className="border-t border-line-2 py-14 md:py-20">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <h2 className="mb-10 font-display text-[clamp(40px,5vw,68px)] leading-[0.95] font-semibold tracking-[-0.02em]">{t.title}</h2>
        <MetroMap stops={t.stops} lines={t.lines} label={t.metroLabel} />
        <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-[1fr_1.4fr_0.8fr] lg:gap-12">
          <Block title={t.educationTitle}>
            <p>{t.education}</p>
          </Block>
          <Block title={t.toolsTitle}>
            <dl className="space-y-1.5">
              {t.tools.map((r) => (
                <div key={r.label}>
                  <dt className="inline font-medium text-ink">{r.label}: </dt>
                  <dd className="inline">{r.value}</dd>
                </div>
              ))}
            </dl>
          </Block>
          <Block title={t.languagesTitle}>
            <p>{t.languages}</p>
          </Block>
        </div>
      </div>
    </section>
  );
}
