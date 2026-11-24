import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Siemens from "@/components/Siemens";
import Work from "@/components/Work";
import Background from "@/components/Background";
import Contact from "@/components/Contact";

export default function Home() {
  return (
    <>
      <Navbar />
      <main id="main">
        <Hero />
        <Siemens />
        <Work />
        <Background />
        <Contact />
      </main>
    </>
  );
}
