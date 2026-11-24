import PipelineRun from "./PipelineRun";

const highlights = [
  {
    title: "The tool the software is tested with",
    body: "I designed and built the CRG Message Generator in Python. It plays the onboard and wayside equipment (CC, ZC, WRG) and injects radio messages into the CRG software. Without it, the CRG cannot be tested at all.",
  },
  {
    title: "Scenarios anyone on the team can write",
    body: "A Robot Framework layer with domain keywords runs the whole campaign, about 200 scenarios with one requirement each, and lets engineers who do not write code add their own.",
  },
  {
    title: "Infrastructure, from nothing",
    body: "GitLab CI/CD and its runners, automatic archiving of every report and log, and the CRG virtualised with QEMU/KVM inside Linux network namespaces. I own the test bench.",
  },
  {
    title: "Shipped and adopted",
    body: "Delivered for CRG release 4.2 and now the team's standard tool. Safety-critical rules (CENELEC EN 50128), Scrum, and daily work in English with the development team in India.",
  },
];

export default function Siemens() {
  return (
    <section id="siemens" className="border-t border-line-2 py-24 md:py-36">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] lg:gap-24">
          <div>
            <p className="text-ink-2">Since September 2025, apprenticeship until August 2027</p>
            <h2 className="mt-4 font-display text-[clamp(44px,6.5vw,92px)] leading-[0.92] font-semibold tracking-[-0.03em] [font-variation-settings:'wdth'_88]">
              Siemens Mobility
            </h2>
            <p className="mt-3 text-lg text-ink-2">Software engineer, simulation and tooling. Châtillon, France.</p>
            <p className="mt-10 max-w-[38rem] text-xl leading-relaxed text-pretty">
              New York City Transit is moving its Crosstown line to CBTC signalling over 5G radio, a first for Siemens
              Mobility. I joined the radio software team at its first release, and I build what that software is proven
              against.
            </p>
          </div>
          <div className="lg:pt-3">
            <PipelineRun />
          </div>
        </div>

        <div className="mt-20 grid gap-x-16 gap-y-12 border-t border-line pt-12 md:grid-cols-2">
          {highlights.map((h) => (
            <div key={h.title} className="max-w-[34rem]">
              <h3 className="font-display text-2xl leading-tight font-medium tracking-tight">{h.title}</h3>
              <p className="mt-3 leading-relaxed text-ink-2">{h.body}</p>
            </div>
          ))}
        </div>
        <p className="mt-14 text-muted">
          Python, Robot Framework, GitLab CI, QEMU/KVM, Linux network namespaces, CENELEC EN 50128.
        </p>
      </div>
    </section>
  );
}
