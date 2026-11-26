import { getNote, getNotes } from "@/src/content";
import { OG_SIZE, ogKicker, renderOgCard } from "@/src/lib/og";

export const alt = "Ahmed Berrada, note";
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return getNotes("fr").map((n) => ({ slug: n.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return renderOgCard("fr", ogKicker("fr").note, getNote("fr", slug)?.title ?? "Ahmed Berrada");
}
