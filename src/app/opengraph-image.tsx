import { ImageResponse } from "next/og";
import { TrainGraph } from "@/src/lib/traingraph";

export const alt = "Ahmed Berrada, software engineer. Right first. Then fast.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Train-graph motif drawn from the same model as the live hero. */
function trainPaths(): string[] {
  const g = new TrainGraph(41);
  g.schedule(0);
  const t0 = -1100;
  const t1 = 0;
  const x = (t: number) => 680 + ((t - t0) / (t1 - t0)) * 470;
  const y = (v: number) => 70 + v * 490;
  return g.trains
    .filter((tr) => tr.path[tr.path.length - 1].t > t0 && tr.path[0].t < t1)
    .map((tr) =>
      tr.path
        .map((w) => ({ x: Math.min(1150, Math.max(680, x(w.t))), y: y(w.y) }))
        .map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
        .join(" "),
    );
}

export default function OpengraphImage() {
  const paths = trainPaths();
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#eceef0", position: "relative" }}>
        <svg width="1200" height="630" style={{ position: "absolute", left: 0, top: 0 }}>
          {paths.map((d, i) => (
            <path key={i} d={d} fill="none" stroke="#121417" strokeOpacity={i === 7 ? 1 : 0.3} strokeWidth={i === 7 ? 2.5 : 1.2} />
          ))}
        </svg>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, width: 720 }}>
          <div style={{ fontSize: 28, color: "#3b4048" }}>Ahmed Berrada, software engineer</div>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 128, fontWeight: 700, lineHeight: 0.9, color: "#121417", letterSpacing: -5 }}>
            <span>Right first.</span>
            <span>Then fast.</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 26, color: "#3b4048" }}>
            <div style={{ width: 18, height: 18, background: "#ffc400" }} />
            Safety-critical rail software at Siemens Mobility. Engines measured in nanoseconds.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
