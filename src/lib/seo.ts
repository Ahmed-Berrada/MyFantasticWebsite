import type { Metadata } from "next";
import { getDict } from "../content";
import type { Lang } from "@/src/content/types";

/** One canonical host. The apex domain redirects here (see next.config.ts). */
export const SITE_URL = "https://www.ahmedberrada.com";

export const LINKS = {
  github: "https://github.com/Ahmed-Berrada",
  linkedin: "https://www.linkedin.com/in/ahmed-berrada-293015257/",
  email: "ahmed.berrada@proton.me",
} as const;

/** Path of `path` ("/" or "/work/x") in `lang`. English lives at the root, French under /fr. */
export function localPath(lang: Lang, path: string): string {
  if (lang === "en") return path;
  return path === "/" ? "/fr" : `/fr${path}`;
}

export function alternates(lang: Lang, path: string, available: Lang[] = ["en", "fr"]): Metadata["alternates"] {
  const languages: Record<string, string> = {};
  for (const l of available) languages[l] = localPath(l, path);
  languages["x-default"] = localPath("en", path);
  // Every page points feed readers at the notes in its own language.
  return { canonical: localPath(lang, path), languages, types: { "application/rss+xml": localPath(lang, "/writing/feed.xml") } };
}

interface PageMeta {
  lang: Lang;
  path: string;
  title: string;
  description: string;
  type?: "website" | "article";
  published?: string;
  available?: Lang[];
}

/** Search results show about 60 characters: add the name only when the page title leaves room for it. */
export function titleWithName(title: string): string {
  const full = `${title}, Ahmed Berrada`;
  return full.length <= 60 ? full : title;
}

export function pageMetadata({ lang, path, title, description, type = "website", published, available }: PageMeta): Metadata {
  const url = localPath(lang, path);
  return {
    title,
    description,
    alternates: alternates(lang, path, available),
    openGraph: {
      title,
      description,
      url,
      siteName: "Ahmed Berrada",
      locale: lang === "fr" ? "fr_FR" : "en_GB",
      type,
      ...(published ? { publishedTime: published } : {}),
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

/** The author, as referenced from articles and case studies. */
export function authorRef(lang: Lang) {
  return { "@type": "Person", name: "Ahmed Berrada", url: SITE_URL + localPath(lang, "/"), sameAs: [LINKS.github, LINKS.linkedin] };
}

/** schema.org BreadcrumbList from the home page down to `trail`'s last item (name, path without the language prefix). */
export function breadcrumbJsonLd(lang: Lang, trail: [name: string, path: string][]) {
  const items: [string, string][] = [["Ahmed Berrada", "/"], ...trail];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map(([name, path], i) => ({ "@type": "ListItem", position: i + 1, name, item: SITE_URL + localPath(lang, path) })),
  };
}

/** schema.org Person, so search engines can tie the name to the school, employer and profiles. */
export function personJsonLd(lang: Lang) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Ahmed Berrada",
    url: SITE_URL + localPath(lang, "/"),
    jobTitle: getDict(lang).meta.jobTitle,
    description: getDict(lang).meta.person,
    email: `mailto:${LINKS.email}`,
    alumniOf: { "@type": "CollegeOrUniversity", name: "ESIEA" },
    worksFor: { "@type": "Organization", name: "Siemens Mobility" },
    address: { "@type": "PostalAddress", addressLocality: "Paris", addressCountry: "FR" },
    sameAs: [LINKS.github, LINKS.linkedin],
    knowsAbout: ["C++", "Java", "Python", "Artificial intelligence", "Low-latency systems", "Matching engines", "Test automation", "Safety-critical software"],
  };
}
