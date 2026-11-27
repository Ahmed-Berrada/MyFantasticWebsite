import { en, type Dict } from "./en";
import { fr } from "./fr";
import { casesEn } from "./work.en";
import { casesFr } from "./work.fr";
import { notesEn } from "./writing.en";
import { notesFr } from "./writing.fr";
import type { CaseStudy, Lang, Note } from "./types";

/** A no-break space between a number and its unit, so "996 ns" or "90 %" never splits across two lines. */
export function unitTypo(s: string): string {
  return s.replace(/(\d) (ns|µs|ms|s|%|M|Mo|MB|GB|millions?|ops\/s)(?=$|[\s.,;:!?)])/g, "$1\u00a0$2");
}

/**
 * French typography: a no-break space before ? ! : ; keeps the mark on the line of its word, and a narrow
 * no-break space groups thousands ("26 749 413"), on top of the unit rule.
 */
export function frTypo(s: string): string {
  return unitTypo(s)
    .replace(/ ([?!:;])/g, "\u00a0$1")
    .replace(/(\d) (?=\d{3}(?!\d))/g, "$1\u202f");
}

const SKIP_KEYS = new Set(["href", "switchLang", "slug", "id", "updated", "date"]);

function mapStrings<T>(value: T, fn: (s: string) => string, key?: string): T {
  if (typeof value === "string") return (key && SKIP_KEYS.has(key) ? value : fn(value)) as T;
  if (Array.isArray(value)) return value.map((v) => mapStrings(v, fn)) as T;
  if (value && typeof value === "object") {
    const o = value as Record<string, unknown>;
    if (o.t === "code") return value; // never touch code
    return Object.fromEntries(Object.entries(o).map(([k, v]) => [k, mapStrings(v, fn, k)])) as T;
  }
  return value;
}

const dicts: Record<Lang, Dict> = { en: mapStrings(en, unitTypo), fr: mapStrings(fr, frTypo) };
const cases: Record<Lang, CaseStudy[]> = { en: mapStrings(casesEn, unitTypo), fr: mapStrings(casesFr, frTypo) };
const notes: Record<Lang, Note[]> = { en: mapStrings(notesEn, unitTypo), fr: mapStrings(notesFr, frTypo) };

export const getDict = (lang: Lang): Dict => dicts[lang];
export const getCases = (lang: Lang): CaseStudy[] => cases[lang];
export const getCase = (lang: Lang, slug: string): CaseStudy | undefined => cases[lang].find((c) => c.slug === slug);
export const getNotes = (lang: Lang): Note[] => [...notes[lang]].sort((a, b) => b.date.localeCompare(a.date));
export const getNote = (lang: Lang, slug: string): Note | undefined => notes[lang].find((n) => n.slug === slug);

export type { Dict };
