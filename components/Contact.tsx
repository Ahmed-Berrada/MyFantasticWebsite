"use client";
import { useEffect, useRef, useState } from "react";

const socials = [
  {label:"LinkedIn", handle:"/in/ahmedberrada", url:"#", icon:"in"},
  {label:"GitHub",   handle:"ahmedberrada",     url:"#", icon:"gh"},
  {label:"Email",    handle:"ahmed.berrada@example.com", url:"mailto:ahmed.berrada@example.com", icon:"@"},
  {label:"Twitter/X",handle:"@ahmedberrada",url:"#", icon:"𝕏"},
];

export default function Contact() {
  const ref = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [form, setForm]   = useState({name:"", email:"", message:""});
  const [sent, setSent]   = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.1 }
    );
    ref.current?.querySelectorAll(".fade-in").forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const copyEmail = () => {
    navigator.clipboard.writeText("ahmed.berrada@example.com");
    setCopied(true); setTimeout(()=>setCopied(false), 2000);
  };

  return (
    <section id="contact" ref={ref} style={{
      background:"var(--bg-2)",
      borderTop:"1px solid var(--border)",
      padding:"130px 0 80px",
    }}>
      <div style={{ maxWidth:"1140px", margin:"0 auto", padding:"0 48px" }}>
        <div className="fade-in" style={{
          display:"flex", alignItems:"center", gap:"16px",
          fontFamily:"var(--font-mono)", fontSize:"10px", color:"var(--text-muted)",
          letterSpacing:"0.22em", marginBottom:"52px",
        }}>
          <span style={{color:"var(--accent)"}}>04</span>
          <div style={{flex:1, height:"1px", background:"linear-gradient(90deg, var(--border-2), transparent)"}}/>
          CONTACT
          <div style={{flex:1, height:"1px", background:"linear-gradient(270deg, var(--border-2), transparent)"}}/>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"88px", alignItems:"start" }}>
          {/* LEFT */}
          <div>
            <h2 className="fade-in font-display" style={{
              fontSize:"clamp(34px, 5vw, 56px)", lineHeight:1.08,
              letterSpacing:"-0.025em", marginBottom:"24px",
            }}>
              Let&apos;s build something{" "}
              <span style={{color:"var(--accent)", fontStyle:"italic"}}>together.</span>
            </h2>

            <p className="fade-in" style={{fontSize:"15px", color:"var(--text-dim)", lineHeight:1.9, marginBottom:"40px"}}>
              Actively seeking full-time roles in data science, AI engineering, and quantitative analysis. Open to fintechs, hedge funds, and research-driven organisations. Always happy to connect over interesting problems.
            </p>

            {/* Copy email */}
            <div className="fade-in" style={{marginBottom:"32px"}}>
              <button onClick={copyEmail} style={{
                display:"flex", alignItems:"center", gap:"12px",
                background:"var(--bg-3)", border:"1px solid var(--border)",
                borderRadius:"6px", padding:"14px 18px", cursor:"pointer",
                width:"100%", transition:"border-color 0.2s",
              }}
              onMouseOver={e=>e.currentTarget.style.borderColor="var(--accent)"}
              onMouseOut={e=>e.currentTarget.style.borderColor="var(--border)"}>
                <span style={{fontFamily:"var(--font-mono)", fontSize:"13px", color:"var(--text)", flex:1, textAlign:"left"}}>
                  ahmed.berrada@example.com
                </span>
                <span style={{fontFamily:"var(--font-mono)", fontSize:"10px", letterSpacing:"0.12em", color: copied ? "var(--accent)" : "var(--text-muted)", transition:"color 0.2s"}}>
                  {copied ? "COPIED ✓" : "COPY"}
                </span>
              </button>
            </div>

            {/* Socials */}
            <div className="fade-in" style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px"}}>
              {socials.map(s=>(
                <a key={s.label} href={s.url} style={{
                  display:"flex", alignItems:"center", gap:"12px",
                  padding:"12px 14px", background:"var(--bg-3)",
                  border:"1px solid var(--border)", borderRadius:"6px",
                  textDecoration:"none", transition:"all 0.2s",
                }}
                onMouseOver={e=>{e.currentTarget.style.borderColor="var(--accent)"; (e.currentTarget as HTMLElement).style.transform="translateY(-1px)";}}
                onMouseOut={e=>{e.currentTarget.style.borderColor="var(--border)"; (e.currentTarget as HTMLElement).style.transform="translateY(0)";}}>
                  <span style={{fontFamily:"var(--font-mono)", fontSize:"14px", color:"var(--accent)", width:"20px", textAlign:"center"}}>{s.icon}</span>
                  <div>
                    <div style={{fontSize:"12px", color:"var(--text)", fontWeight:500}}>{s.label}</div>
                    <div style={{fontFamily:"var(--font-mono)", fontSize:"10px", color:"var(--text-muted)"}}>{s.handle}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* RIGHT — form */}
          <div className="fade-in gold-border" style={{background:"var(--bg)", borderRadius:"8px", padding:"32px"}}>
            {sent ? (
              <div style={{textAlign:"center", padding:"48px 0"}}>
                <div className="font-display" style={{fontSize:"52px", color:"var(--accent)", marginBottom:"12px"}}>✓</div>
                <div className="font-display" style={{fontSize:"26px", color:"var(--text)", marginBottom:"8px"}}>Message sent.</div>
                <div style={{fontFamily:"var(--font-mono)", fontSize:"11px", color:"var(--text-muted)"}}>I&apos;ll be in touch shortly.</div>
              </div>
            ) : (
              <>
                <div style={{fontFamily:"var(--font-mono)", fontSize:"10px", color:"var(--text-muted)", letterSpacing:"0.2em", marginBottom:"24px"}}>
                  SEND A MESSAGE
                </div>
                <div style={{display:"flex", flexDirection:"column", gap:"16px"}}>
                  {[{key:"name",label:"Your name",type:"text"},{key:"email",label:"Your email",type:"email"}].map(f=>(
                    <div key={f.key}>
                      <label style={{fontFamily:"var(--font-mono)", fontSize:"10px", color:"var(--text-muted)", letterSpacing:"0.12em", display:"block", marginBottom:"6px"}}>
                        {f.label.toUpperCase()}
                      </label>
                      <input type={f.type} value={form[f.key as keyof typeof form]}
                        onChange={e=>setForm({...form,[f.key]:e.target.value})}
                        style={{
                          width:"100%", background:"var(--bg-2)", border:"1px solid var(--border)",
                          borderRadius:"4px", padding:"11px 14px", color:"var(--text)",
                          fontSize:"14px", fontFamily:"var(--font-body)", outline:"none", transition:"border-color 0.2s",
                        }}
                        onFocus={e=>e.target.style.borderColor="var(--accent)"}
                        onBlur={e=>e.target.style.borderColor="var(--border)"}
                      />
                    </div>
                  ))}
                  <div>
                    <label style={{fontFamily:"var(--font-mono)", fontSize:"10px", color:"var(--text-muted)", letterSpacing:"0.12em", display:"block", marginBottom:"6px"}}>
                      MESSAGE
                    </label>
                    <textarea rows={5} value={form.message} onChange={e=>setForm({...form,message:e.target.value})}
                      style={{
                        width:"100%", background:"var(--bg-2)", border:"1px solid var(--border)",
                        borderRadius:"4px", padding:"11px 14px", color:"var(--text)",
                        fontSize:"14px", fontFamily:"var(--font-body)", outline:"none",
                        resize:"vertical", transition:"border-color 0.2s",
                      }}
                      onFocus={e=>e.target.style.borderColor="var(--accent)"}
                      onBlur={e=>e.target.style.borderColor="var(--border)"}
                    />
                  </div>
                  <button onClick={()=>setSent(true)} style={{
                    fontFamily:"var(--font-mono)", fontSize:"11px", letterSpacing:"0.14em",
                    padding:"14px", background:"var(--accent)", color:"#000",
                    border:"none", borderRadius:"4px", cursor:"pointer", fontWeight:600,
                    transition:"opacity 0.2s", marginTop:"4px",
                  }}
                  onMouseOver={e=>e.currentTarget.style.opacity="0.87"}
                  onMouseOut={e=>e.currentTarget.style.opacity="1"}>
                    SEND MESSAGE →
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          marginTop:"80px", paddingTop:"28px", borderTop:"1px solid var(--border)",
          display:"flex", justifyContent:"space-between", alignItems:"center",
        }}>
          <span style={{fontFamily:"var(--font-mono)", fontSize:"11px", color:"var(--text-muted)"}}>
            © 2026 Ahmed Berrada
          </span>
          <span style={{fontFamily:"var(--font-mono)", fontSize:"11px", color:"var(--text-muted)"}}>
            Built with <span style={{color:"var(--accent)"}}>Next.js</span> + <span style={{color:"var(--accent)"}}>Tailwind</span>
          </span>
        </div>
      </div>
    </section>
  );
}
