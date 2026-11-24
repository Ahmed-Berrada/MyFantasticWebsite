import { existsSync } from "node:fs";
import path from "node:path";

export interface CvFile {
  lang: "EN" | "FR";
  label: string;
  href: string;
}

const candidates: CvFile[] = [
  { lang: "EN", label: "CV (English)", href: "/cv/Ahmed_Berrada_CV_EN.pdf" },
  { lang: "FR", label: "CV (français)", href: "/cv/Ahmed_Berrada_CV_FR.pdf" },
];

/** CVs present in public/cv at build time. Links only render for files that exist. */
export function availableCvs(): CvFile[] {
  return candidates.filter((c) => existsSync(path.join(process.cwd(), "public", c.href)));
}
