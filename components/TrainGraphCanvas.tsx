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
  title: string;
  hint: string;
  hintTouch: string;
  aria: string;
}


interface Props {
  labels: Labels;
  /** Station names from the first (top) to the last (bottom). */
  stations: readonly string[];
}

/** Idle frames are drawn at about 30 per second; a moving pointer is drawn at the display's rate. */
const IDLE_FRAME_MS = 33;
/** On touch, the reading stays on screen this long after the finger lifts. */
const TOUCH_HOLD_MS = 2500;

export default function TrainGraphCanvas({ labels, stations }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = usePrefersReducedMotion();
  const [graph] = useState(() => new TrainGraph(41, stations.length));
  const namesRef = useRef(stations);
  useEffect(() => {
    namesRef.current = stations;
  });
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

    /** Station names sit in a gutter on the right; trains are drawn left of it. */
    const gutter = () => Math.round(Math.min(132, Math.max(84, width * 0.28)));
    const plotR = () => width - gutter();
    const pxPerS = () => Math.max(0.55, plotR() / 1300);
    const xOf = (t: number) => plotR() - (s.now - t) * pxPerS() - 12;
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
      const tLeft = s.now - plotR() / pxPerS();
      const R = plotR();
      const tRight = s.now + 60;

      // Station rules
      const stationRows: number[] = [];
      let highlight = -1;
      ctx.lineWidth = 1;
      ctx.strokeStyle = colors.line;
      ctx.font = `10px ${monoFont}`;
      ctx.fillStyle = colors.muted;
      g.stations.forEach((y) => {
        const py = Math.round(yOf(y)) + 0.5;
        ctx.beginPath();
        ctx.moveTo(0, py);
        ctx.lineTo(R, py);
        ctx.stroke();
        stationRows.push(py);
      });

      // Minute ticks along the top
      const firstMin = Math.ceil((ORIGIN_S + tLeft) / 60) * 60 - ORIGIN_S;
      for (let t = firstMin; t < tRight; t += 60) {
        const x = Math.round(xOf(t)) + 0.5;
        if (x > R) break;
        const isFive = Math.round((ORIGIN_S + t) / 60) % 5 === 0;
        ctx.strokeStyle = colors.line;
        ctx.beginPath();
        ctx.moveTo(x, top - (isFive ? 10 : 5));
        ctx.lineTo(x, top);
        ctx.stroke();
        if (isFive && x + 4 + ctx.measureText("00:00").width < R) ctx.fillText(clock(t).slice(0, 5), x + 4, top - 12);
      }

      // Pointer time and the train nearest to it
      const p = s.pointer;
      const tc = p ? s.now - (R - 12 - p.x) / pxPerS() : null;
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

      // Trains, clipped to the plot so nothing runs into the station-name gutter.
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, R, height);
      ctx.clip();
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
      ctx.fillRect(xNow + 1, 0, R - xNow, height);
      ctx.globalAlpha = 1;
      for (const tr of g.trains) {
        const y = g.positionAt(tr, s.now);
        if (y === null) continue;
        ctx.fillStyle = colors.ink;
        ctx.beginPath();
        ctx.arc(xNow, yOf(y), 2.6, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

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
          // Station numbers from the model are 1-based.
          const names = namesRef.current;
          if (st?.kind === "dwell") {
            highlight = st.station - 1;
            lines.push(fill(L.dwell, { station: names[highlight] ?? st.station, s: Math.ceil(st.leavesIn) }));
          }
          if (st?.kind === "run") {
            highlight = st.nextStation - 1;
            lines.push(fill(L.run, { s: Math.ceil(st.arrivesIn), station: names[highlight] ?? st.nextStation }));
          }
        }
        ctx.font = `11px ${monoFont}`;
        const w = Math.max(...lines.map((l) => ctx.measureText(l).width)) + 16;
        const h = lines.length * 16 + 10;
        const bx = p.x + 14 + w > R ? Math.max(0, p.x - 14 - w) : p.x + 14;
        const by = Math.min(Math.max(top, p.y - h - 10), top + plotH() - h);
        ctx.fillStyle = colors.ink;
        ctx.fillRect(bx, by, w, h);
        ctx.fillStyle = colors.ground;
        lines.forEach((l, i) => ctx.fillText(l, bx + 8, by + 19 + i * 16));
      }

      // Station names in the gutter: all of them when there is room, otherwise every other one, always the
      // terminals and the station the hovered train is at or heading to.
      const names = namesRef.current;
      const room = width - R - 14;
      // Stations are unevenly spaced: show a name only if it does not collide with one already shown, choosing
      // the hovered train's station and the two terminals first.
      const last = stationRows.length - 1;
      const order = [highlight, 0, last, ...stationRows.map((_, i) => i)].filter((i, k, a) => i >= 0 && a.indexOf(i) === k);
      const shown: number[] = [];
      for (const i of order) if (shown.every((j) => Math.abs(stationRows[i] - stationRows[j]) >= 12)) shown.push(i);
      stationRows.forEach((py, i) => {
        if (!shown.includes(i)) return;
        let name = names[i] ?? String(i + 1);
        ctx.font = i === highlight ? `600 10.5px ${monoFont}` : `10.5px ${monoFont}`;
        while (name.length > 3 && ctx.measureText(name).width > room) name = name.slice(0, -2) + "…";
        if (i === highlight) {
          ctx.fillStyle = colors.accent;
          ctx.fillRect(R + 6, py - 3, 5, 5);
        }
        ctx.fillStyle = i === highlight ? colors.ink : colors.muted;
        ctx.fillText(name, R + 14, py + 3.5);
      });
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
      graph.prune(s.now - plotR() / pxPerS() - 1200);
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
      // The gutter holds the station names: no reading there.
      s.pointer = x > plotR() ? null : { x, y: e.clientY - r.top };
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
  }, [reduced, graph]);

  return (
    <div className="relative flex h-full w-full flex-col">
      <p className="mb-2 font-mono text-[11px] text-muted">{labels.title}</p>
      <canvas ref={canvasRef} className="block min-h-0 w-full flex-1 touch-pan-y" role="img" aria-label={labels.aria} />
      {/* Below the graph on small screens, over its bottom edge where there is room. */}
      <p className="pointer-events-none mt-2 text-right text-sm text-muted xl:absolute xl:right-10 xl:bottom-[10px] xl:mt-0">
        <span className="pointer-coarse:hidden">{labels.hint}</span>
        <span className="hidden pointer-coarse:inline">{labels.hintTouch}</span>
      </p>
    </div>
  );
}
