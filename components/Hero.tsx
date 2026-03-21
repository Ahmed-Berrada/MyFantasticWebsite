"use client";
import { useEffect, useRef, useState } from "react";

const tickers = [
  {sym:"SPY",  val:"+1.84%", pos:true},
  {sym:"BTC",  val:"+4.11%", pos:true},
  {sym:"GLD",  val:"+0.63%", pos:true},
  {sym:"NVDA", val:"+2.97%", pos:true},
  {sym:"AAPL", val:"-0.31%", pos:false},
  {sym:"JPM",  val:"+0.88%", pos:true},
  {sym:"ETH",  val:"+3.42%", pos:true},
  {sym:"TSLA", val:"-1.07%", pos:false},
  {sym:"QQQ",  val:"+1.52%", pos:true},
  {sym:"GS",   val:"+0.74%", pos:true},
  {sym:"MS",   val:"+0.45%", pos:true},
  {sym:"BRK",  val:"+0.29%", pos:true},
];

const sparkData = [42,49,44,61,55,72,64,79,70,83,76,92,85,98,90,100];
const roles = ["Data Scientist", "AI Engineer", "Quant Analyst", "ML Researcher"];

export default function Hero() {
  const [typed, setTyped] = useState("");
  const [phase, setPhase] = useState(0);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  useEffect(() => {
    const current = roles[phase % roles.length];
    let i = 0, del = false;
    let t: NodeJS.Timeout;
    const tick = () => {
      if (!del) {
        setTyped(current.slice(0, i+1)); i++;
        if (i === current.length) { t = setTimeout(()=>{ del=true; tick(); }, 2200); return; }
      } else {
        setTyped(current.slice(0, i-1)); i--;
        if (i === 0) { del=false; setPhase(p=>p+1); return; }
      }
      t = setTimeout(tick, del ? 38 : 75);
    };
    t = setTimeout(tick, 400);
    return () => clearTimeout(t);
  }, [phase]);

  const pts = sparkData.map((v, i) => ({
    x: (i/(sparkData.length-1))*320, y: 72-(v/100)*60
  }));
  const linePath = pts.map((p,i)=>`${i===0?"M":"L"} ${p.x} ${p.y}`).join(" ");
  const fillPath = linePath + ` L 320 75 L 0 75 Z`;
  const tickerAll = [...tickers,...tickers];

  return (
    <section style={{
      minHeight:"100vh", display:"flex", flexDirection:"column",
      justifyContent:"center", position:"relative", overflow:"hidden",
      paddingTop:"80px",
    }}>
      {/* Deep navy radial */}
      <div style={{
        position:"absolute", inset:0,
        background:"radial-gradient(ellipse 90% 80% at 50% 20%, #0d1f4a22 0%, transparent 70%)",
        pointerEvents:"none",
      }}/>
      {/* Gold radial top right */}
      <div style={{
        position:"absolute", top:"-10%", right:"-5%",
        width:"500px", height:"500px",
        background:"radial-gradient(circle, #c8a84b0a 0%, transparent 65%)",
        pointerEvents:"none",
      }}/>

      {/* Ticker */}
      <div style={{
        position:"absolute", top:"64px", left:0, right:0,
        borderTop:"1px solid var(--border)", borderBottom:"1px solid var(--border)",
        background:"var(--bg-2)", overflow:"hidden", padding:"7px 0",
      }}>
        <div className="ticker-inner">
          {tickerAll.map((t,i)=>(
            <span key={i} style={{
              fontFamily:"var(--font-mono)", fontSize:"11px",
              padding:"0 28px", whiteSpace:"nowrap", color:"var(--text-dim)",
              borderRight:"1px solid var(--border)",
            }}>
              <span style={{color:"var(--text)", letterSpacing:"0.05em"}}>{t.sym}</span>
              {" "}
              <span style={{color: t.pos?"var(--accent)":"#e05c6e"}}>{t.val}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Main grid */}
      <div style={{
        maxWidth:"1140px", margin:"0 auto", padding:"0 48px",
        width:"100%", display:"grid", gridTemplateColumns:"1fr 400px",
        gap:"72px", alignItems:"center", marginTop:"32px",
      }}>
        {/* LEFT */}
        <div>
          <div style={{
            display:"flex", alignItems:"center", gap:"10px",
            fontFamily:"var(--font-mono)", fontSize:"10px",
            color:"var(--accent)", letterSpacing:"0.22em",
            marginBottom:"28px",
          }}>
            <div style={{
              width:"6px", height:"6px", borderRadius:"50%",
              background:"var(--accent)", boxShadow:"0 0 10px var(--accent)",
            }}/>
            OPEN TO OPPORTUNITIES
          </div>

          <h1 className="font-display" style={{
            fontSize:"clamp(58px, 7.5vw, 96px)",
            lineHeight:0.95, letterSpacing:"-0.025em",
            marginBottom:"20px",
          }}>
            Ahmed<br/>
            <span style={{color:"var(--accent)", fontStyle:"italic"}}>Berrada</span>
          </h1>

          <div style={{
            fontFamily:"var(--font-mono)", fontSize:"clamp(14px, 2vw, 19px)",
            color:"var(--text-dim)", letterSpacing:"0.03em",
            marginBottom:"32px", display:"flex", alignItems:"center", gap:"10px",
          }}>
            <span style={{color:"var(--navy-light)"}}>▸</span>
            <span className="cursor">{typed}</span>
          </div>

          <p style={{
            fontSize:"15px", color:"var(--text-dim)", lineHeight:1.9,
            maxWidth:"530px", marginBottom:"44px",
          }}>
            Building intelligent systems at the intersection of{" "}
            <span style={{color:"var(--text)"}}>machine learning</span>,{" "}
            <span style={{color:"var(--text)"}}>quantitative finance</span>, and{" "}
            <span style={{color:"var(--text)"}}>data engineering</span>. I turn complex datasets into decisions that move markets.
          </p>

          <div style={{display:"flex", gap:"14px"}}>
            <button onClick={()=>document.getElementById("projects")?.scrollIntoView({behavior:"smooth"})}
              style={{
                fontFamily:"var(--font-mono)", fontSize:"11px", letterSpacing:"0.14em",
                padding:"14px 30px", background:"var(--accent)", color:"#000",
                border:"none", borderRadius:"2px", cursor:"pointer", fontWeight:600,
                transition:"all 0.2s",
              }}
              onMouseOver={e=>{e.currentTarget.style.opacity="0.88"; e.currentTarget.style.transform="translateY(-2px)";}}
              onMouseOut={e=>{e.currentTarget.style.opacity="1"; e.currentTarget.style.transform="translateY(0)";}}>
              VIEW PROJECTS
            </button>
            <button onClick={()=>document.getElementById("contact")?.scrollIntoView({behavior:"smooth"})}
              style={{
                fontFamily:"var(--font-mono)", fontSize:"11px", letterSpacing:"0.14em",
                padding:"14px 30px", background:"transparent", color:"var(--text-dim)",
                border:"1px solid var(--border-2)", borderRadius:"2px", cursor:"pointer",
                transition:"all 0.2s",
              }}
              onMouseOver={e=>{e.currentTarget.style.borderColor="var(--accent)"; e.currentTarget.style.color="var(--accent)";}}
              onMouseOut={e=>{e.currentTarget.style.borderColor="var(--border-2)"; e.currentTarget.style.color="var(--text-dim)";}}>
              GET IN TOUCH
            </button>
          </div>
        </div>

        {/* RIGHT — terminal card */}
        <div className="gold-border" style={{
          background:"var(--bg-2)", borderRadius:"8px", overflow:"hidden",
        }}>
          {/* Terminal header */}
          <div style={{
            padding:"12px 16px", background:"var(--bg-3)",
            borderBottom:"1px solid var(--border)",
            display:"flex", alignItems:"center", gap:"8px",
          }}>
            <div style={{width:"10px",height:"10px",borderRadius:"50%",background:"#e05c6e"}}/>
            <div style={{width:"10px",height:"10px",borderRadius:"50%",background:"var(--accent)"}}/>
            <div style={{width:"10px",height:"10px",borderRadius:"50%",background:"var(--navy-light)"}}/>
            <span style={{fontFamily:"var(--font-mono)", fontSize:"10px", color:"var(--text-muted)", marginLeft:"8px", letterSpacing:"0.1em"}}>
              portfolio_stats.py
            </span>
          </div>

          <div style={{padding:"22px"}}>
            <div style={{
              fontFamily:"var(--font-mono)", fontSize:"10px",
              color:"var(--text-muted)", letterSpacing:"0.15em",
              marginBottom:"14px", display:"flex", justifyContent:"space-between",
            }}>
              <span>PERFORMANCE</span>
              <span style={{color:"var(--accent)"}}>+41.3% YTD</span>
            </div>

            {/* Sparkline */}
            <svg width="100%" height="78" viewBox="0 0 320 78" style={{overflow:"visible", marginBottom:"18px"}}>
              <defs>
                <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.22"/>
                  <stop offset="100%" stopColor="var(--accent)" stopOpacity="0"/>
                </linearGradient>
              </defs>
              <path d={fillPath} fill="url(#goldGrad)"/>
              <path d={linePath} fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx={pts[pts.length-1].x} cy={pts[pts.length-1].y} r="4" fill="var(--accent)" opacity="0.9"/>
              <circle cx={pts[pts.length-1].x} cy={pts[pts.length-1].y} r="7" fill="none" stroke="var(--accent)" strokeWidth="1" opacity="0.35"/>
            </svg>

            {/* Stats grid */}
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px"}}>
              {[
                {label:"MODELS DEPLOYED", val:"12+"},
                {label:"DATA PIPELINES",  val:"8"},
                {label:"LANGUAGES",       val:"6"},
                {label:"PROJECTS",        val:"9"},
              ].map(s=>(
                <div key={s.label} style={{
                  background:"var(--bg-3)", borderRadius:"4px", padding:"14px 12px",
                  border:"1px solid var(--border)",
                }}>
                  <div style={{fontFamily:"var(--font-mono)", fontSize:"9px", color:"var(--text-muted)", letterSpacing:"0.15em", marginBottom:"6px"}}>{s.label}</div>
                  <div className="font-display" style={{fontSize:"26px", color:"var(--text)", lineHeight:1}}>{s.val}</div>
                </div>
              ))}
            </div>

            {/* Availability row */}
            <div style={{
              marginTop:"14px", padding:"10px 12px",
              background:"var(--accent-dim)", borderRadius:"4px",
              border:"1px solid var(--accent-glow)",
              display:"flex", alignItems:"center", gap:"8px",
            }}>
              <div style={{width:"6px",height:"6px",borderRadius:"50%",background:"var(--accent)",flexShrink:0}}/>
              <span style={{fontFamily:"var(--font-mono)", fontSize:"10px", color:"var(--accent)", letterSpacing:"0.1em"}}>
                AVAILABLE — JUNE 2025
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll hint */}
      <div style={{
        position:"absolute", bottom:"36px", left:"50%", transform:"translateX(-50%)",
        display:"flex", flexDirection:"column", alignItems:"center", gap:"8px",
        fontFamily:"var(--font-mono)", fontSize:"9px", color:"var(--text-muted)", letterSpacing:"0.22em",
      }}>
        SCROLL
        <div style={{width:"1px", height:"38px", background:"linear-gradient(to bottom, var(--text-muted), transparent)"}}/>
      </div>
    </section>
  );
}
