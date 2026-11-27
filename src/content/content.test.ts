import { describe, expect, it } from "vitest";
import { en } from "./en";
import { fr } from "./fr";
import { frTypo, getCases, getDict, getNotes, unitTypo } from "./index";
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

  it("keeps numbers with their units and groups French thousands", () => {
    expect(unitTypo("median 996 ns, 90% and 1.6 ms.")).toBe("median 996\u00a0ns, 90% and 1.6\u00a0ms.");
    expect(unitTypo("in 3 steps")).toBe("in 3 steps");
    expect(unitTypo("P99 460 ns")).toBe("P99\u00a0460\u00a0ns");
    expect(frTypo("opération 26 749 413 : 5 M d'opérations, 25 %")).toBe("opération 26\u202f749\u202f413\u00a0: 5\u00a0M d'opérations, 25\u00a0%");
    for (const lang of ["en", "fr"] as const) {
      for (const [path, s] of strings(getDict(lang))) expect(s, `${lang}${path}`).not.toMatch(/\d (ns|µs|ms)\b/);
    }
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

  const pages = () =>
    new Set(["/", "/writing", ...getCases("en").map((c) => `/work/${c.slug}`), ...getNotes("en").map((n) => `/writing/${n.slug}`)]);

  it("only link to pages that exist", () => {
    const valid = pages();
    for (const lang of ["en", "fr"] as const) {
      const all = [...getCases(lang).flatMap((c) => c.sections.flatMap((s) => s.blocks)), ...getNotes(lang).flatMap((n) => n.blocks)];
      for (const href of all.flatMap(links)) expect(valid.has(href), `${lang} ${href}`).toBe(true);
      // Table cells are rich text too.
      const cells = all.flatMap((b) => (b.t === "table" ? b.rows.flat() : []));
      for (const href of cells.flatMap((t) => [...t.matchAll(/\]\((\/[^)]*)\)/g)].map((m) => m[1]))) expect(valid.has(href), `${lang} ${href}`).toBe(true);
      // Every internal href in the dictionary (evidence strip and the like).
      for (const [path, href] of strings(getDict(lang))) if (path.endsWith(".href") && href.startsWith("/")) expect(valid.has(href), `${lang}${path}`).toBe(true);
    }
  });

  it("are linked from the components only by paths that exist", async () => {
    // Components link to a few pages by literal path; read their sources so a renamed slug fails here, not in production.
    const { readdirSync, readFileSync } = await import("node:fs");
    const dir = new URL("../../components/", import.meta.url);
    const valid = pages();
    for (const file of readdirSync(dir).filter((f) => f.endsWith(".tsx"))) {
      const src = readFileSync(new URL(file, dir), "utf8");
      for (const m of src.matchAll(/"(\/(?:work|writing)\/[a-z0-9-]+)"/g)) expect(valid.has(m[1]), `${file} ${m[1]}`).toBe(true);
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
