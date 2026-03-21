"use client";

export default function Hero() {
  return (
    <section
      id="hero"
      style={{
        minHeight: "72vh",
        display: "flex",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
        paddingTop: "84px",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse 90% 80% at 45% 20%, #0d1f4a22 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          maxWidth: "1140px",
          margin: "0 auto",
          padding: "0 48px",
          width: "100%",
        }}
      >
        <div style={{ maxWidth: "760px" }}>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              color: "var(--accent)",
              letterSpacing: "0.14em",
              marginBottom: "16px",
            }}
          >
            COMPUTER SCIENCE STUDENT · CLASS OF 2027
          </div>

          <h1
            className="font-display"
            style={{
              fontSize: "clamp(48px, 8vw, 96px)",
              lineHeight: 0.98,
              letterSpacing: "-0.02em",
              marginBottom: "16px",
            }}
          >
            Ahmed Berrada
          </h1>

          <p
            style={{
              fontSize: "19px",
              color: "var(--text-dim)",
              lineHeight: 1.85,
              maxWidth: "700px",
            }}
          >
            I am a Computer Science student building practical projects in data, AI, and finance-oriented engineering,
            with a focus on reliable systems and real-world impact.
          </p>
        </div>
      </div>
    </section>
  );
}
