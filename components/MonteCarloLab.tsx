"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useInView, usePrefersReducedMotion } from "@/src/lib/useInView";
import { fill, fmtDec, fmtInt } from "@/src/lib/format";
import { BINS, BS, P, STEPS, Y_MAX, Y_MIN } from "@/src/lib/mcsim";
import type { WorkerIn, WorkerOut } from "@/src/lib/montecarlo.worker";
import type { Dict } from "@/src/content";
import type { Lang } from "@/src/content/types";

const HEIGHT = 300;
const SEED = 17;

interface Stats {
  paths: number;
  price: number;
  ci: number;
}

interface View {
  paths: Float64Array[];
  hist: Uint32Array;
}

/**
 * The simulation runs in a Web Worker, so the page stays responsive however slow the device is.
 * This component only draws what the worker sends: price paths, the terminal-price histogram and the estimate.
 */
export default function MonteCarloLab({ t, lang }: { t: Dict["work"]["mcUi"]; lang: Lang }) {
  const reduced = usePrefersReducedMotion();
  const [wrapRef, seen] = useInView<HTMLDivElement>(0.25);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const workerRef = useRef<Worker | null>(null);
  const view = useRef<View>({ paths: [], hist: new Uint32Array(BINS) });
  const frame = useRef(0);
  const palette = useRef<{ width: number; strong: string; grey: string; ink2: string; sheet: string; mono: string } | null>(null);
  const runs = useRef(0);
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
  const [stats, setStats] = useState<Stats>({ paths: 0, price: 0, ci: Infinity });

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const s = view.current;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    if (canvas.width !== Math.round(w * dpr)) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(HEIGHT * dpr);
    }
    const ctx = canvas.getContext("2d")!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, HEIGHT);

    // Theme colours and font are read once per size change, not on every frame of a run.
    if (!palette.current || canvas.width !== palette.current.width) {
      const css = getComputedStyle(document.documentElement);
      palette.current = {
        width: canvas.width,
        strong: css.getPropertyValue("--ink").trim(),
        grey: css.getPropertyValue("--line-2").trim(),
        ink2: css.getPropertyValue("--ink-2").trim(),
        sheet: css.getPropertyValue("--sheet").trim(),
        mono: getComputedStyle(canvas).getPropertyValue("--font-martian").trim() || "monospace",
      };
    }
    const { strong, grey, ink2, sheet, mono } = palette.current;

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
    // The strike label sits on a sheet-coloured backing so the paths do not run through it.
    ctx.font = `11px ${mono}`;
    const label = `K = ${P.k}`;
    const lw = ctx.measureText(label).width;
    ctx.fillStyle = sheet;
    ctx.fillRect(2, y(P.k) - 19, lw + 8, 15);
    ctx.fillStyle = ink2;
    ctx.fillText(label, 6, y(P.k) - 7);
  }, []);

  /** Coalesce bursts of worker messages into one repaint per animation frame. */
  const scheduleDraw = useCallback(() => {
    if (frame.current) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      draw();
    });
  }, [draw]);

  // Start the worker when the lab first scrolls into view; it answers with a first snapshot.
  useEffect(() => {
    if (!seen || workerRef.current) return;
    let worker: Worker;
    try {
      worker = new Worker(new URL("../src/lib/montecarlo.worker.ts", import.meta.url), { type: "module" });
    } catch {
      return; // no worker support: the panel stays empty rather than freezing the page
    }
    worker.onmessage = (e: MessageEvent<WorkerOut>) => {
      const m = e.data;
      if (m.reset) view.current = { paths: [], hist: new Uint32Array(BINS) };
      view.current.paths.push(...m.newPaths);
      view.current.hist = m.hist;
      setStats({ paths: m.paths, price: m.price, ci: m.ci });
      if (m.done) setPhase("done");
      scheduleDraw();
    };
    workerRef.current = worker;
    worker.postMessage({ type: "snapshot", seed: SEED } satisfies WorkerIn);
  }, [seen, scheduleDraw]);

  useEffect(
    () => () => {
      workerRef.current?.terminate();
      workerRef.current = null;
      cancelAnimationFrame(frame.current);
    },
    [],
  );

  useEffect(() => {
    const ro = new ResizeObserver(() => draw());
    if (canvasRef.current) ro.observe(canvasRef.current);
    return () => ro.disconnect();
  }, [draw]);

  // Only on request. With reduced motion the worker answers once, with the finished result.
  const start = () => {
    if (!workerRef.current || phase === "running") return;
    runs.current += 1;
    setPhase("running");
    workerRef.current.postMessage({ type: "run", seed: SEED + runs.current, instant: reduced } satisfies WorkerIn);
  };

  const err = stats.paths ? Math.abs(stats.price - BS) : null;

  return (
    <div ref={wrapRef} className="overflow-hidden rounded-[6px] border border-line-2 bg-sheet">
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
        <p className="font-mono text-xs text-ink-2">{t.header}</p>
        {/* aria-disabled rather than disabled, so a keyboard user's focus stays on the button during the run. */}
        <button
          type="button"
          onClick={start}
          aria-disabled={phase === "running"}
          className="demo-button shrink-0 aria-disabled:cursor-progress aria-disabled:opacity-60"
        >
          {phase === "running" ? t.running : phase === "done" ? t.runAgain : t.run}
        </button>
      </div>
      <canvas ref={canvasRef} className="block w-full" style={{ height: HEIGHT }} role="img" aria-label={t.aria} />
      <p role="status" className="sr-only">
        {phase === "done"
          ? fill(t.done, { price: fmtDec(stats.price, lang, 3), ci: fmtDec(stats.ci, lang, 3), paths: fmtInt(stats.paths, lang), bs: fmtDec(BS, lang, 3) })
          : ""}
      </p>
      {/* Four columns only when the panel itself is wide: in the half-width column at 1024 px they would collide. */}
      <div className="@container border-t border-line">
      <div className="grid grid-cols-2 @lg:grid-cols-4">
        <Cell label={t.paths} value={fmtInt(stats.paths, lang)} />
        <Cell label={t.monteCarlo} value={stats.paths ? `${fmtDec(stats.price, lang, 3)} ± ${fmtDec(stats.ci, lang, 3)}` : "–"} accent />
        <Cell label={t.blackScholes} value={fmtDec(BS, lang, 3)} />
        <Cell label={t.absError} value={err == null ? "–" : fmtDec(err, lang, 4)} />
      </div>
      </div>
    </div>
  );
}

function Cell({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="border-line px-4 py-2.5 odd:border-r @lg:not-last:border-r">
      <p className="font-mono text-[10px] text-muted">{label}</p>
      <p className={`font-mono text-[13px] whitespace-nowrap tabular ${accent ? "text-ink" : ""}`}>{value}</p>
    </div>
  );
}
