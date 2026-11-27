import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CasePage from "@/components/CasePage";
import { getCase, getCases } from "@/src/content";
import { pageMetadata, titleWithName } from "@/src/lib/seo";

type Params = { slug: string };

// Every slug is known at build time: anything else is a 404 without a runtime render.
export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return getCases("fr").map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const c = getCase("fr", slug);
  if (!c) return {};
  return pageMetadata({ lang: "fr", path: `/work/${slug}`, title: titleWithName(c.title), description: c.plain });
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  if (!getCase("fr", slug)) notFound();
  return <CasePage lang="fr" slug={slug} />;
}
