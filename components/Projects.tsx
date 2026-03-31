"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const projects = [
  {
    num:"01", title:"Market Data Pipeline", subtitle:"Ingestion + Normalization + Feature Store", category:"DATA ENGINEERING · FINANCE",
    desc:"Build a production-ready ingestion pipeline for equities and crypto market data. Standardize schemas, validate quality, and expose cleaned datasets for modeling.",
    tags:["Python","PostgreSQL","Spark","Docker"],
    metrics:[{label:"Focus",val:"Reliability"},{label:"Output",val:"Clean OHLCV"},{label:"Use",val:"Model Inputs"}],
    accent:"var(--accent)",
    href:"https://marketdatapipeline.ahmedberrada.com/",
  },
  {
    num:"02", title:"Forecast Service API", subtitle:"Time-Series Modeling + API Delivery", category:"AI · BACKEND",
    desc:"Deploy a forecasting service with versioned models for short-horizon price movement estimation. Include model tracking and an API contract for downstream apps.",
    tags:["Scikit-learn","FastAPI","GitHub Actions","AWS Lambda"],
    metrics:[{label:"Focus",val:"Model Ops"},{label:"Output",val:"7-Day Forecast"},{label:"Use",val:"Dashboard API"}],
    accent:"var(--navy-light)",
  },
  {
    num:"03", title:"Risk Monitoring Dashboard", subtitle:"Volatility + Drawdown + Alerts", category:"QUANT ANALYTICS · FRONTEND",
    desc:"Web dashboard tracking rolling volatility, downside risk, and drawdown for a defined basket. Add alerting logic and data quality guards.",
    tags:["Next.js","TypeScript","YFinance API","PostgreSQL"],
    metrics:[{label:"Focus",val:"Risk Metrics"},{label:"Output",val:"Live Monitoring"},{label:"Use",val:"Decision Support"}],
    accent:"#5b8af5",
  },
  {
    num:"04", title:"Cloud Quant Sandbox", subtitle:"Infrastructure as Code for Research", category:"CLOUD · DEVOPS",
    desc:"Provision a reproducible research environment for experiments and backtests using Terraform, containerized workloads, and automated CI checks.",
    tags:["Terraform","Docker","Kubernetes","GitHub Actions"],
    metrics:[{label:"Focus",val:"Reproducibility"},{label:"Output",val:"IaC Templates"},{label:"Use",val:"Team Workflow"}],
    accent:"#b87fce",
  },
];

