"use client";
import { useEffect, useRef } from "react";

const categories = [
  {
    label: "Data & AI",
    items: [
      "Python (Pandas, Polars, Scikit-learn)",
      "PyTorch / TensorFlow",
      "SQL (PostgreSQL)",
      "Apache Spark",
    ],
  },
  {
    label: "Finance",
    items: [
      "Quantitative Analysis",
      "Time-Series Forecasting",
      "Risk Modeling",
      "API Integration (YFinance / Alpha Vantage)",
    ],
  },
  {
    label: "Cloud & DevOps",
    items: [
      "Docker / Kubernetes",
      "AWS / Azure (EC2, S3, Lambda)",
      "CI/CD Pipelines (GitHub Actions)",
      "Terraform",
    ],
  },
  {
    label: "Core Engineering",
    items: ["C++", "Java / Go", "System Design", "REST APIs"],
  },
];

export default function Skills() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add("visible");
      });
    }, { threshold: 0.1 });
    if (ref.current) {
      ref.current.querySelectorAll(".fade-in").forEach(el => obs.observe(el));
      obs.observe(ref.current);
    }
    return () => obs.disconnect();
  }, []);

  return (
    <section id="skills" ref={ref} style={{ maxWidth:"1140px", margin:"0 auto", padding:"130px 48px" }}>
      <div className="fade-in" style={{
        display:"flex", alignItems:"center", gap:"16px",
        fontFamily:"var(--font-mono)", fontSize:"10px", color:"var(--text-muted)",
        letterSpacing:"0.22em", marginBottom:"52px",
      }}>
        <span style={{color:"var(--accent)"}}>03</span>
        <div style={{flex:1, height:"1px", background:"linear-gradient(90deg, var(--border-2), transparent)"}}/>
        SKILLS
        <div style={{flex:1, height:"1px", background:"linear-gradient(270deg, var(--border-2), transparent)"}}/>
      </div>

      <h2 className="fade-in font-display" style={{
        fontSize:"clamp(32px, 4.5vw, 54px)", marginBottom:"56px",
        letterSpacing:"-0.025em", lineHeight:1.1,
      }}>
        Modern Quant{" "}
        <span style={{color:"var(--accent)", fontStyle:"italic"}}>Expertise</span>
      </h2>

      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"24px", marginBottom:"56px"}}>
        {categories.map((cat,i)=>(
          <div key={i} className="fade-in" style={{
            background:"var(--bg-2)", border:"1px solid var(--border)",
            borderRadius:"8px", padding:"24px",
            animationDelay:`${i*0.1}s`,
          }}>
            <div style={{display:"flex", alignItems:"center", gap:"10px", marginBottom:"20px"}}>
              <span style={{fontFamily:"var(--font-mono)", fontSize:"10px", letterSpacing:"0.14em", color:"var(--text-dim)"}}>
                {cat.label.toUpperCase()}
              </span>
            </div>
            <div style={{ display:"grid", gap:"8px" }}>
              {cat.items.map((item) => (
                <div
                  key={item}
                  style={{
                    fontSize:"13px",
                    color:"var(--text-dim)",
                    lineHeight:1.6,
                    borderLeft:"2px solid var(--border-2)",
                    paddingLeft:"10px",
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
