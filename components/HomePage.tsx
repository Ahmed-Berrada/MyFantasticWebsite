import Background from "./Background";
import Contact from "./Contact";
import Hero from "./Hero";
import JsonLd from "./JsonLd";
import ProofStrip from "./ProofStrip";
import SiteShell from "./SiteShell";
import Siemens from "./Siemens";
import Work from "./Work";
import WritingList from "./WritingList";
import { availableCvs } from "@/src/content/cv";
import { getDict, getNotes } from "@/src/content";
import { personJsonLd } from "@/src/lib/seo";
import type { Lang } from "@/src/content/types";

/** The home page in either language. */
export default function HomePage({ lang }: { lang: Lang }) {
  const t = getDict(lang);
  const cvs = availableCvs();
  const mine = cvs.find((c) => c.lang === lang.toUpperCase());
  const other = cvs.find((c) => c.lang !== lang.toUpperCase());
  return (
    <SiteShell lang={lang} path="/" rail>
      <JsonLd data={personJsonLd(lang)} />
      <Hero t={t.hero} cvHref={mine?.href ?? null} cvOtherHref={other?.href ?? null} />
      <ProofStrip t={t.proof} lang={lang} />
      <Siemens t={t.siemens} lang={lang} />
      <Work t={t.work} lang={lang} />
      <WritingList notes={getNotes(lang)} t={t.writing} lang={lang} />
      <Background t={t.background} />
      <Contact t={t.contact} cvEn={cvs.find((c) => c.lang === "EN")?.href ?? null} cvFr={cvs.find((c) => c.lang === "FR")?.href ?? null} />
    </SiteShell>
  );
}
