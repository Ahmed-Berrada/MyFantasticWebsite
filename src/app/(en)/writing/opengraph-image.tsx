import { getDict } from "@/src/content";
import { OG_SIZE, ogKicker, renderOgCard } from "@/src/lib/og";

export const alt = "Ahmed Berrada, writing";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderOgCard("en", ogKicker("en").notes, getDict("en").writing.lede);
}
