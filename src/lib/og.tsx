import { ImageResponse } from "next/og";
import { TrainGraph } from "@/src/lib/traingraph";
import type { Lang } from "@/src/content/types";

export const OG_SIZE = { width: 1200, height: 630 };

const TEXT: Record<Lang, { who: string; thesis: [string, string]; line: string; alt: string }> = {
  en: {
    who: "Ahmed Berrada, software engineer",
    thesis: ["Right first.", "Then fast."],
    line: "Safety-critical rail software at Siemens Mobility. Engines measured in nanoseconds.",
    alt: "Ahmed Berrada, software engineer. Right first. Then fast.",
  },
  fr: {
    who: "Ahmed Berrada, ingénieur logiciel",
    thesis: ["D'abord juste.", "Ensuite rapide."],
    line: "Logiciel ferroviaire critique chez Siemens Mobility. Des moteurs mesurés à la nanoseconde.",
    alt: "Ahmed Berrada, ingénieur logiciel. D'abord juste. Ensuite rapide.",
  },
};

export const ogAlt = (lang: Lang) => TEXT[lang].alt;

/** Train-graph motif drawn from the same model as the live hero, kept to the right of the text. */
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

export function renderOg(lang: Lang) {
  const t = TEXT[lang];
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
          <div style={{ fontSize: 28, color: "#3b4048" }}>{t.who}</div>
          {/* Each line of the thesis stays on one line: the French one is longer, so it is set smaller. */}
          <div style={{ display: "flex", flexDirection: "column", fontSize: lang === "fr" ? 84 : 128, fontWeight: 700, lineHeight: 0.95, color: "#121417", letterSpacing: lang === "fr" ? -3 : -5 }}>
            <span style={{ whiteSpace: "nowrap" }}>{t.thesis[0]}</span>
            <span style={{ whiteSpace: "nowrap" }}>{t.thesis[1]}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 26, color: "#3b4048" }}>
            <div style={{ width: 18, height: 18, background: "#ffc400" }} />
            {t.line}
          </div>
        </div>
      </div>
    ),
    OG_SIZE,
  );
}

const KICKER: Record<Lang, { work: string; note: string; notes: string }> = {
  en: { work: "Case study", note: "Note", notes: "Writing" },
  fr: { work: "Étude de cas", note: "Note", notes: "Articles" },
};

export const ogKicker = (lang: Lang) => KICKER[lang];

/** Share image for a page: its kind, its title, and the train motif. */
export function renderOgCard(lang: Lang, kicker: string, title: string) {
  const font = title.length > 62 ? 54 : title.length > 42 ? 62 : 72;
  const paths = trainPaths();
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#eceef0", position: "relative" }}>
        <svg width="1200" height="630" style={{ position: "absolute", left: 0, top: 0 }}>
          {paths.map((d, i) => (
            <path key={i} d={d} fill="none" stroke="#121417" strokeOpacity={i === 7 ? 1 : 0.28} strokeWidth={i === 7 ? 2.5 : 1.2} />
          ))}
        </svg>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, width: 720 }}>
          <div style={{ fontSize: 28, color: "#3b4048" }}>{kicker}</div>
          <div style={{ display: "flex", fontSize: font, fontWeight: 700, lineHeight: 1.02, color: "#121417", letterSpacing: -2 }}>{title}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 26, color: "#3b4048" }}>
            <div style={{ width: 18, height: 18, background: "#ffc400" }} />
            {TEXT[lang].who}
          </div>
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
