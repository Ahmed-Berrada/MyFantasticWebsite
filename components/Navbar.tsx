"use client";
import { useState, useEffect } from "react";

const links = ["About", "Projects", "Skills", "Contact"];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const go = (id: string) => {
    document.getElementById(id.toLowerCase())?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <>
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: scrolled ? "10px 48px" : "20px 48px",
        background: scrolled || menuOpen ? "rgba(7,9,15,0.97)" : "transparent",
        backdropFilter: scrolled ? "blur(18px)" : "none",
        borderBottom: scrolled ? "1px solid var(--border)" : "1px solid transparent",
        transition: "all 0.35s ease",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}
      className="mobile-nav-pad">
        {/* Logo */}
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          style={{ background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:"10px" }}>
          <div style={{
            width:"32px", height:"32px", border:"1px solid var(--accent)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontFamily:"var(--font-display)", fontSize:"15px", color:"var(--accent)", fontWeight:600,
          }}>A</div>
          <span style={{ fontFamily:"var(--font-mono)", fontSize:"12px", color:"var(--text-dim)", letterSpacing:"0.12em" }}>
            BERRADA
          </span>
        </button>

        {/* Desktop links */}
        <div className="mobile-hide" style={{ display:"flex", gap:"36px", alignItems:"center" }}>
          {links.map(l => (
            <button key={l} onClick={() => go(l)} style={{
              fontFamily:"var(--font-mono)", fontSize:"11px", letterSpacing:"0.14em",
              color:"var(--text-dim)", background:"none", border:"none", cursor:"pointer",
              transition:"color 0.2s", textTransform:"uppercase",
            }}
            onMouseOver={e => e.currentTarget.style.color = "var(--accent)"}
            onMouseOut={e => e.currentTarget.style.color = "var(--text-dim)"}
            >{l}</button>
          ))}
          <a href="#" style={{
            fontFamily:"var(--font-mono)", fontSize:"11px", letterSpacing:"0.12em",
            color:"var(--bg)", background:"var(--accent)", padding:"8px 18px",
            borderRadius:"2px", textDecoration:"none", fontWeight:500,
          }}>RÉSUMÉ ↗</a>
        </div>

        {/* Hamburger */}
        <button
          onClick={() => setMenuOpen(o => !o)}
          style={{
            display:"none", background:"none", border:"none", cursor:"pointer",
            flexDirection:"column", gap:"5px", padding:"4px",
          }}
          className="mobile-hamburger"
        >
          {[0,1,2].map(i => (
            <div key={i} style={{
              width:"22px", height:"1.5px", background: "var(--text-dim)",
              transition:"all 0.3s",
              transform: menuOpen
                ? i===0 ? "rotate(45deg) translate(4px, 4px)"
                : i===2 ? "rotate(-45deg) translate(4px, -4px)"
                : "scaleX(0)"
                : "none",
            }}/>
          ))}
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          position:"fixed", top:"60px", left:0, right:0, zIndex:99,
          background:"rgba(7,9,15,0.98)", borderBottom:"1px solid var(--border)",
          padding:"24px",
          display:"flex", flexDirection:"column", gap:"20px",
        }}>
          {links.map(l => (
            <button key={l} onClick={() => go(l)} style={{
              fontFamily:"var(--font-mono)", fontSize:"14px", letterSpacing:"0.14em",
              color:"var(--text-dim)", background:"none", border:"none", cursor:"pointer",
              textTransform:"uppercase", textAlign:"left", padding:"8px 0",
              borderBottom:"1px solid var(--border)",
            }}>{l}</button>
          ))}
          <a href="#" style={{
            fontFamily:"var(--font-mono)", fontSize:"12px", letterSpacing:"0.12em",
            color:"var(--bg)", background:"var(--accent)", padding:"12px",
            borderRadius:"2px", textDecoration:"none", fontWeight:500, textAlign:"center",
          }}>RÉSUMÉ ↗</a>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .mobile-hamburger { display: flex !important; }
          .mobile-hide { display: none !important; }
          .mobile-nav-pad { padding-left: 20px !important; padding-right: 20px !important; }
        }
      `}</style>
    </>
  );
}
