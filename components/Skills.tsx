"use client";
import { useEffect, useRef, useState } from "react";

const categories = [
  { label:"Data & AI", icon:"◈", skills:[
    {name:"Python (Pandas, Polars, Scikit-learn)", level:88},
    {name:"PyTorch / TensorFlow", level:78},
    {name:"SQL / PostgreSQL", level:90},
    {name:"Apache Spark", level:72},
  ]},
  { label:"Finance", icon:"◎", skills:[
    {name:"Quantitative Analysis", level:75},
    {name:"Time-Series Forecasting", level:78},
    {name:"Risk Modelling", level:72},
    {name:"API Integration (YFinance)", level:82},
  ]},
  { label:"Cloud & DevOps", icon:"⬡", skills:[
    {name:"Docker / Kubernetes", level:74},
    {name:"AWS / Azure", level:70},
    {name:"CI/CD (GitHub Actions)", level:80},
    {name:"Terraform", level:65},
  ]},
  { label:"Core Engineering", icon:"⬟", skills:[
    {name:"C++", level:78},
    {name:"Java / Go", level:70},
    {name:"System Design", level:72},
    {name:"REST APIs", level:85},
  ]},
];

const tools = [
  "Python","PyTorch","Pandas","Polars","Scikit-learn","SQL","PostgreSQL",
  "Spark","Docker","Kubernetes","Terraform","FastAPI",
  "React","TypeScript","Next.js","GitHub Actions","AWS","Azure","YFinance","C++",
];

function Bar({ name, level, visible }: { name:string; level:number; visible:boolean }) {
  return (
    <div style={{marginBottom:"13px"}}>
      <div style={{display:"flex", justifyContent:"space-between", marginBottom:"6px"}}>
        <span style={{fontSize:"13px", color:"var(--text-dim)"}}>{name}</span>
        <span style={{fontFamily:"var(--font-mono)", fontSize:"11px", color:"var(--accent)"}}>{level}%</span>
      </div>
      <div style={{height:"2px", background:"var(--border)", borderRadius:"2px", overflow:"hidden"}}>
        <div style={{
          height:"100%", width:visible?`${level}%`:"0%",
          background:"linear-gradient(90deg, var(--navy-light), var(--accent))",
          borderRadius:"2px", transition:"width 1.3s cubic-bezier(0.4,0,0.2,1)",
        }}/>
      </div>
    </div>
  );
}

export default function Skills() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("visible"); setVisible(true); } });
    }, { threshold: 0.1 });
    if (ref.current) {
      ref.current.querySelectorAll(".fade-in").forEach(el => obs.observe(el));
      obs.observe(ref.current);
    }
    return () => obs.disconnect();
  }, []);

  return (
    <section id="skills" ref={ref} style={{ maxWidth:"1140px", margin:"0 auto", padding:"130px 48px" }}>
      <div className="fade-in" style={{ display:"flex", alignItems:"center", gap:"16px", fontFamily:"var(--font-mono)", fontSize:"10px", color:"var(--text-muted)", letterSpacing:"0.22em", marginBottom:"52px" }}>
        <span style={{color:"var(--accent)"}}>03</span>
        <div style={{flex:1, height:"1px", background:"linear-gradient(90deg, var(--border-2), transparent)"}}/>
        SKILLS
        <div style={{flex:1, height:"1px", background:"linear-gradient(270deg, var(--border-2), transparent)"}}/>
      </div>

      <h2 className="fade-in font-display" style={{ fontSize:"clamp(32px, 4.5vw, 54px)", marginBottom:"56px", letterSpacing:"-0.025em", lineHeight:1.1 }}>
        Technical <span style={{color:"var(--accent)", fontStyle:"italic"}}>Expertise</span>
      </h2>

      <div className="skills-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"24px", marginBottom:"56px" }}>
        {categories.map((cat,i)=>(
          <div key={i} className="fade-in" style={{ background:"var(--bg-2)", border:"1px solid var(--border)", borderRadius:"8px", padding:"24px", animationDelay:`${i*0.1}s` }}>
            <div style={{display:"flex", alignItems:"center", gap:"10px", marginBottom:"20px"}}>
              <span style={{color:"var(--accent)", fontSize:"16px"}}>{cat.icon}</span>
              <span style={{fontFamily:"var(--font-mono)", fontSize:"10px", letterSpacing:"0.14em", color:"var(--text-dim)"}}>{cat.label.toUpperCase()}</span>
            </div>
            {cat.skills.map(s=><Bar key={s.name} name={s.name} level={s.level} visible={visible}/>)}
          </div>
        ))}
      </div>

      <div className="fade-in">
        <div style={{fontFamily:"var(--font-mono)", fontSize:"10px", color:"var(--text-muted)", letterSpacing:"0.22em", marginBottom:"18px"}}>TOOLS & TECHNOLOGIES</div>
        <div style={{display:"flex", flexWrap:"wrap", gap:"10px"}}>
          {tools.map((tool,i)=>(
            <span key={tool} style={{
              fontFamily:"var(--font-mono)", fontSize:"12px", padding:"7px 14px",
              background:i%6===0?"var(--accent-dim)":"var(--bg-2)",
              border:`1px solid ${i%6===0?"var(--accent-glow)":"var(--border)"}`,
              borderRadius:"3px", color:i%6===0?"var(--accent)":"var(--text-dim)",
              cursor:"default", transition:"all 0.2s",
            }}
            onMouseOver={e=>{e.currentTarget.style.borderColor="var(--accent)"; e.currentTarget.style.color="var(--accent)"; e.currentTarget.style.background="var(--accent-dim)";}}
            onMouseOut={e=>{e.currentTarget.style.borderColor=i%6===0?"var(--accent-glow)":"var(--border)"; e.currentTarget.style.color=i%6===0?"var(--accent)":"var(--text-dim)"; e.currentTarget.style.background=i%6===0?"var(--accent-dim)":"var(--bg-2)";}}>
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
