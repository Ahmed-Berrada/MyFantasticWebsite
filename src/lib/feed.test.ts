import { describe, expect, it } from "vitest";
import { getNotes } from "../content";
import { notesFeed } from "./feed";

describe("notes feed", () => {
  it.each(["en", "fr"] as const)("lists every note once, with an absolute link (%s)", (lang) => {
    const xml = notesFeed(lang);
    for (const n of getNotes(lang)) {
      const url = `https://www.ahmedberrada.com${lang === "fr" ? "/fr" : ""}/writing/${n.slug}`;
      expect(xml.split(`<link>${url}</link>`).length - 1).toBe(1);
    }
    expect(xml.match(/<item>/g)?.length).toBe(getNotes(lang).length);
  });

  it("escapes markup in text", () => {
    const xml = notesFeed("fr");
    const text = [...xml.matchAll(/<(title|description)>([^<]*)<\/\1>/g)].map((m) => m[2]).join("");
    expect(text).not.toMatch(/&(?!amp;|lt;|gt;|quot;)/);
  });
});
