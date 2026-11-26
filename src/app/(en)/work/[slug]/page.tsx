import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CasePage from "@/components/CasePage";
import { getCase, getCases } from "@/src/content";
import { pageMetadata } from "@/src/lib/seo";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return getCases("en").map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const c = getCase("en", slug);
  if (!c) return {};
  return pageMetadata({ lang: "en", path: `/work/${slug}`, title: `${c.title}, Ahmed Berrada`, description: c.plain });
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  if (!getCase("en", slug)) notFound();
  return <CasePage lang="en" slug={slug} />;
}
