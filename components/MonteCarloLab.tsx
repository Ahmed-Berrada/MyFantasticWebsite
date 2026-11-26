"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { blackScholesCall, boxMuller, CallEstimator, type OptionParams } from "@/src/lib/montecarlo";
import { prng } from "@/src/lib/orderbook/flow";
import { useInView, usePrefersReducedMotion } from "@/src/lib/useInView";
import { fmtDec, fmtInt } from "@/src/lib/format";
import type { Dict } from "@/src/content";
import type { Lang } from "@/src/content/types";

const P: OptionParams = { s0: 100, k: 100, r: 0.05, sigma: 0.2, t: 1 };
const BS = blackScholesCall(P);
const STEPS = 64;
const MAX_DRAWN = 180;
const DRAW_PER_FRAME = 3;
const PAIRS_PER_FRAME = 5_000;
const SNAPSHOT_FRAMES = MAX_DRAWN / DRAW_PER_FRAME;
const SNAPSHOT_PAIRS = 1_700;
const TARGET_PATHS = 1_000_000;
const Y_MIN = 55;
const Y_MAX = 175;
const BINS = 48;
const HEIGHT = 300;

interface Stats {
  paths: number;
  price: number;
  ci: number;
}

interface Sim {
  paths: Float64Array[];
  hist: Uint32Array;
  est: CallEstimator;
  rand: () => number;
}

const newSim = (seed: number): Sim => ({ paths: [], hist: new Uint32Array(BINS), est: new CallEstimator(P), rand: prng(seed) });

/** Simulate one frame's worth of work: a few drawn paths, a histogram sample, and `pairs` priced pairs. */
function stepSim(s: Sim, pairs: number): void {
  const dt = P.t / STEPS;
  const drift = (P.r - (P.sigma * P.sigma) / 2) * dt;
  const vol = P.sigma * Math.sqrt(dt);
  for (let n = 0; n < DRAW_PER_FRAME && s.paths.length < MAX_DRAWN; n++) {
    const path = new Float64Array(STEPS + 1);
    path[0] = P.s0;
    for (let i = 1; i <= STEPS; i++) path[i] = path[i - 1] * Math.exp(drift + vol * boxMuller(s.rand));
    s.paths.push(path);
  }
  const tDrift = (P.r - (P.sigma * P.sigma) / 2) * P.t;
  const tVol = P.sigma * Math.sqrt(P.t);
  for (let i = 0; i < 400; i++) {
    const st = P.s0 * Math.exp(tDrift + tVol * boxMuller(s.rand));
    const b = Math.floor(((st - Y_MIN) / (Y_MAX - Y_MIN)) * BINS);
    if (b >= 0 && b < BINS) s.hist[b]++;
  }
  s.est.simulate(pairs, s.rand);
}

