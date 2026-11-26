import { OG_SIZE, ogAlt, renderOg } from "@/src/lib/og";

export const alt = ogAlt("fr");
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderOg("fr");
}
