"use client";
import { useEffect, useState } from "react";

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
];

const roles = ["Finance.", "AI.", "Data."];

export default function Hero() {
    const [roleIndex, setRoleIndex] = useState(0);
    const [fade, setFade] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setFade(false);
            setTimeout(() => {
                setRoleIndex(i => (i + 1) % roles.length);
                setFade(true);
            }, 350);
        }, 2200);
        return () => clearInterval(interval);
    }, []);

    const all = [...tickers, ...tickers];

    return (
        <section style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            position: "relative",
            overflow: "hidden",
            background: "var(--bg)",
        }}>

            {/* Ambient glow — top left navy */}
            <div style={{
                position: "absolute", top: "-15%", left: "-10%",
                width: "600px", height: "600px", borderRadius: "50%",
                background: "radial-gradient(circle, #1a3a6b28 0%, transparent 68%)",
                pointerEvents: "none",
            }}/>
            {/* Ambient glow — bottom right gold */}
            <div style={{
                position: "absolute", bottom: "-10%", right: "-5%",
                width: "500px", height: "500px", borderRadius: "50%",
                background: "radial-gradient(circle, #c8a84b0d 0%, transparent 65%)",
                pointerEvents: "none",
            }}/>

            {/* ── Ticker ── */}
            <div style={{
                position: "absolute", top: "78px", left: 0, right: 0,
                borderBottom: "1px solid var(--border)",
                background: "var(--bg-2)",
                overflow: "hidden", padding: "8px 0", zIndex: 10,
            }}>
                <div className="ticker-inner">
                    {all.map((t, i) => (
                        <span key={i} style={{
                            fontFamily: "var(--font-mono)", fontSize: "10px",
                            padding: "0 28px", whiteSpace: "nowrap",
                            color: "var(--text-dim)",
                            borderRight: "1px solid var(--border)",
                        }}>
              <span style={{ color: "var(--text)", letterSpacing: "0.05em" }}>{t.sym}</span>
                            {" "}
                            <span style={{ color: t.pos ? "var(--accent)" : "#e05c6e" }}>{t.val}</span>
            </span>
                    ))}
                </div>
            </div>

            {/* ── Centered hero content ── */}
            <div style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                padding: "120px 48px 80px",
                position: "relative", zIndex: 1,
            }}>

                {/* Status pill */}
                <div style={{
                    display: "inline-flex", alignItems: "center", gap: "8px",
                    border: "1px solid var(--border-2)",
                    borderRadius: "100px",
                    padding: "6px 16px",
                    marginBottom: "52px",
                    background: "var(--bg-2)",
                }}>
                    <div style={{
                        width: "5px", height: "5px", borderRadius: "50%",
                        background: "var(--accent)",
                        boxShadow: "0 0 8px var(--accent)",
                    }}/>
                    <span style={{
                        fontFamily: "var(--font-mono)", fontSize: "10px",
                        color: "var(--text-muted)", letterSpacing: "0.18em",
                    }}>
            CS STUDENT · CLASS OF 2027
          </span>
                </div>

                {/* Name */}
                <h1 className="font-display" style={{
                    fontSize: "clamp(64px, 10vw, 120px)",
                    lineHeight: 0.92,
                    letterSpacing: "-0.035em",
                    marginBottom: "32px",
                    color: "var(--text)",
                }}>
                    Ahmed
                    <br/>
                    <span style={{ color: "var(--accent)", fontStyle: "italic" }}>Berrada</span>
                </h1>

                {/* Role switcher */}
                <div style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    gap: "14px", marginBottom: "36px",
                    height: "32px",
                }}>
                    <div style={{
                        width: "32px", height: "1px",
                        background: "linear-gradient(90deg, transparent, var(--border-2))",
                    }}/>
                    <span style={{
                        fontFamily: "var(--font-mono)", fontSize: "13px",
                        color: "var(--text-dim)", letterSpacing: "0.1em",
                    }}>
            Breaking into
          </span>
                    <span
                        className="font-display"
                        style={{
                            fontSize: "22px",
                            color: "var(--accent)",
                            fontStyle: "italic",
                            letterSpacing: "-0.01em",
                            opacity: fade ? 1 : 0,
                            transform: fade ? "translateY(0)" : "translateY(6px)",
                            transition: "opacity 0.35s ease, transform 0.35s ease",
                            minWidth: "80px",
                            textAlign: "left",
                        }}
                    >
            {roles[roleIndex]}
          </span>
                    <div style={{
                        width: "32px", height: "1px",
                        background: "linear-gradient(90deg, var(--border-2), transparent)",
                    }}/>
                </div>

                {/* One-liner */}
                <p style={{
                    fontSize: "15px",
                    color: "var(--text-muted)",
                    lineHeight: 1.8,
                    maxWidth: "440px",
                    marginBottom: "52px",
                    fontWeight: 300,
                }}>
                    Building at the intersection of markets, machine learning,
                    and data — one project at a time.
                </p>

                {/* CTAs */}
                <div style={{ display: "flex", gap: "12px" }}>
                    <button
                        onClick={() => document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })}
                        style={{
                            fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.14em",
                            padding: "13px 28px", background: "var(--accent)", color: "#000",
                            border: "none", borderRadius: "2px", cursor: "pointer", fontWeight: 600,
                            transition: "all 0.2s",
                        }}
                        onMouseOver={e => { e.currentTarget.style.opacity = "0.85"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                        onMouseOut={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}
                    >
                        VIEW PROJECTS
                    </button>
                    <button
                        onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
                        style={{
                            fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.14em",
                            padding: "13px 28px", background: "transparent", color: "var(--text-dim)",
                            border: "1px solid var(--border-2)", borderRadius: "2px", cursor: "pointer",
                            transition: "all 0.2s",
                        }}
                        onMouseOver={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; }}
                        onMouseOut={e => { e.currentTarget.style.borderColor = "var(--border-2)"; e.currentTarget.style.color = "var(--text-dim)"; }}
                    >
                        GET IN TOUCH
                    </button>
                </div>
            </div>

            {/* ── Bottom rule ── */}
            <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0,
                height: "1px",
                background: "linear-gradient(90deg, transparent, var(--border-2) 30%, var(--accent-glow) 50%, var(--border-2) 70%, transparent)",
            }}/>

            {/* Scroll hint */}
            <div style={{
                position: "absolute", bottom: "28px", left: "50%",
                transform: "translateX(-50%)",
                display: "flex", flexDirection: "column", alignItems: "center", gap: "8px",
                fontFamily: "var(--font-mono)", fontSize: "9px",
                color: "var(--text-muted)", letterSpacing: "0.22em",
            }}>
                SCROLL
                <div style={{
                    width: "1px", height: "32px",
                    background: "linear-gradient(to bottom, var(--text-muted), transparent)",
                }}/>
            </div>
        </section>
    );
}