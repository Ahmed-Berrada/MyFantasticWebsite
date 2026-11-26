import Footer from "./Footer";
import Navbar from "./Navbar";
import ScrollRail from "./ScrollRail";
import { availableCvs } from "@/src/content/cv";
import { getDict } from "@/src/content";
import { localPath } from "@/src/lib/seo";
import type { Lang } from "@/src/content/types";

interface Props {
  lang: Lang;
  /** The same page in the other language, as a path in that language (see localPath). */
  path: string;
  /** Show the scroll rail (home page only). */
  rail?: boolean;
  children: React.ReactNode;
}

/** Navbar, optional scroll rail, main landmark and footer around a page. `path` is the language-neutral path. */
export default function SiteShell({ lang, path, rail, children }: Props) {
  const t = getDict(lang);
  const other: Lang = lang === "en" ? "fr" : "en";
  const altPath = localPath(other, path);
  const cv = availableCvs().find((c) => c.lang === lang.toUpperCase());
  const sections = [
    { id: "top", label: t.nav.railStart },
    { id: "siemens", label: t.nav.siemens },
    { id: "work", label: t.nav.work },
    { id: "writing", label: t.nav.writing },
    { id: "background", label: t.nav.background },
    { id: "contact", label: t.nav.contact },
  ];
  return (
    <>
      <Navbar t={t.nav} lang={lang} altPath={altPath} cvHref={cv?.href ?? null} />
      {rail && <ScrollRail sections={sections} aria={t.nav.progress} />}
      <main id="main">{children}</main>
      <Footer t={t} lang={lang} altPath={altPath} />
    </>
  );
}
