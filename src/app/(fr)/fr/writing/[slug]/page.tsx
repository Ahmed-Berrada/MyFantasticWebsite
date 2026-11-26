import type { Metadata } from "next";
import { notFound } from "next/navigation";
import NotePage from "@/components/NotePage";
import { getNote, getNotes } from "@/src/content";
import { pageMetadata } from "@/src/lib/seo";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return getNotes("fr").map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const n = getNote("fr", slug);
  if (!n) return {};
  return pageMetadata({ lang: "fr", path: `/writing/${slug}`, title: `${n.title}, Ahmed Berrada`, description: n.summary, type: "article", published: n.date });
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  if (!getNote("fr", slug)) notFound();
  return <NotePage lang="fr" slug={slug} />;
}
