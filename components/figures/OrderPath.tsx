import FlowDiagram from "./FlowDiagram";
import type { Dict } from "@/src/content";

type T = Dict["figures"]["order"];

const H = 96;
const Y = 30;

/** FIX and REST in, a router, the journal, the single-writer book, events out; the journal can rebuild the book. */
export default function OrderPath({ t }: { t: T }) {
  const nodes = [
    { x: 4, y: Y, w: 128, h: H, title: t.gateways, sub: t.gatewaysNote },
    { x: 158, y: Y, w: 128, h: H, title: t.router, sub: t.routerNote },
    { x: 312, y: Y, w: 128, h: H, title: t.journal, sub: t.journalNote },
    { x: 466, y: Y, w: 128, h: H, title: t.book, sub: t.bookNote, core: true },
    { x: 620, y: Y, w: 128, h: H, title: t.events, sub: t.eventsNote },
  ];
  const mid = Y + H / 2;
  const edges = [
    { id: "e1", d: `M132,${mid} L156,${mid}` },
    { id: "e2", d: `M286,${mid} L310,${mid}` },
    { id: "e3", d: `M440,${mid} L464,${mid}` },
    { id: "e4", d: `M594,${mid} L618,${mid}` },
    { id: "replay", d: `M376,${Y + H} C376,${Y + H + 62} 530,${Y + H + 62} 530,${Y + H + 2}`, dashed: true, label: { text: t.replay, x: 453, y: Y + H + 62 } },
  ];
  const dots = [
    { edge: "e1", begin: 0, dur: 0.7, accent: true },
    { edge: "e2", begin: 0.5, dur: 0.7 },
    { edge: "e3", begin: 1, dur: 0.7 },
    { edge: "e4", begin: 1.5, dur: 0.7 },
    { edge: "replay", begin: 0.4, dur: 2.2 },
  ];
  return (
    <FlowDiagram
      uid="order"
      aria={t.aria}
      width={752}
      height={Y + H + 76}
      nodes={nodes}
      edges={edges}
      dots={dots}
      steps={nodes.map((n) => ({ title: n.title, sub: n.sub, core: n.core }))}
    />
  );
}
