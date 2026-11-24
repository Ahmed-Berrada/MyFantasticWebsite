import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0b0d12", color: "#f6f5f1", borderRadius: 12, fontSize: 28, fontWeight: 600, fontFamily: "monospace" }}>
        AB
      </div>
    ),
    size,
  );
}