export default function Projects() {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<number|null>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.06 }
    );
    ref.current?.querySelectorAll(".fade-in").forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <section id="projects" ref={ref} style={{ background:"var(--bg-2)", borderTop:"1px solid var(--border)", borderBottom:"1px solid var(--border)", padding:"130px 0" }}>
      <div style={{ maxWidth:"1140px", margin:"0 auto", padding:"0 48px" }}>
        <div className="fade-in" style={{ display:"flex", alignItems:"center", gap:"16px", fontFamily:"var(--font-mono)", fontSize:"10px", color:"var(--text-muted)", letterSpacing:"0.22em", marginBottom:"52px" }}>
          <span style={{color:"var(--accent)"}}>02</span>
          <div style={{flex:1, height:"1px", background:"linear-gradient(90deg, var(--border-2), transparent)"}}/>
          PROJECTS
          <div style={{flex:1, height:"1px", background:"linear-gradient(270deg, var(--border-2), transparent)"}}/>
        </div>

        <h2 className="fade-in font-display" style={{ fontSize:"clamp(32px, 4.5vw, 54px)", marginBottom:"16px", letterSpacing:"-0.025em", lineHeight:1.1 }}>
          Project Roadmap
        </h2>
        <p className="fade-in" style={{ fontFamily:"var(--font-mono)", fontSize:"11px", color:"var(--text-muted)", marginBottom:"48px", letterSpacing:"0.05em" }}>
          Projects in progress — building in public.
        </p>

        <div className="projects-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"24px" }}>
          {projects.map((p,i)=>{
            const cardContent = (
              <>
              {hovered===i && <div style={{ position:"absolute", top:0, left:0, right:0, height:"2px", background:`linear-gradient(90deg, transparent, ${p.accent}, transparent)` }}/>}

              <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"16px"}}>
                <div>
                  <div style={{fontFamily:"var(--font-mono)", fontSize:"10px", color:p.accent, letterSpacing:"0.16em", marginBottom:"6px"}}>{p.category}</div>
                  <h3 className="font-display" style={{fontSize:"22px", letterSpacing:"-0.015em", color:"var(--text)"}}>{p.title}</h3>
                  <div style={{fontFamily:"var(--font-mono)", fontSize:"11px", color:"var(--text-muted)", marginTop:"2px"}}>{p.subtitle}</div>
                </div>
                <span style={{fontFamily:"var(--font-mono)", fontSize:"28px", color:"var(--border-2)", fontWeight:300, lineHeight:1}}>{p.num}</span>
              </div>

              <p style={{fontSize:"13px", color:"var(--text-dim)", lineHeight:1.78, marginBottom:"20px"}}>{p.desc}</p>

              <div style={{ display:"flex", gap:"0", marginBottom:"20px", background:"var(--bg-3)", borderRadius:"6px", border:"1px solid var(--border)", overflow:"hidden" }}>
                {p.metrics.map((m,j)=>(
                  <div key={m.label} style={{ flex:1, padding:"12px 8px", textAlign:"center", borderRight:j<p.metrics.length-1?"1px solid var(--border)":"none" }}>
                    <div style={{fontFamily:"var(--font-mono)", fontSize:"12px", color:p.accent, fontWeight:500}}>{m.val}</div>
                    <div style={{fontFamily:"var(--font-mono)", fontSize:"9px", color:"var(--text-muted)", letterSpacing:"0.12em", marginTop:"3px"}}>{m.label}</div>
                  </div>
                ))}
              </div>

              <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                <div style={{display:"flex", gap:"7px", flexWrap:"wrap"}}>
                  {p.tags.map(t=>(
                    <span key={t} style={{ fontFamily:"var(--font-mono)", fontSize:"10px", padding:"3px 9px", background:"var(--bg-3)", border:"1px solid var(--border)", borderRadius:"3px", color:"var(--text-muted)" }}>{t}</span>
                  ))}
                </div>
                <span style={{ fontFamily:"var(--font-mono)", fontSize:"10px", color:"var(--text-muted)", letterSpacing:"0.1em", textTransform:"uppercase" }}>
                  {p.href ? "VIEW" : "IN PROGRESS"}
                </span>
              </div>
              </>
            );

            const cardStyle = {
              background:hovered===i?"var(--bg-3)":"var(--bg)",
              border:`1px solid ${hovered===i?p.accent+"55":"var(--border)"}`,
              borderRadius:"8px", padding:"28px", cursor:p.href?"pointer":"default",
              transition:"all 0.3s ease",
              transform:hovered===i?"translateY(-4px)":"translateY(0)",
              boxShadow:hovered===i?`0 12px 40px ${p.accent}18`:"none",
              animationDelay:`${i*0.1}s`, position:"relative" as const, overflow:"hidden" as const,
              display:"block", textDecoration:"none",
            };

            return p.href ? (
              <Link
                key={i}
                href={p.href}
                className="fade-in"
                aria-label={`Open project ${p.title}`}
                onMouseEnter={()=>setHovered(i)}
                onMouseLeave={()=>setHovered(null)}
                style={cardStyle}
              >
                {cardContent}
              </Link>
            ) : (
              <div
                key={i}
                className="fade-in"
                onMouseEnter={()=>setHovered(i)}
                onMouseLeave={()=>setHovered(null)}
                style={cardStyle}
              >
                {cardContent}
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          #projects > div { padding: 0 24px !important; }
          #projects { padding: 80px 0 !important; }
          .projects-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
