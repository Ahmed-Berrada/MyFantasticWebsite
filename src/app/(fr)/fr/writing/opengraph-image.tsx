import { getDict } from "@/src/content";
import { OG_SIZE, ogKicker, renderOgCard } from "@/src/lib/og";

export const alt = "Ahmed Berrada, articles";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderOgCard("fr", ogKicker("fr").notes, getDict("fr").writing.lede);
}
