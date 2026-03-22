"use client";
import { useState, useEffect } from "react";

const links = ["About", "Projects", "Skills", "Contact"];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const go = (id: string) => {
    const slug = id.toLowerCase().replace(/\s+/g, "-");
    document.getElementById(slug)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      padding: scrolled ? "8px 48px" : "16px 48px",
      background: scrolled ? "rgba(7,9,15,0.94)" : "transparent",
      backdropFilter: scrolled ? "blur(18px)" : "none",
      borderBottom: scrolled ? "1px solid var(--border)" : "1px solid transparent",
      transition: "all 0.35s ease",
      display: "flex", alignItems: "center", justifyContent: "space-between",
    }}>
      {/* Signature mark */}
      <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        style={{ background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center" }}>
        <span
          className="font-display"
          style={{
            fontSize:"30px",
            color:"var(--accent)",
            fontStyle:"italic",
            letterSpacing:"0.02em",
            lineHeight:1,
          }}
        >
          Berrada
        </span>
      </button>

      <div style={{ display:"flex", gap:"36px", alignItems:"center" }}>
        {links.map(l => (
          <button key={l} onClick={() => go(l)} style={{
            fontFamily:"var(--font-mono)", fontSize:"11px", letterSpacing:"0.14em",
            color:"var(--text-dim)", background:"none", border:"none", cursor:"pointer",
            transition:"color 0.2s", padding:"3px 0", textTransform:"uppercase",
          }}
          onMouseOver={e => e.currentTarget.style.color = "var(--accent)"}
          onMouseOut={e => e.currentTarget.style.color = "var(--text-dim)"}
          >{l}</button>
        ))}
        <a href="/resume.pdf" target="_blank" rel="noreferrer" style={{
          fontFamily:"var(--font-mono)", fontSize:"11px", letterSpacing:"0.12em",
          color:"var(--bg)", background:"var(--accent)", padding:"6px 18px",
          borderRadius:"2px", textDecoration:"none", fontWeight:500,
          transition:"opacity 0.2s",
        }}
        onMouseOver={e=>(e.currentTarget as HTMLElement).style.opacity="0.85"}
        onMouseOut={e=>(e.currentTarget as HTMLElement).style.opacity="1"}>
          RÉSUMÉ ↗
        </a>
      </div>
    </nav>
  );
}
