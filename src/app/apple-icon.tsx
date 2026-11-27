import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Home-screen icon for iOS: same monogram as the favicon, on a full square (iOS rounds the corners itself). */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0b0d12", color: "#f6f5f1", fontSize: 76, fontWeight: 600, fontFamily: "monospace" }}>
        AB
      </div>
    ),
    size,
  );
}
