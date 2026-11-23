"use client";
import SectionHeader from "./SectionHeader";
import PipelineRun from "./PipelineRun";
import { education, positions, sideRoles } from "@/src/content/profile";
import { useReveal } from "@/src/lib/useInView";

export default function Experience() {
  const ref = useReveal<HTMLElement>();
  const [lead, ...earlier] = positions;

  return (
    <section id="experience" ref={ref} className="border-t border-line bg-surface py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <SectionHeader
          index="02"
          label="Experience"
          title="Automation for systems that are not allowed to fail."
          lede="Safety-critical rail signalling taught me the habits trading systems need: every behaviour specified, every change tested, every run reproducible."
        />

        <article className="reveal grid gap-12 lg:grid-cols-[1fr_minmax(0,460px)] lg:gap-16">
          <div>
            <p className="font-mono text-xs text-muted">
              {lead.period} · {lead.place}
            </p>
            <h3 className="mt-1 text-2xl font-semibold tracking-tight">{lead.org}</h3>
            <p className="mt-1 text-ink-2">{lead.role}</p>
            <ul className="mt-6 space-y-3.5">
              {lead.points.map((p) => (
                <li key={p} className="grid grid-cols-[1rem_1fr] leading-relaxed text-ink-2">
                  <span className="mt-[11px] block h-px w-2 bg-signal" aria-hidden />
                  {p}
                </li>
              ))}
            </ul>
            {lead.tags && (
              <ul className="mt-6 flex flex-wrap gap-2">
                {lead.tags.map((t) => (
                  <li key={t} className="rounded border border-line px-2 py-0.5 font-mono text-xs text-ink-2">
                    {t}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <PipelineRun />
        </article>

        <div className="reveal mt-20 grid gap-12 border-t border-line pt-12 md:grid-cols-3">
          <div>
            <h4 className="font-mono text-xs tracking-wider text-muted uppercase">Earlier</h4>
            <ul className="mt-4 space-y-5">
              {earlier.map((p) => (
                <li key={p.org}>
                  <p className="font-medium">{p.org}</p>
                  <p className="text-sm text-ink-2">{p.role}</p>
                  <p className="font-mono text-xs text-muted">
                    {p.period} · {p.place}
                  </p>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-mono text-xs tracking-wider text-muted uppercase">Leadership</h4>
            <ul className="mt-4 space-y-5">
              {sideRoles.map((r) => (
                <li key={r.org}>
                  <p className="font-medium">{r.org}</p>
                  <p className="text-sm text-ink-2">
                    {r.role}. {r.note}
                  </p>
                  <p className="font-mono text-xs text-muted">{r.period}</p>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-mono text-xs tracking-wider text-muted uppercase">Education</h4>
            <div className="mt-4">
              <p className="font-medium">{education.school}</p>
              <p className="text-sm text-ink-2">{education.degree}</p>
              <p className="font-mono text-xs text-muted">{education.period}</p>
              <p className="mt-4 text-sm text-ink-2">{education.coursework}</p>
              <p className="mt-4 text-sm text-muted">Reading on the side:</p>
              <ul className="mt-1 space-y-0.5 text-sm text-ink-2">
                {education.reading.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
