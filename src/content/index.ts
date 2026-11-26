import { en, type Dict } from "./en";
import { fr } from "./fr";
import { casesEn } from "./work.en";
import { casesFr } from "./work.fr";
import { notesEn } from "./writing.en";
import { notesFr } from "./writing.fr";
import type { CaseStudy, Lang, Note } from "./types";

/** French typography: a no-break space before ? ! : ; keeps the mark on the line of its word. */
export function frTypo(s: string): string {
  return s.replace(/ ([?!:;])/g, " $1");
}

const SKIP_KEYS = new Set(["href", "htmlLang", "switchLang", "slug", "id", "updated", "date"]);

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

const dicts: Record<Lang, Dict> = { en, fr: mapStrings(fr, frTypo) };
const cases: Record<Lang, CaseStudy[]> = { en: casesEn, fr: mapStrings(casesFr, frTypo) };
const notes: Record<Lang, Note[]> = { en: notesEn, fr: mapStrings(notesFr, frTypo) };

export const getDict = (lang: Lang): Dict => dicts[lang];
export const getCases = (lang: Lang): CaseStudy[] => cases[lang];
export const getCase = (lang: Lang, slug: string): CaseStudy | undefined => cases[lang].find((c) => c.slug === slug);
export const getNotes = (lang: Lang): Note[] => [...notes[lang]].sort((a, b) => b.date.localeCompare(a.date));
export const getNote = (lang: Lang, slug: string): Note | undefined => notes[lang].find((n) => n.slug === slug);

export type { Dict };
