"use client";
import { useEffect, useRef } from "react";

const timeline = [
  { year:"2024", title:"Research Assistant", org:"Quantitative Finance Lab", desc:"Developed ML models for portfolio optimization and factor-based risk decomposition." },
  { year:"2023", title:"Data Science Intern", org:"FinTech Startup", desc:"Built NLP pipelines for real-time sentiment analysis on financial news and earnings calls." },
  { year:"2022", title:"ML Project Lead", org:"University AI Society", desc:"Led a team of 5 building a live equity prediction system using LSTM and attention models." },
  { year:"2021", title:"B.Sc. Computer Science", org:"University", desc:"Specialisation in Machine Learning, Statistics & Financial Mathematics." },
];

export default function About() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.1 }
    );
    ref.current?.querySelectorAll(".fade-in").forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <section id="about" ref={ref} style={{ maxWidth:"1140px", margin:"0 auto", padding:"130px 48px" }}>
      {/* Section label */}
      <div className="fade-in" style={{
        display:"flex", alignItems:"center", gap:"16px",
        fontFamily:"var(--font-mono)", fontSize:"10px", color:"var(--text-muted)",
        letterSpacing:"0.22em", marginBottom:"52px",
      }}>
        <span style={{color:"var(--accent)"}}>01</span>
        <div style={{flex:1, height:"1px", background:"linear-gradient(90deg, var(--border-2), transparent)"}}/>
        ABOUT
        <div style={{flex:1, height:"1px", background:"linear-gradient(270deg, var(--border-2), transparent)"}}/>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"88px", alignItems:"start" }}>
        {/* LEFT */}
        <div>
          <h2 className="fade-in font-display" style={{
            fontSize:"clamp(36px, 5vw, 58px)", lineHeight:1.08,
            letterSpacing:"-0.025em", marginBottom:"30px",
          }}>
            Turning data into<br/>
            <span style={{color:"var(--accent)", fontStyle:"italic"}}>decisions.</span>
          </h2>

          <p className="fade-in" style={{fontSize:"15px", color:"var(--text-dim)", lineHeight:1.9, marginBottom:"20px"}}>
            I&apos;m a final-year student at the intersection of{" "}
            <strong style={{color:"var(--text)", fontWeight:500}}>computer science</strong>,{" "}
            <strong style={{color:"var(--text)", fontWeight:500}}>artificial intelligence</strong>, and{" "}
            <strong style={{color:"var(--text)", fontWeight:500}}>quantitative finance</strong>. My work focuses on extracting signal from noise — from predictive models to production data pipelines to systematic trading strategies.
          </p>
          <p className="fade-in" style={{fontSize:"15px", color:"var(--text-dim)", lineHeight:1.9, marginBottom:"36px"}}>
            I believe the sharpest insights live at the boundary of disciplines. Whether applying transformer architectures to time-series forecasting or engineering high-throughput ETL systems, I bring rigorous methodology and practical execution.
          </p>

          {/* Tag pills */}
          <div className="fade-in" style={{display:"flex", gap:"10px", flexWrap:"wrap"}}>
            {["Python","PyTorch","SQL","Apache Spark","React","TypeScript"].map(tag=>(
              <span key={tag} style={{
                fontFamily:"var(--font-mono)", fontSize:"11px",
                padding:"6px 14px",
                border:"1px solid var(--border-2)",
                borderRadius:"100px", color:"var(--text-dim)",
                letterSpacing:"0.04em",
                transition:"all 0.2s",
              }}
              onMouseOver={e=>{e.currentTarget.style.borderColor="var(--accent)"; e.currentTarget.style.color="var(--accent)";}}
              onMouseOut={e=>{e.currentTarget.style.borderColor="var(--border-2)"; e.currentTarget.style.color="var(--text-dim)";}}>
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* RIGHT — timeline */}
        <div>
          <div className="fade-in" style={{
            fontFamily:"var(--font-mono)", fontSize:"10px",
            color:"var(--text-muted)", letterSpacing:"0.22em", marginBottom:"28px",
          }}>EXPERIENCE & EDUCATION</div>

          <div style={{ position:"relative" }}>
            <div style={{
              position:"absolute", left:"50px", top:0, bottom:0,
              width:"1px", background:"var(--border)",
            }}/>

            {timeline.map((item, i) => (
              <div key={i} className="fade-in" style={{
                display:"grid", gridTemplateColumns:"50px 1fr",
                gap:"22px", marginBottom:"28px",
                animationDelay:`${i*0.1}s`,
              }}>
                <div style={{textAlign:"right", paddingRight:"8px", position:"relative", paddingTop:"14px"}}>
                  <span style={{fontFamily:"var(--font-mono)", fontSize:"10px", color:"var(--accent)", letterSpacing:"0.06em"}}>
                    {item.year}
                  </span>
                  <div style={{
                    position:"absolute", right:"-5px", top:"18px",
                    width:"9px", height:"9px", borderRadius:"50%",
                    background: i===0 ? "var(--accent)" : "var(--border-2)",
                    border:"2px solid var(--bg)", zIndex:1,
                  }}/>
                </div>
                <div style={{
                  background:"var(--bg-2)", border:"1px solid var(--border)",
                  borderRadius:"6px", padding:"14px 16px", marginLeft:"18px",
                  transition:"border-color 0.2s",
                }}
                onMouseOver={e=>e.currentTarget.style.borderColor="var(--border-2)"}
                onMouseOut={e=>e.currentTarget.style.borderColor="var(--border)"}>
                  <div style={{fontWeight:500, fontSize:"14px", color:"var(--text)", marginBottom:"2px"}}>{item.title}</div>
                  <div style={{fontFamily:"var(--font-mono)", fontSize:"10px", color:"var(--accent)", letterSpacing:"0.07em", marginBottom:"6px"}}>{item.org}</div>
                  <div style={{fontSize:"13px", color:"var(--text-dim)", lineHeight:1.65}}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
