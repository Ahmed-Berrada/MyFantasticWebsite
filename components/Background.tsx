import { certification, education, positions, sideRoles, stack } from "@/src/content/profile";

function Row({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-4 border-t border-line py-10 md:grid-cols-[14rem_1fr] md:gap-12">
      <h3 className="font-display text-2xl font-medium tracking-tight">{title}</h3>
      <div>{children}</div>
    </div>
  );
}

export default function Background() {
  const earlier = positions.slice(1);
  return (
    <section id="background" className="border-t border-line-2 py-24 md:py-36">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <h2 className="mb-14 font-display text-[clamp(40px,5vw,68px)] leading-[0.95] font-semibold tracking-[-0.03em]">
          Background
        </h2>

        <Row title="Education">
          <p className="text-lg">{education.school}</p>
          <p className="text-ink-2">
            {education.degree}, {education.period}.
          </p>
          <p className="mt-4 max-w-[40rem] text-ink-2">{education.coursework}</p>
        </Row>

        <Row title="Before Siemens">
          <ul className="space-y-4">
            {earlier.map((p) => (
              <li key={p.org}>
                <p className="text-lg">
                  {p.org}, <span className="text-ink-2">{p.role.toLowerCase()}</span>
                </p>
                <p className="text-muted">
                  {p.period}, {p.place}
                </p>
              </li>
            ))}
          </ul>
        </Row>

        <Row title="Outside work">
          <ul className="space-y-4">
            {sideRoles.map((r) => (
              <li key={r.org}>
                <p className="text-lg">
                  {r.role}, {r.org}
                </p>
                <p className="text-ink-2">
                  {r.note} <span className="text-muted">{r.period}.</span>
                </p>
              </li>
            ))}
          </ul>
        </Row>

        <Row title="Tools">
          <dl className="grid gap-x-10 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            {stack.map((g) => (
              <div key={g.group}>
                <dt className="font-medium">{g.group}</dt>
                <dd className="mt-1 text-ink-2">{g.items.join(", ")}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-8 text-ink-2">{certification}.</p>
          <p className="mt-2 text-ink-2">French (C2), English (C1, my daily working language), Arabic (native).</p>
        </Row>
      </div>
    </section>
  );
}
