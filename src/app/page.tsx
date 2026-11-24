import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Siemens from "@/components/Siemens";
import Work from "@/components/Work";
import Background from "@/components/Background";
import Contact from "@/components/Contact";
import ScrollRail from "@/components/ScrollRail";
import { availableCvs } from "@/src/content/cv";

export default function Home() {
  const cvs = availableCvs();
  return (
    <>
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
