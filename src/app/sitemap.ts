import type { MetadataRoute } from "next";
import { getCases, getNotes } from "@/src/content";
import { SITE_URL, localPath } from "@/src/lib/seo";

interface Entry {
  path: string;
  updated: string;
  priority: number;
}

/** Every page in both languages, each pointing at its translation. Dates come from the content, not the build. */
export default function sitemap(): MetadataRoute.Sitemap {
  const cases = getCases("en");
  const notes = getNotes("en");
  const latest = [...cases.map((c) => c.updated), ...notes.map((n) => n.date)].sort().at(-1)!;
  const entries: Entry[] = [
    { path: "/", updated: latest, priority: 1 },
    ...cases.map((c) => ({ path: `/work/${c.slug}`, updated: c.updated, priority: 0.8 })),
    { path: "/writing", updated: latest, priority: 0.6 },
    ...notes.map((n) => ({ path: `/writing/${n.slug}`, updated: n.date, priority: 0.7 })),
  ];
  const url = (lang: "en" | "fr", path: string) => SITE_URL + (lang === "en" && path === "/" ? "" : localPath(lang, path));
  return entries.flatMap((e) =>
    (["en", "fr"] as const).map((lang) => ({
      url: url(lang, e.path),
      lastModified: e.updated,
      priority: e.priority,
      alternates: { languages: { en: url("en", e.path), fr: url("fr", e.path) } },
    })),
  );
}
