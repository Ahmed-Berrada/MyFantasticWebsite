import FlowDiagram from "./FlowDiagram";
import type { Dict } from "@/src/content";

type T = Dict["figures"]["bench"];

const H = 104;
const Y = 34;

/** Simplified test bench: scenarios drive the generator, which feeds the software under test; CI archives the results. */
export default function BenchFlow({ t }: { t: T }) {
  const nodes = [
    { x: 4, y: Y, w: 150, h: H, title: t.scenarios, sub: t.scenariosNote },
    { x: 200, y: Y, w: 150, h: H, title: t.generator, sub: t.generatorNote },
    { x: 396, y: Y, w: 150, h: H, title: t.sut, sub: t.sutNote, core: true },
    { x: 592, y: Y, w: 150, h: H, title: t.ci, sub: t.ciNote },
  ];
  const mid = Y + H / 2;
  const edges = [
    { id: "e1", d: `M154,${mid} L198,${mid}` },
    { id: "e2", d: `M350,${mid} L394,${mid}`, label: { text: t.messages, x: 372, y: 22 } },
    { id: "e3", d: `M546,${mid} L590,${mid}`, label: { text: t.results, x: 568, y: 22 } },
  ];
  const dots = [
    { edge: "e1", begin: 0, dur: 0.9, accent: true },
    { edge: "e2", begin: 0.6, dur: 0.9 },
    { edge: "e3", begin: 1.2, dur: 0.9 },
  ];
  return (
    <FlowDiagram
      uid="bench"
      aria={t.aria}
      width={752}
      height={Y + H + 14}
      nodes={nodes}
      edges={edges}
      dots={dots}
      steps={nodes.map((n) => ({ title: n.title, sub: n.sub, core: n.core }))}
      caption={t.simplified}
    />
  );
}
