import RadioLink from "./RadioLink";
import SplitFlap from "./SplitFlap";

const highlights = [
  {
    title: "Radio messages, exact to the byte",
    body: "I designed and built the CRG Message Generator in Python. It simulates the onboard and wayside equipment (CC, ZC, WRG) and generates byte-exact radio messages, UDP framing and CRC-32/MPEG-2 included, from YAML/XML configuration: more than 200 message types and 300 scenarios, with conformance checked by a pytest suite. Delivered for CRG 4.2. Without it, the software cannot be tested.",
  },
  {
    title: "Scenarios people write on their own",
    body: "A Robot Framework library with business-level keywords. Nine validators use it, five developers and four trained non-developers, to write and run the scenarios they need without waiting on anyone.",
  },
  {
    title: "A test bench, from nothing",
    body: "Built with the team, starting with no bench, no tool and no product: GitLab CI/CD and runners, the CRG virtualised with QEMU/KVM inside Linux network namespaces, and automatic archiving of every report and log. I own the test bench.",
  },
  {
    title: "Where it runs",
    body: "Safety-critical software under CENELEC EN 50128. Scrum, in English, with the radio, embedded software and test teams in France and India.",
  },
];

export default function Siemens() {
  return (
    <section id="siemens" className="border-t border-line-2 py-24 md:py-36">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-20">
        <div className="max-w-[46rem]">
          <p className="text-ink-2">Since September 2025, apprenticeship until August 2027</p>
          <h2 className="mt-4 font-display text-[clamp(44px,6.5vw,92px)] leading-[0.92] font-semibold tracking-[-0.03em] [font-variation-settings:'wdth'_88]">
            Siemens Mobility
          </h2>
          <p className="mt-3 text-lg text-ink-2">Software engineer. Châtillon, France.</p>
          <p className="mt-10 max-w-[38rem] text-xl leading-relaxed text-pretty">
            New York City Transit is moving its Crosstown line to CBTC signalling over 5G radio. I work on the
            safety-critical radio software, and I build the simulator it is tested against.
          </p>
        </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:gap-x-8">
            <SplitFlap value="300+" label="test scenarios" />
            <SplitFlap value="200+" label="message types" />
            <SplitFlap value="9" label="validators use it" />
            <SplitFlap value="4.2" label="CRG release delivered" />
          </div>
        </div>

        <div className="mt-16 max-w-5xl">
          <RadioLink />
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
          Python, pytest, Robot Framework, GitLab CI/CD, QEMU/KVM, Linux network namespaces, CENELEC EN 50128.
        </p>
      </div>
    </section>
  );
}
