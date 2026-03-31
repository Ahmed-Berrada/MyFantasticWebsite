"use client";
import { useEffect, useState } from "react";

const roles = ["Finance.", "AI.", "Data."];

export default function Hero() {
  const [roleIndex, setRoleIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => { setRoleIndex(i => (i + 1) % roles.length); setFade(true); }, 350);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <section style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", textAlign: "center",
      padding: "80px 48px 0", position: "relative", overflow: "hidden",
      background: "var(--bg)",
    }}>
      <div style={{ position:"absolute", top:"-15%", left:"-10%", width:"600px", height:"600px", borderRadius:"50%", background:"radial-gradient(circle, #1a3a6b28 0%, transparent 68%)", pointerEvents:"none" }}/>
      <div style={{ position:"absolute", bottom:"-10%", right:"-5%", width:"500px", height:"500px", borderRadius:"50%", background:"radial-gradient(circle, #c8a84b0d 0%, transparent 65%)", pointerEvents:"none" }}/>

      {/* Pill */}
      <div style={{
        display:"inline-flex", alignItems:"center", gap:"8px",
        border:"1px solid var(--border-2)", borderRadius:"100px",
        padding:"6px 16px", marginBottom:"52px", background:"var(--bg-2)",
      }}>
        <div style={{ width:"5px", height:"5px", borderRadius:"50%", background:"var(--accent)", boxShadow:"0 0 8px var(--accent)" }}/>
        <span style={{ fontFamily:"var(--font-mono)", fontSize:"10px", color:"var(--text-muted)", letterSpacing:"0.18em" }}>
          CS STUDENT · CLASS OF 2027
        </span>
      </div>

      {/* Name */}
      <h1 className="font-display hero-name" style={{
        fontSize:"clamp(58px, 12vw, 120px)",
        lineHeight:0.92, letterSpacing:"-0.035em",
        marginBottom:"32px", color:"var(--text)",
      }}>
        Ahmed<br/>
        <span style={{ color:"var(--accent)", fontStyle:"italic" }}>Berrada</span>
      </h1>

      {/* Role switcher */}
      <div style={{
        display:"flex", alignItems:"center", justifyContent:"center",
        gap:"14px", marginBottom:"36px", height:"32px",
      }}>
        <div style={{ width:"32px", height:"1px", background:"linear-gradient(90deg, transparent, var(--border-2))" }}/>
        <span style={{ fontFamily:"var(--font-mono)", fontSize:"13px", color:"var(--text-dim)", letterSpacing:"0.1em" }}>
          Breaking into
        </span>
        <span className="font-display" style={{
          fontSize:"22px", color:"var(--accent)", fontStyle:"italic",
          letterSpacing:"-0.01em", minWidth:"80px", textAlign:"left",
          opacity: fade ? 1 : 0, transform: fade ? "translateY(0)" : "translateY(6px)",
          transition:"opacity 0.35s ease, transform 0.35s ease",
        }}>
          {roles[roleIndex]}
        </span>
        <div style={{ width:"32px", height:"1px", background:"linear-gradient(90deg, var(--border-2), transparent)" }}/>
      </div>

      {/* Tagline */}
      <p style={{
        fontSize:"15px", color:"var(--text-muted)", lineHeight:1.8,
        maxWidth:"420px", marginBottom:"52px", fontWeight:300,
      }}>
        Building at the intersection of markets, machine learning,
        and data — one project at a time.
      </p>

      {/* CTAs */}
      <div style={{ display:"flex", gap:"12px", flexWrap:"wrap", justifyContent:"center", marginBottom:"80px" }}>
        <button onClick={() => document.getElementById("projects")?.scrollIntoView({ behavior:"smooth" })}
          style={{
            fontFamily:"var(--font-mono)", fontSize:"11px", letterSpacing:"0.14em",
            padding:"13px 28px", background:"var(--accent)", color:"#000",
            border:"none", borderRadius:"2px", cursor:"pointer", fontWeight:600, transition:"all 0.2s",
          }}
          onMouseOver={e => { e.currentTarget.style.opacity="0.85"; e.currentTarget.style.transform="translateY(-2px)"; }}
          onMouseOut={e => { e.currentTarget.style.opacity="1"; e.currentTarget.style.transform="translateY(0)"; }}>
          VIEW PROJECTS
        </button>
        <button onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior:"smooth" })}
          style={{
            fontFamily:"var(--font-mono)", fontSize:"11px", letterSpacing:"0.14em",
            padding:"13px 28px", background:"transparent", color:"var(--text-dim)",
            border:"1px solid var(--border-2)", borderRadius:"2px", cursor:"pointer", transition:"all 0.2s",
          }}
          onMouseOver={e => { e.currentTarget.style.borderColor="var(--accent)"; e.currentTarget.style.color="var(--accent)"; }}
          onMouseOut={e => { e.currentTarget.style.borderColor="var(--border-2)"; e.currentTarget.style.color="var(--text-dim)"; }}>
          GET IN TOUCH
        </button>
      </div>

      <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"1px", background:"linear-gradient(90deg, transparent, var(--border-2) 30%, var(--accent-glow) 50%, var(--border-2) 70%, transparent)" }}/>
      <div style={{ position:"absolute", bottom:"28px", left:"50%", transform:"translateX(-50%)", display:"flex", flexDirection:"column", alignItems:"center", gap:"8px", fontFamily:"var(--font-mono)", fontSize:"9px", color:"var(--text-muted)", letterSpacing:"0.22em" }}>
        SCROLL
        <div style={{ width:"1px", height:"32px", background:"linear-gradient(to bottom, var(--text-muted), transparent)" }}/>
      </div>

      <style>{`
        @media (max-width: 768px) {
          section { padding: 40px 24px 0 !important; }
        }
      `}</style>
    </section>
  );
}
