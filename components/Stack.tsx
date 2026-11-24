"use client";
import SectionHeader from "./SectionHeader";
import { stack } from "@/src/content/profile";
import { useReveal } from "@/src/lib/useInView";

export default function Stack() {
  const ref = useReveal<HTMLElement>();
  return (
    <section id="stack" ref={ref} className="border-t border-line py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <SectionHeader index="03" label="Stack" title="Tools I reach for, by layer." />
        <dl className="reveal grid border-t border-line sm:grid-cols-2 lg:grid-cols-3">
          {stack.map((g) => (
            <div key={g.group} className="border-b border-line py-6 sm:pr-8">
              <dt className="font-mono text-xs tracking-wider text-ink uppercase">{g.group}</dt>
              <dd className="mt-3">
                <ul className="space-y-1.5">
                  {g.items.map((i) => (
                    <li key={i} className="text-ink-2">
                      {i}
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          ))}
        </dl>
        <p className="reveal mt-8 text-sm text-muted">Languages: French (C2), English (C1, daily working language), Arabic (native).</p>
      </div>
    </section>
  );
}
