import type { Lang } from "@/src/content/types";

const locale = (lang: Lang) => (lang === "fr" ? "fr-FR" : "en-US");

export function fmtInt(n: number, lang: Lang): string {
  return new Intl.NumberFormat(locale(lang), { maximumFractionDigits: 0 }).format(Math.round(n));
}

export function fmtDec(n: number, lang: Lang, digits: number): string {
  return new Intl.NumberFormat(locale(lang), { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(n);
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
