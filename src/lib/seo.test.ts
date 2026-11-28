import { describe, expect, it } from "vitest";
import { alternates, breadcrumbJsonLd, localPath, SITE_URL, titleWithName } from "./seo";

describe("seo helpers", () => {
  it("puts French pages under /fr and English pages at the root", () => {
    expect(localPath("en", "/")).toBe("/");
    expect(localPath("fr", "/")).toBe("/fr");
    expect(localPath("fr", "/work/order-book")).toBe("/fr/work/order-book");
  });

  it("gives every page a canonical, both languages, x-default in English, and its own feed", () => {
    const a = alternates("fr", "/writing");
    expect(a?.canonical).toBe("/fr/writing");
    expect(a?.languages).toEqual({ en: "/writing", fr: "/fr/writing", "x-default": "/writing" });
    expect(a?.types).toEqual({ "application/rss+xml": "/fr/writing/feed.xml" });
  });

  it("adds the name to a title only when the whole fits in 60 characters", () => {
    expect(titleWithName("Test tooling at Siemens")).toBe("Test tooling at Siemens, Ahmed Berrada");
    const long = "Order Book: a matching engine, from C++ prototype to venue core";
    expect(titleWithName(long)).toBe(long);
  });

  it("builds breadcrumbs from the home page, with absolute URLs in the page's language", () => {
    const b = breadcrumbJsonLd("fr", [["Articles", "/writing"]]);
    expect(b.itemListElement.map((i) => [i.position, i.item])).toEqual([
      [1, `${SITE_URL}/fr`],
      [2, `${SITE_URL}/fr/writing`],
    ]);
  });
});
