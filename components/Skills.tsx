"use client";
import { useEffect, useRef } from "react";

const categories = [
  {
    label: "Data & AI", icon: "◈",
    skills: ["Python (Pandas, Polars)", "Scikit-learn", "PyTorch / TensorFlow", "SQL / PostgreSQL", "Apache Spark", "Jupyter"],
  },
  {
    label: "Finance", icon: "◎",
    skills: ["Quantitative Analysis", "Time-Series Forecasting", "Risk Modelling", "YFinance / Alpha Vantage", "Portfolio Analytics"],
  },
  {
    label: "Cloud & DevOps", icon: "⬡",
    skills: ["Docker / Kubernetes", "AWS / Azure", "CI/CD (GitHub Actions)", "Terraform", "Linux"],
  },
  {
    label: "Core Engineering", icon: "⬟",
    skills: ["C++", "Java / Go", "REST APIs", "System Design", "TypeScript / React", "Next.js"],
  },
];

const tools = [
  "Python", "PyTorch", "Pandas", "Polars", "Scikit-learn",
  "SQL", "PostgreSQL", "Spark", "Docker", "Kubernetes",
  "Terraform", "FastAPI", "React", "TypeScript", "Next.js",
  "GitHub Actions", "AWS", "Azure", "YFinance", "C++", "Go",
];

export default function Skills() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
        entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); }),
        { threshold: 0.08 }
    );
    ref.current?.querySelectorAll(".fade-in").forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
      <section id="skills" ref={ref} style={{ maxWidth: "1140px", margin: "0 auto", padding: "130px 48px" }}>

        {/* Section label */}
        <div className="fade-in" style={{
          display: "flex", alignItems: "center", gap: "16px",
          fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-muted)",
          letterSpacing: "0.22em", marginBottom: "52px",
        }}>
          <span style={{ color: "var(--accent)" }}>03</span>
          <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, var(--border-2), transparent)" }}/>
          SKILLS
          <div style={{ flex: 1, height: "1px", background: "linear-gradient(270deg, var(--border-2), transparent)" }}/>
        </div>

        <h2 className="fade-in font-display" style={{
          fontSize: "clamp(32px, 4.5vw, 54px)",
          marginBottom: "56px", letterSpacing: "-0.025em", lineHeight: 1.1,
        }}>
          Technical{" "}
          <span style={{ color: "var(--accent)", fontStyle: "italic" }}>Expertise</span>
        </h2>

        {/* Category cards */}
        <div className="skills-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "56px" }}>
          {categories.map((cat, i) => (
              <div key={i} className="fade-in" style={{
                background: "var(--bg-2)", border: "1px solid var(--border)",
                borderRadius: "8px", padding: "24px",
                animationDelay: `${i * 0.1}s`,
                transition: "border-color 0.2s",
              }}
                   onMouseOver={e => e.currentTarget.style.borderColor = "var(--border-2)"}
                   onMouseOut={e => e.currentTarget.style.borderColor = "var(--border)"}
              >
                {/* Card header */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px", paddingBottom: "16px", borderBottom: "1px solid var(--border)" }}>
                  <span style={{ color: "var(--accent)", fontSize: "14px" }}>{cat.icon}</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.16em", color: "var(--text-dim)" }}>
                {cat.label.toUpperCase()}
              </span>
                </div>

                {/* Skill tags */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {cat.skills.map(skill => (
                      <span key={skill} style={{
                        fontFamily: "var(--font-mono)", fontSize: "11px",
                        padding: "6px 12px",
                        background: "var(--bg-3)",
                        border: "1px solid var(--border)",
                        borderRadius: "3px",
                        color: "var(--text-dim)",
                        letterSpacing: "0.03em",
                        transition: "all 0.2s",
                        cursor: "default",
                      }}
                            onMouseOver={e => {
                              e.currentTarget.style.borderColor = "var(--accent)";
                              e.currentTarget.style.color = "var(--accent)";
                              e.currentTarget.style.background = "var(--accent-dim)";
                            }}
                            onMouseOut={e => {
                              e.currentTarget.style.borderColor = "var(--border)";
                              e.currentTarget.style.color = "var(--text-dim)";
                              e.currentTarget.style.background = "var(--bg-3)";
                            }}>
                  {skill}
                </span>
                  ))}
                </div>
              </div>
          ))}
        </div>

        {/* Tools strip */}
        <div className="fade-in">
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: "10px",
            color: "var(--text-muted)", letterSpacing: "0.22em", marginBottom: "16px",
          }}>
            TOOLS & TECHNOLOGIES
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {tools.map((tool, i) => (
                <span key={tool} style={{
                  fontFamily: "var(--font-mono)", fontSize: "11px",
                  padding: "6px 12px",
                  background: i % 7 === 0 ? "var(--accent-dim)" : "transparent",
                  border: `1px solid ${i % 7 === 0 ? "var(--accent-glow)" : "var(--border)"}`,
                  borderRadius: "3px",
                  color: i % 7 === 0 ? "var(--accent)" : "var(--text-muted)",
                  cursor: "default", transition: "all 0.2s",
                }}
                      onMouseOver={e => {
                        e.currentTarget.style.borderColor = "var(--accent)";
                        e.currentTarget.style.color = "var(--accent)";
                        e.currentTarget.style.background = "var(--accent-dim)";
                      }}
                      onMouseOut={e => {
                        e.currentTarget.style.borderColor = i % 7 === 0 ? "var(--accent-glow)" : "var(--border)";
                        e.currentTarget.style.color = i % 7 === 0 ? "var(--accent)" : "var(--text-muted)";
                        e.currentTarget.style.background = i % 7 === 0 ? "var(--accent-dim)" : "transparent";
                      }}>
              {tool}
            </span>
            ))}
          </div>
        </div>

        <style>{`
        @media (max-width: 768px) {
          #skills { padding: 80px 24px !important; }
          .skills-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
      </section>
  );
}