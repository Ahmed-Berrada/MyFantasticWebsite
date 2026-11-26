import type { Metadata } from "next";
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
  return { canonical: localPath(lang, path), languages };
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

/** schema.org Person, so search engines can tie the name to the school, employer and profiles. */
export function personJsonLd(lang: Lang) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Ahmed Berrada",
    url: SITE_URL + localPath(lang, "/"),
    jobTitle: lang === "fr" ? "Ingénieur logiciel" : "Software engineer",
    description:
      lang === "fr"
        ? "Ingénieur logiciel, systèmes critiques et performance. Alternant chez Siemens Mobility, élève-ingénieur à l'ESIEA (2027)."
        : "Software engineer, critical systems and performance. Apprentice at Siemens Mobility, ESIEA engineering student (2027).",
    email: `mailto:${LINKS.email}`,
    alumniOf: { "@type": "CollegeOrUniversity", name: "ESIEA" },
    worksFor: { "@type": "Organization", name: "Siemens Mobility" },
    address: { "@type": "PostalAddress", addressLocality: "Paris", addressCountry: "FR" },
    sameAs: [LINKS.github, LINKS.linkedin],
    knowsAbout: ["C++", "Java", "Python", "Low-latency systems", "Matching engines", "Test automation", "Safety-critical software"],
  };
}
