import { getDict, getNotes } from "../content";
import type { Lang } from "../content/types";
import { SITE_URL, localPath } from "./seo";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const feedPath = (lang: Lang) => localPath(lang, "/writing/feed.xml");

/** RSS 2.0 feed of the notes in one language, newest first. */
export function notesFeed(lang: Lang): string {
  const t = getDict(lang);
  const notes = [...getNotes(lang)].sort((a, b) => b.date.localeCompare(a.date));
  const items = notes
    .map((n) => {
      const url = SITE_URL + localPath(lang, `/writing/${n.slug}`);
      return `    <item>
      <title>${esc(n.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${esc(n.summary)}</description>
      <pubDate>${new Date(n.date).toUTCString()}</pubDate>
    </item>`;
    })
    .join("\n");
  const latest = notes[0] ? new Date(notes[0].date).toUTCString() : new Date(0).toUTCString();
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(t.meta.writingTitle)}</title>
    <link>${SITE_URL + localPath(lang, "/writing")}</link>
    <atom:link href="${SITE_URL + feedPath(lang)}" rel="self" type="application/rss+xml" />
    <description>${esc(t.meta.writingDescription)}</description>
    <language>${lang}</language>
    <lastBuildDate>${latest}</lastBuildDate>
${items}
  </channel>
</rss>
`;
}

export function feedResponse(lang: Lang): Response {
  return new Response(notesFeed(lang), { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
