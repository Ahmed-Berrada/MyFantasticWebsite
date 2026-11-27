import MetroLine from "./MetroLine";
import type { Dict } from "@/src/content";

function Row({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-4 border-t border-line py-10 md:grid-cols-[14rem_1fr] md:gap-12">
      <h3 className="font-display text-2xl font-medium tracking-tight">{title}</h3>
      <div className="max-w-[44rem] leading-relaxed text-ink-2">{children}</div>
    </div>
  );
}

export default function Background({ t }: { t: Dict["background"] }) {
  return (
    <section id="background" className="border-t border-line-2 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <h2 className="mb-14 font-display text-[clamp(40px,5vw,68px)] leading-[0.95] font-semibold tracking-[-0.02em]">{t.title}</h2>
        <div className="mb-20">
          <MetroLine stops={t.stops} label={t.metroLabel} />
        </div>
        <Row title={t.educationTitle}>
          <p>{t.education}</p>
        </Row>
        <Row title={t.toolsTitle}>
          <p>{t.tools}</p>
          <p className="mt-4">{t.languages}</p>
        </Row>
      </div>
    </section>
  );
}
