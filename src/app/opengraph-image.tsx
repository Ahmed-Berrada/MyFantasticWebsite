import { ImageResponse } from "next/og";

export const alt = "Ahmed Berrada · Trading systems, engineered like safety-critical software";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const asks = [["100.12", 62], ["100.11", 44], ["100.10", 28]] as const;
const bids = [["100.08", 36], ["100.07", 58], ["100.06", 80]] as const;

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#f6f5f1", padding: 72, fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 26, color: "#0b0d12" }}>
            <div style={{ width: 44, height: 44, background: "#0b0d12", color: "#f6f5f1", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
              AB
            </div>
            Ahmed Berrada
          </div>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 64, fontWeight: 600, lineHeight: 1.05, color: "#0b0d12", letterSpacing: -2 }}>
            <span>Trading systems, engineered</span>
            <span>
              like&nbsp;<span style={{ color: "#1a4dff" }}>safety-critical</span>&nbsp;software.
            </span>
          </div>
          <div style={{ display: "flex", gap: 40, fontSize: 26, color: "#353b47" }}>
            <span>163 ns median match</span>
            <span>3.46M orders/s</span>
            <span>641× GPU speedup</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", width: 250, gap: 8, fontSize: 22, fontFamily: "monospace" }}>
          {asks.map(([p, w]) => (
            <div key={p} style={{ display: "flex", justifyContent: "space-between", color: "#c8371f", background: `linear-gradient(90deg, transparent ${100 - w}%, #c8371f1a ${100 - w}%)`, padding: "4px 10px" }}>
              <span>{p}</span>
            </div>
          ))}
          <div style={{ height: 2, background: "#cbc7bc", margin: "6px 0" }} />
          {bids.map(([p, w]) => (
            <div key={p} style={{ display: "flex", justifyContent: "space-between", color: "#0a7d4f", background: `linear-gradient(90deg, transparent ${100 - w}%, #0a7d4f1c ${100 - w}%)`, padding: "4px 10px" }}>
              <span>{p}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