export default function MonteCarloLab({ t, lang }: { t: Dict["work"]["mcUi"]; lang: Lang }) {
  const reduced = usePrefersReducedMotion();
  const [wrapRef, seen] = useInView<HTMLDivElement>(0.25);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sim = useRef<Sim | null>(null);
  const runs = useRef(0);
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
  const [stats, setStats] = useState<Stats>({ paths: 0, price: 0, ci: Infinity });

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const s = sim.current;
    if (!canvas || !s) return;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    if (canvas.width !== Math.round(w * dpr)) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(HEIGHT * dpr);
    }
    const ctx = canvas.getContext("2d")!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, HEIGHT);

    const css = getComputedStyle(document.documentElement);
    const strong = css.getPropertyValue("--ink").trim();
    const grey = css.getPropertyValue("--line-2").trim();
    const ink2 = css.getPropertyValue("--ink-2").trim();
    const mono = getComputedStyle(canvas).getPropertyValue("--font-martian").trim() || "monospace";

    const histW = Math.min(90, w * 0.18);
    const plotW = w - histW - 8;
    const y = (v: number) => HEIGHT - ((v - Y_MIN) / (Y_MAX - Y_MIN)) * HEIGHT;

    ctx.lineWidth = 1;
    for (const path of s.paths) {
      const itm = path[STEPS] > P.k;
      ctx.strokeStyle = itm ? strong : grey;
      ctx.globalAlpha = itm ? 0.35 : 0.55;
      ctx.beginPath();
      for (let i = 0; i <= STEPS; i++) {
        const px = (i / STEPS) * plotW;
        if (i === 0) ctx.moveTo(px, y(path[0]));
        else ctx.lineTo(px, y(path[i]));
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    const max = Math.max(1, ...s.hist);
    const binH = HEIGHT / BINS;
    for (let b = 0; b < BINS; b++) {
      const v = Y_MIN + ((b + 0.5) / BINS) * (Y_MAX - Y_MIN);
      ctx.fillStyle = v > P.k ? strong : grey;
      ctx.globalAlpha = v > P.k ? 0.7 : 0.9;
      const len = (s.hist[b] / max) * histW;
      ctx.fillRect(w - histW, HEIGHT - (b + 1) * binH + 0.5, len, binH - 1);
    }
    ctx.globalAlpha = 1;

    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = ink2;
    ctx.beginPath();
    ctx.moveTo(0, y(P.k));
    ctx.lineTo(w, y(P.k));
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = ink2;
    ctx.font = `11px ${mono}`;
    ctx.fillText("K = 100", 6, y(P.k) - 6);
  }, []);

  const publish = useCallback(() => {
    const e = sim.current!.est;
    setStats({ paths: e.paths, price: e.price, ci: e.ci95 });
  }, []);

  // A cheap snapshot as soon as the lab is visible, so the panel is never empty. No animation, no loop.
  useEffect(() => {
    if (!seen || sim.current) return;
    sim.current = newSim(17);
    for (let i = 0; i < SNAPSHOT_FRAMES; i++) stepSim(sim.current, SNAPSHOT_PAIRS);
    draw();
    publish();
  }, [seen, draw, publish]);

  // The animated run: one frame of work per animation frame, until the target is reached.
  useEffect(() => {
    if (phase !== "running") return;
    sim.current = newSim(17 + runs.current);
    let raf = 0;
    const loop = () => {
      stepSim(sim.current!, PAIRS_PER_FRAME);
      draw();
      publish();
      if (sim.current!.est.paths < TARGET_PATHS) raf = requestAnimationFrame(loop);
      else setPhase("done");
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [phase, draw, publish]);

  // Started only on request. With reduced motion the result is computed at once and shown without animation.
  const start = () => {
    runs.current += 1;
    if (reduced) {
      sim.current = newSim(17 + runs.current);
      while (sim.current.est.paths < TARGET_PATHS) stepSim(sim.current, PAIRS_PER_FRAME);
      draw();
      publish();
      setPhase("done");
    } else {
      setPhase("running");
    }
  };

  useEffect(() => {
    const ro = new ResizeObserver(() => draw());
    if (canvasRef.current) ro.observe(canvasRef.current);
    return () => ro.disconnect();
  }, [draw]);

  const err = stats.paths ? Math.abs(stats.price - BS) : null;

  return (
    <div ref={wrapRef} className="overflow-hidden rounded-[6px] border border-line-2 bg-sheet">
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
        <p className="font-mono text-xs text-ink-2">{t.header}</p>
        <button
          onClick={start}
          disabled={phase === "running"}
          className="shrink-0 rounded-[3px] border border-line px-2.5 py-1 font-mono text-[11px] text-ink-2 transition-colors hover:border-ink hover:text-ink active:translate-y-px disabled:opacity-40"
        >
          {t.run}
        </button>
      </div>
      <canvas ref={canvasRef} className="block w-full" style={{ height: HEIGHT }} role="img" aria-label={t.aria} />
      <div className="grid grid-cols-2 border-t border-line sm:grid-cols-4">
        <Cell label={t.paths} value={fmtInt(stats.paths, lang)} />
        <Cell label={t.monteCarlo} value={stats.paths ? `${fmtDec(stats.price, lang, 3)} ± ${fmtDec(stats.ci, lang, 3)}` : "–"} accent />
        <Cell label={t.blackScholes} value={fmtDec(BS, lang, 3)} />
        <Cell label={t.absError} value={err == null ? "–" : fmtDec(err, lang, 4)} />
      </div>
    </div>
  );
}

function Cell({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="border-line px-4 py-2.5 odd:border-r sm:not-last:border-r">
      <p className="font-mono text-[10px] text-muted">{label}</p>
      <p className={`font-mono text-[13px] whitespace-nowrap tabular ${accent ? "text-ink" : ""}`}>{value}</p>
    </div>
  );
}
