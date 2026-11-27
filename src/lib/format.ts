import type { Lang } from "@/src/content/types";

const locale = (lang: Lang) => (lang === "fr" ? "fr-FR" : "en-US");

/** Number formatters are costly to build and the demos format many numbers per frame: build each one once. */
const formatters = new Map<string, Intl.NumberFormat>();
function formatter(lang: Lang, min: number, max: number): Intl.NumberFormat {
  const key = `${lang}:${min}:${max}`;
  let f = formatters.get(key);
  if (!f) {
    f = new Intl.NumberFormat(locale(lang), { minimumFractionDigits: min, maximumFractionDigits: max });
    formatters.set(key, f);
  }
  return f;
}

export function fmtInt(n: number, lang: Lang): string {
  return formatter(lang, 0, 0).format(Math.round(n));
}

export function fmtDec(n: number, lang: Lang, digits: number): string {
  return formatter(lang, digits, digits).format(n);
}

/** Nanoseconds, switching to ms from one million (the maxima span ns to ms). */
export function fmtNs(ns: number, lang: Lang): string {
  if (ns >= 1_000_000) return `${fmtDec(ns / 1e6, lang, 1)} ms`;
  return `${fmtInt(ns, lang)} ns`;
}

export function fmtMops(opsPerSecond: number, lang: Lang, digits = 2): string {
  return fmtDec(opsPerSecond / 1e6, lang, digits);
}

export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ""));
}
