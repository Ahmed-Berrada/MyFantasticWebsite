"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { blackScholesCall, boxMuller, CallEstimator, type OptionParams } from "@/src/lib/montecarlo";
import { prng } from "@/src/lib/orderbook/flow";
import { useInView, usePrefersReducedMotion } from "@/src/lib/useInView";

const P: OptionParams = { s0: 100, k: 100, r: 0.05, sigma: 0.2, t: 1 };
const BS = blackScholesCall(P);
const STEPS = 64;
const MAX_DRAWN = 180;
const DRAW_PER_FRAME = 3;
const PAIRS_PER_FRAME = 5_000;
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

export default function MonteCarloLab() {
  const reduced = usePrefersReducedMotion();
  const [wrapRef, seen] = useInView<HTMLDivElement>(0.25);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [run, setRun] = useState(0);
  const [stats, setStats] = useState<Stats>({ paths: 0, price: 0, ci: Infinity });

  // Mutable simulation state, rebuilt on each run.
  const sim = useRef<{ paths: Float64Array[]; hist: Uint32Array; est: CallEstimator; rand: () => number } | null>(null);

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
    const signal = css.getPropertyValue("--ink").trim();
    const grey = css.getPropertyValue("--line-2").trim();
    const ink = css.getPropertyValue("--ink-2").trim();

    const histW = Math.min(90, w * 0.18);
    const plotW = w - histW - 8;
    const y = (v: number) => HEIGHT - ((v - Y_MIN) / (Y_MAX - Y_MIN)) * HEIGHT;

    // Paths
    ctx.lineWidth = 1;
    for (const path of s.paths) {
      const itm = path[STEPS] > P.k;
      ctx.strokeStyle = itm ? signal : grey;
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

    // Terminal distribution
    const max = Math.max(1, ...s.hist);
    const binH = HEIGHT / BINS;
    for (let b = 0; b < BINS; b++) {
      const v = Y_MIN + ((b + 0.5) / BINS) * (Y_MAX - Y_MIN);
      ctx.fillStyle = v > P.k ? signal : grey;
      ctx.globalAlpha = v > P.k ? 0.7 : 0.9;
      const len = (s.hist[b] / max) * histW;
      ctx.fillRect(w - histW, HEIGHT - (b + 1) * binH + 0.5, len, binH - 1);
    }
    ctx.globalAlpha = 1;

    // Strike
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = ink;
    ctx.beginPath();
    ctx.moveTo(0, y(P.k));
    ctx.lineTo(w, y(P.k));
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = ink;
    ctx.font = "11px var(--font-plex-mono), monospace";
    ctx.fillText("K = 100", 6, y(P.k) - 6);
  }, []);

  const stepSim = useCallback((drawn: number) => {
    const s = sim.current!;
    const dt = P.t / STEPS;
    const drift = (P.r - (P.sigma * P.sigma) / 2) * dt;
    const vol = P.sigma * Math.sqrt(dt);
    for (let n = 0; n < DRAW_PER_FRAME && drawn + n < MAX_DRAWN; n++) {
      const path = new Float64Array(STEPS + 1);
      path[0] = P.s0;
      for (let i = 1; i <= STEPS; i++) path[i] = path[i - 1] * Math.exp(drift + vol * boxMuller(s.rand));
      s.paths.push(path);
    }
    // Histogram from a sample of terminal prices, priced alongside.
    const tDrift = (P.r - (P.sigma * P.sigma) / 2) * P.t;
    const tVol = P.sigma * Math.sqrt(P.t);
    for (let i = 0; i < 400; i++) {
      const st = P.s0 * Math.exp(tDrift + tVol * boxMuller(s.rand));
      const b = Math.floor(((st - Y_MIN) / (Y_MAX - Y_MIN)) * BINS);
      if (b >= 0 && b < BINS) s.hist[b]++;
    }
    s.est.simulate(PAIRS_PER_FRAME, s.rand);
  }, []);

  useEffect(() => {
    if (!seen) return;
    sim.current = { paths: [], hist: new Uint32Array(BINS), est: new CallEstimator(P), rand: prng(17 + run) };
    const publish = () => {
      const e = sim.current!.est;
      setStats({ paths: e.paths, price: e.price, ci: e.ci95 });
    };

    if (reduced) {
      while (sim.current.est.paths < TARGET_PATHS) stepSim(sim.current.paths.length);
      draw();
      publish();
      return;
    }

    let raf = 0;
    const loop = () => {
      stepSim(sim.current!.paths.length);
      draw();
      publish();
      if (sim.current!.est.paths < TARGET_PATHS) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [seen, run, reduced, draw, stepSim]);

  useEffect(() => {
    const ro = new ResizeObserver(() => draw());
    if (canvasRef.current) ro.observe(canvasRef.current);
    return () => ro.disconnect();
  }, [draw]);

  const done = stats.paths >= TARGET_PATHS;
  const err = stats.paths ? Math.abs(stats.price - BS) : null;

  return (
    <div ref={wrapRef} className="overflow-hidden rounded-xl border border-line-2 bg-sheet">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <p className="font-mono text-xs text-ink-2">
          European call · S₀ 100 · K 100 · σ 20% · r 5% · 1y
        </p>
        <button
          onClick={() => setRun((r) => r + 1)}
          disabled={!done}
          className="grid size-8 place-items-center rounded-md border border-line text-ink-2 transition-colors hover:border-ink disabled:opacity-40"
          aria-label="Run the simulation again"
        >
          <RotateCcw size={14} />
        </button>
      </div>
      <canvas
        ref={canvasRef}
        className="block w-full"
        style={{ height: HEIGHT }}
        role="img"
        aria-label="Simulated geometric Brownian motion price paths, coloured by whether they finish above the strike, with the distribution of terminal prices."
      />
      <div className="grid grid-cols-2 border-t border-line sm:grid-cols-4">
        <Cell label="Paths" value={stats.paths.toLocaleString("en-US")} />
        <Cell
          label="Monte Carlo"
          value={stats.paths ? `${stats.price.toFixed(3)} ± ${stats.ci.toFixed(3)}` : "–"}
          accent
        />
        <Cell label="Black-Scholes" value={BS.toFixed(3)} />
        <Cell label="Abs. error" value={err == null ? "–" : err.toFixed(4)} />
      </div>
    </div>
  );
}

function Cell({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="border-line px-4 py-2.5 odd:border-r sm:not-last:border-r">
      <p className="font-mono text-[10px] tracking-wider text-muted uppercase">{label}</p>
      <p className={`font-mono text-[13px] whitespace-nowrap tabular ${accent ? "text-ink" : ""}`}>{value}</p>
    </div>
  );
}
