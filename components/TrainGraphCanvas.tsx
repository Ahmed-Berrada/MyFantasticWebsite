"use client";
import { useEffect, useRef, useState } from "react";
import { fill } from "@/src/lib/format";
import { TrainGraph, type Train } from "@/src/lib/traingraph";
import { usePrefersReducedMotion } from "@/src/lib/useInView";

const SIM_SPEED = 9; // simulated seconds per real second
const ORIGIN_S = 6 * 3600 + 41 * 60; // the simulated clock starts at 06:41

function clock(simS: number): string {
  const s = ((ORIGIN_S + simS) % 86400 + 86400) % 86400;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${sec.toFixed(1).padStart(4, "0")}`;
}

/** Plain strings so a server page can pass them. Placeholders: {id} {dir} {station} {s}. */
interface Labels {
  train: string;
  down: string;
  up: string;
  dwell: string;
  run: string;
  hint: string;
  hintTouch: string;
  aria: string;
}


interface Props {
  labels: Labels;
  /**
   * Where text sits over the graph: while `query` matches, the left `fraction` of the canvas is under the
   * headline, so the pointer there reads nothing and the readout never draws into it.
   */
  covered?: { query: string; fraction: number };
}

/** Idle frames are drawn at about 30 per second; a moving pointer is drawn at the display's rate. */
const IDLE_FRAME_MS = 33;
/** On touch, the reading stays on screen this long after the finger lifts. */
const TOUCH_HOLD_MS = 2500;

export default function TrainGraphCanvas({ labels, covered }: Props) {
  const coverQuery = covered?.query;
  const coverFraction = covered?.fraction ?? 0;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = usePrefersReducedMotion();
  const [graph] = useState(() => new TrainGraph(41));
  const state = useRef({ now: 0, pointer: null as { x: number; y: number } | null, dirty: true });
  const labelsRef = useRef(labels);
  useEffect(() => {
    labelsRef.current = labels;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const s = state.current;
    const coveredQuery = coverQuery ? window.matchMedia(coverQuery) : null;
    /** Left edge of the readable part of the canvas, in CSS pixels. */
    const readableFrom = () => (coveredQuery?.matches ? width * coverFraction : 0);
    let raf = 0;
    let last = performance.now();
    let width = 0;
    let height = 0;
    let colors = { ink: "#121417", ink2: "#3b4048", muted: "#5d636d", line: "#d3d7dd", accent: "#ffc400", ground: "#eceef0" };
    let monoFont = "monospace";

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const css = getComputedStyle(document.documentElement);
      const v = (n: string) => css.getPropertyValue(n).trim();
      colors = { ink: v("--ink"), ink2: v("--ink-2"), muted: v("--muted"), line: v("--line"), accent: v("--accent"), ground: v("--ground") };
      monoFont = getComputedStyle(canvas).getPropertyValue("--font-martian").trim() || "monospace";
      draw();
    };

    const pxPerS = () => Math.max(0.55, width / 1500);
    const xOf = (t: number) => width - (s.now - t) * pxPerS() - 24;
    const top = 28;
    const plotH = () => height - top - 34;
    const yOf = (y: number) => top + y * plotH();

    const drawTrain = (tr: Train, t0: number, t1: number) => {
      ctx.beginPath();
      let started = false;
      for (const w of tr.path) {
        if (w.t < t0 - 200 || w.t > t1 + 200) continue;
        const x = xOf(w.t);
        const y = yOf(w.y);
        if (!started) {
          ctx.moveTo(x, y);
          started = true;
        } else ctx.lineTo(x, y);
      }
      ctx.stroke();
    };

    const draw = () => {
      s.dirty = false;
      const g = graph;
      const L = labelsRef.current;
      ctx.clearRect(0, 0, width, height);
      const tLeft = s.now - width / pxPerS();
      const tRight = s.now + 60;

      // Station rules
      ctx.lineWidth = 1;
      ctx.strokeStyle = colors.line;
      ctx.font = `10px ${monoFont}`;
      ctx.fillStyle = colors.muted;
      g.stations.forEach((y, i) => {
        const py = Math.round(yOf(y)) + 0.5;
        ctx.beginPath();
        ctx.moveTo(0, py);
        ctx.lineTo(width, py);
        ctx.stroke();
        if (i % 3 === 0 || i === g.stations.length - 1) ctx.fillText(String(i + 1).padStart(2, "0"), width - 18, py - 4);
      });

      // Minute ticks along the top
      const firstMin = Math.ceil((ORIGIN_S + tLeft) / 60) * 60 - ORIGIN_S;
      for (let t = firstMin; t < tRight; t += 60) {
        const x = Math.round(xOf(t)) + 0.5;
        const isFive = Math.round((ORIGIN_S + t) / 60) % 5 === 0;
        ctx.strokeStyle = colors.line;
        ctx.beginPath();
        ctx.moveTo(x, top - (isFive ? 10 : 5));
        ctx.lineTo(x, top);
        ctx.stroke();
        if (isFive) ctx.fillText(clock(t).slice(0, 5), x + 4, top - 12);
      }

      // Pointer time and the train nearest to it
      const p = s.pointer;
      const tc = p ? s.now - (width - 24 - p.x) / pxPerS() : null;
      let hit: { tr: Train; y: number } | null = null;
      if (tc !== null && p) {
        let best = 22;
        for (const tr of g.trains) {
          const y = g.positionAt(tr, tc);
          if (y === null) continue;
          const d = Math.abs(yOf(y) - p.y);
          if (d < best) {
            best = d;
            hit = { tr, y };
          }
        }
      }

      // Trains
      ctx.lineJoin = "round";
      for (const tr of g.trains) {
        if (tr.path[tr.path.length - 1].t < tLeft || tr.path[0].t > tRight) continue;
        ctx.strokeStyle = colors.ink;
        ctx.globalAlpha = hit ? 0.28 : 0.5;
        ctx.lineWidth = 1.15;
        drawTrain(tr, tLeft, tRight);
      }
      ctx.globalAlpha = 1;
      if (hit) {
        ctx.strokeStyle = colors.accent;
        ctx.lineWidth = 7;
        drawTrain(hit.tr, tLeft, tRight);
        ctx.strokeStyle = colors.ink;
        ctx.lineWidth = 1.8;
        drawTrain(hit.tr, tLeft, tRight);
      }

      // "Now" edge: where the timetable is being written
      const xNow = xOf(s.now);
      ctx.fillStyle = colors.ground;
      ctx.globalAlpha = 0.85;
      ctx.fillRect(xNow + 1, 0, width - xNow, height);
      ctx.globalAlpha = 1;
      for (const tr of g.trains) {
        const y = g.positionAt(tr, s.now);
        if (y === null) continue;
        ctx.fillStyle = colors.ink;
        ctx.beginPath();
        ctx.arc(xNow, yOf(y), 2.6, 0, Math.PI * 2);
        ctx.fill();
      }

      // Time cursor + readout
      if (p && tc !== null) {
        ctx.fillStyle = colors.accent;
        ctx.globalAlpha = 0.35;
        ctx.fillRect(p.x - 7, top, 14, plotH());
        ctx.globalAlpha = 1;
        ctx.strokeStyle = colors.ink;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(Math.round(p.x) + 0.5, top);
        ctx.lineTo(Math.round(p.x) + 0.5, top + plotH());
        ctx.stroke();

        const lines = [clock(tc)];
        if (hit) {
          const st = g.stateAt(hit.tr, tc);
          lines.push(fill(L.train, { id: hit.tr.id, dir: hit.tr.dir === 1 ? L.down : L.up }));
          if (st?.kind === "dwell") lines.push(fill(L.dwell, { station: st.station, s: Math.ceil(st.leavesIn) }));
          if (st?.kind === "run") lines.push(fill(L.run, { s: Math.ceil(st.arrivesIn), station: st.nextStation }));
        }
        ctx.font = `11px ${monoFont}`;
        const w = Math.max(...lines.map((l) => ctx.measureText(l).width)) + 16;
        const h = lines.length * 16 + 10;
        const bx = p.x + 14 + w > width ? Math.max(readableFrom(), p.x - 14 - w) : p.x + 14;
        const by = Math.min(Math.max(top, p.y - h - 10), top + plotH() - h);
        ctx.fillStyle = colors.ink;
        ctx.fillRect(bx, by, w, h);
        ctx.fillStyle = colors.ground;
        lines.forEach((l, i) => ctx.fillText(l, bx + 8, by + 19 + i * 16));
      }
    };

    // The timetable advances by a fraction of a pixel per frame, so idle frames are thinned out; a moving pointer
    // marks the state dirty and is drawn on the next frame. With reduced motion there is no loop at all:
    // the graph is drawn once and again only when the pointer moves or the canvas resizes.
    let lastDraw = 0;
    const loop = (nowReal: number) => {
      const dt = Math.min(0.1, (nowReal - last) / 1000);
      last = nowReal;
      s.now += dt * SIM_SPEED;
      graph.schedule(s.now + 400);
      graph.prune(s.now - width / pxPerS() - 1200);
      if (s.dirty || nowReal - lastDraw >= IDLE_FRAME_MS) {
        lastDraw = nowReal;
        draw();
      }
      raf = requestAnimationFrame(loop);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      cancelAnimationFrame(raf);
      if (e.isIntersecting && !reduced) {
        last = performance.now();
        raf = requestAnimationFrame(loop);
      }
    });
    io.observe(canvas);
    graph.schedule(s.now + 400);
    resize();

    let release = 0;
    const update = () => (reduced ? draw() : (s.dirty = true));
    const move = (e: PointerEvent) => {
      window.clearTimeout(release);
      const r = canvas.getBoundingClientRect();
      const x = e.clientX - r.left;
      s.pointer = x < readableFrom() ? null : { x, y: e.clientY - r.top };
      update();
    };
    const leave = (e: PointerEvent) => {
      window.clearTimeout(release);
      const clear = () => {
        s.pointer = null;
        update();
      };
      // A finger lifting ends the gesture: keep the reading long enough to be read.
      if (e.pointerType === "touch") release = window.setTimeout(clear, TOUCH_HOLD_MS);
      else clear();
    };
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerdown", move);
    canvas.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(release);
      ro.disconnect();
      io.disconnect();
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerdown", move);
      canvas.removeEventListener("pointerleave", leave);
    };
  }, [reduced, graph, coverQuery, coverFraction]);

  return (
    <div className="relative flex h-full w-full flex-col">
      <canvas ref={canvasRef} className="block min-h-0 w-full flex-1 touch-pan-y" role="img" aria-label={labels.aria} />
      {/* Below the graph on small screens, over its bottom edge where there is room. */}
      <p className="pointer-events-none mt-2 text-right text-sm text-muted xl:absolute xl:right-10 xl:bottom-[10px] xl:mt-0">
        <span className="pointer-coarse:hidden">{labels.hint}</span>
        <span className="hidden pointer-coarse:inline">{labels.hintTouch}</span>
      </p>
    </div>
  );
}
