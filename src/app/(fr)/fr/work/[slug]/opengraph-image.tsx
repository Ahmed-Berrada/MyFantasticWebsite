import { getCase, getCases } from "@/src/content";
import { OG_SIZE, ogKicker, renderOgCard } from "@/src/lib/og";

export const alt = "Ahmed Berrada, étude de cas";
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return getCases("fr").map((c) => ({ slug: c.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return renderOgCard("fr", ogKicker("fr").work, getCase("fr", slug)?.title ?? "Ahmed Berrada");
}
