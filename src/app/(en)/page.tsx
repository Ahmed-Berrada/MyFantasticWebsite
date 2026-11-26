import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Siemens from "@/components/Siemens";
import Work from "@/components/Work";
import Background from "@/components/Background";
import Contact from "@/components/Contact";
import ScrollRail from "@/components/ScrollRail";
import { availableCvs } from "@/src/content/cv";
import JsonLd from "@/components/JsonLd";
import { pageMetadata, personJsonLd } from "@/src/lib/seo";

export const metadata = pageMetadata({
  lang: "en",
  path: "/",
  title: "Ahmed Berrada, software engineer, critical systems and performance",
  description:
    "Software engineer building systems that have to be right and fast: safety-critical rail software at Siemens Mobility, plus low-latency engines and GPU compute. ESIEA 2027, Paris. Looking for a permanent role from September 2027.",
  available: ["en"],
});

export default function Home() {
  const cvs = availableCvs();
  return (
    <>
      <JsonLd data={personJsonLd("en")} />
      <Navbar cvs={cvs} />
      <ScrollRail />
      <main id="main">
        <Hero />
        <Siemens />
        <Work />
        <Background />
        <Contact cvs={cvs} />
      </main>
    </>
  );
}
