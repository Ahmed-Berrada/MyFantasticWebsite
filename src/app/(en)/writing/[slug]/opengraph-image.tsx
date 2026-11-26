import { getNote, getNotes } from "@/src/content";
import { OG_SIZE, ogKicker, renderOgCard } from "@/src/lib/og";

export const alt = "Ahmed Berrada, note";
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return getNotes("en").map((n) => ({ slug: n.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return renderOgCard("en", ogKicker("en").note, getNote("en", slug)?.title ?? "Ahmed Berrada");
}
