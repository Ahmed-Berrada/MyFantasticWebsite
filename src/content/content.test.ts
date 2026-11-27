import { describe, expect, it } from "vitest";
import { en } from "./en";
import { fr } from "./fr";
import { getCases, getDict, getNotes } from "./index";
import type { Block, CaseStudy, Note } from "./types";

type Json = unknown;

/** Every string in `v` with its path, so EN and FR can be compared position by position. */
function strings(v: Json, path = ""): [string, string][] {
  if (typeof v === "string") return [[path, v]];
  if (Array.isArray(v)) return v.flatMap((x, i) => strings(x, `${path}[${i}]`));
  if (v && typeof v === "object") return Object.entries(v).flatMap(([k, x]) => strings(x, `${path}.${k}`));
  return [];
}

const placeholders = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(",");

function blockShape(b: Block): string {
  switch (b.t) {
    case "list":
      return `list:${b.items.length}`;
    case "table":
      return `table:${b.head.length}x${b.rows.length}:${b.note ? "n" : ""}`;
    case "figure":
      return `figure:${b.id}`;
    default:
      return b.t;
  }
}

const links = (b: Block): string[] => {
  const texts = b.t === "p" || b.t === "h" ? [b.text] : b.t === "list" ? b.items : [];
  return texts.flatMap((t) => [...t.matchAll(/\]\((\/[^)]*)\)/g)].map((m) => m[1]));
};

describe("dictionary", () => {
  it("has the same strings, at the same paths, with the same placeholders, in both languages", () => {
    const a = strings(en);
    const b = strings(fr);
    expect(b.map(([p]) => p)).toEqual(a.map(([p]) => p));
    a.forEach(([path, text], i) => expect(placeholders(b[i][1]), path).toBe(placeholders(text)));
  });

  it("never leaves an empty string", () => {
    for (const lang of ["en", "fr"] as const) for (const [path, s] of strings(getDict(lang))) expect(s.length, `${lang}${path}`).toBeGreaterThan(0);
  });

  it("puts a no-break space before French double punctuation", () => {
    for (const [path, s] of strings(getDict("fr"))) expect(s, path).not.toMatch(/ [?!:;]/);
  });
});

describe("case studies and notes", () => {
  const caseShape = (c: CaseStudy) => ({
    slug: c.slug,
    repos: c.repos.length,
    sections: c.sections.map((s) => [s.id, s.blocks.map(blockShape)]),
  });
  const noteShape = (n: Note) => ({ slug: n.slug, date: n.date, blocks: n.blocks.map(blockShape) });

  it("have the same structure in both languages", () => {
    expect(getCases("fr").map(caseShape)).toEqual(getCases("en").map(caseShape));
    expect(getNotes("fr").map(noteShape)).toEqual(getNotes("en").map(noteShape));
  });

  it("use all six template sections in order", () => {
    for (const c of getCases("en")) expect(c.sections.map((s) => s.id)).toEqual(["problem", "constraints", "approach", "result", "reproduce", "next"]);
  });

  it("only link to pages that exist", () => {
    const valid = new Set(["/", ...getCases("en").map((c) => `/work/${c.slug}`), ...getNotes("en").map((n) => `/writing/${n.slug}`)]);
    for (const lang of ["en", "fr"] as const) {
      const all = [...getCases(lang).flatMap((c) => c.sections.flatMap((s) => s.blocks)), ...getNotes(lang).flatMap((n) => n.blocks)];
      for (const href of all.flatMap(links)) expect(valid.has(href), `${lang} ${href}`).toBe(true);
    }
  });

  it("keep code blocks identical across languages except for comments", () => {
    const code = (lang: "en" | "fr") =>
      getCases(lang).flatMap((c) => c.sections.flatMap((s) => s.blocks)).filter((b): b is Extract<Block, { t: "code" }> => b.t === "code").map((b) => b.text.replace(/#.*$/gm, "").trim());
    expect(code("fr")).toEqual(code("en"));
  });
});

describe("search snippets", () => {
  // Google shows about 60 characters of a title and 155 to 160 of a description; longer ones are cut mid-sentence.
  const DESC_MAX = 160;
  const TITLE_MAX = 70;

  it.each(["en", "fr"] as const)("fit in a search result (%s)", (lang) => {
    const t = getDict(lang);
    const snippets: [string, string, number][] = [
      ["home title", t.meta.homeTitle, 60],
      ["home description", t.meta.homeDescription, DESC_MAX],
      ["writing title", t.meta.writingTitle, 60],
      ["writing description", t.meta.writingDescription, DESC_MAX],
      ...getCases(lang).flatMap((c): [string, string, number][] => [
        [`${c.slug} title`, c.title, TITLE_MAX],
        [`${c.slug} description`, c.plain, DESC_MAX],
      ]),
      ...getNotes(lang).flatMap((n): [string, string, number][] => [
        [`${n.slug} title`, n.title, TITLE_MAX],
        [`${n.slug} description`, n.summary, DESC_MAX],
      ]),
    ];
    const tooLong = snippets.filter(([, s, max]) => s.length > max).map(([name, s, max]) => `${name}: ${s.length} > ${max}`);
    expect(tooLong).toEqual([]);
  });
});
