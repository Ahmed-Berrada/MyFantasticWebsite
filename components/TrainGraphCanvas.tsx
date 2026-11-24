"use client";
import { useEffect, useRef, useState } from "react";
import { TrainGraph, type Train } from "@/src/lib/traingraph";
import { usePrefersReducedMotion } from "@/src/lib/useInView";

const SIM_SPEED = 9; // simulated seconds per real second
const LANE_H = 64; // keyboard lane height, px
const ORIGIN_S = 6 * 3600 + 41 * 60; // the simulated clock starts at 06:41
const MAX_PULSES = 48;
const LANE_PX_PER_S = 60; // the key lane is zoomed in: 60 px per real second

interface Pulse {
  t: number; // sim time when the key was pressed
  real: number; // performance.now() at the key press
  label: string;
  ms: number | null; // key press -> next frame
  seq: number;
}

const KEY_LABELS: Record<string, string> = {
  " ": "space",
  Enter: "enter",
  Backspace: "bksp",
  Tab: "tab",
  Escape: "esc",
  ArrowLeft: "←",
  ArrowRight: "→",
  ArrowUp: "↑",
  ArrowDown: "↓",
  Shift: "shift",
  Meta: "meta",
  Alt: "alt",
  Control: "ctrl",
};

function clock(simS: number): string {
  const s = ((ORIGIN_S + simS) % 86400 + 86400) % 86400;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${sec.toFixed(1).padStart(4, "0")}`;
}

interface Props {
  /** Called with key-to-frame stats so the page can show them in text. */
  onLatency?: (last: number, median: number, count: number) => void;
}

export default function TrainGraphCanvas({ onLatency }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = usePrefersReducedMotion();
  const [hint, setHint] = useState(true);
  const state = useRef({
    graph: new TrainGraph(41),
    now: 0,
    pointer: null as { x: number; y: number } | null,
    pulses: [] as Pulse[],
    seq: 0,
    visible: true,
  });

  // Keyboard and tap pulses: measure from the input event to the next frame.
  useEffect(() => {
    const s = state.current;
    const record = (label: string, stamp: number) => {
      const pulse: Pulse = { t: s.now, real: performance.now(), label, ms: null, seq: ++s.seq };
      s.pulses.push(pulse);
      if (s.pulses.length > MAX_PULSES) s.pulses.shift();
      // rAF runs before the frame renders; a message posted from it lands just after,
      // which approximates "the pulse is on screen".
      requestAnimationFrame(() => {
        const ch = new MessageChannel();
        ch.port1.onmessage = () => {
          pulse.ms = Math.max(0, performance.now() - stamp);
          const done = s.pulses.filter((p) => p.ms !== null).map((p) => p.ms!).sort((a, b) => a - b);
          onLatency?.(pulse.ms, done[Math.floor(done.length / 2)], done.length);
          ch.port1.close();
        };
        ch.port2.postMessage(0);
      });
      setHint(false);
    };
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) return;
      if (e.repeat || !s.visible) return;
      const label = KEY_LABELS[e.key] ?? (e.key.length === 1 ? e.key : e.key.slice(0, 5).toLowerCase());
      record(label, e.timeStamp);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onLatency]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const s = state.current;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;
    let last = performance.now();
    let width = 0;
    let height = 0;
    let colors = { ink: "#121417", ink2: "#3b4048", muted: "#5d636d", line: "#d3d7dd", accent: "#ffc400", sheet: "#f7f8f9", ground: "#eceef0" };
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
      colors = { ink: v("--ink"), ink2: v("--ink-2"), muted: v("--muted"), line: v("--line"), accent: v("--accent"), sheet: v("--sheet"), ground: v("--ground") };
      monoFont = getComputedStyle(canvas).getPropertyValue("--font-martian").trim() || "monospace";
      draw();
    };

    const pxPerS = () => Math.max(0.55, width / 1500);
    const xOf = (t: number) => width - (s.now - t) * pxPerS() - 24;
    const top = 28;
    const plotH = () => height - LANE_H - top - 24;
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

    function draw() {
      const g = s.graph;
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

      // Cursor time and the train nearest to the pointer
      const p = s.pointer && s.pointer.y < height - LANE_H ? s.pointer : null;
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
      ctx.fillRect(xNow + 1, 0, width - xNow, height - LANE_H);
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
          lines.push(`train ${hit.tr.id}, ${hit.tr.dir === 1 ? "down" : "up"}`);
          if (st?.kind === "dwell") lines.push(`at station ${st.station}, leaves in ${Math.ceil(st.leavesIn)} s`);
          if (st?.kind === "run") lines.push(`${Math.ceil(st.arrivesIn)} s to station ${st.nextStation}`);
        }
        ctx.font = `11px ${monoFont}`;
        const w = Math.max(...lines.map((l) => ctx.measureText(l).width)) + 16;
        const h = lines.length * 16 + 10;
        const bx = p.x + 14 + w > width ? p.x - 14 - w : p.x + 14;
        const by = Math.min(Math.max(top, p.y - h - 10), top + plotH() - h);
        ctx.fillStyle = colors.ink;
        ctx.fillRect(bx, by, w, h);
        ctx.fillStyle = colors.ground;
        lines.forEach((l, i) => ctx.fillText(l, bx + 8, by + 19 + i * 16));
      }

      // Keyboard lane
      const laneTop = height - LANE_H;
      const base = laneTop + LANE_H - 18;
      ctx.strokeStyle = colors.ink2;
      ctx.lineWidth = 1.25;
      ctx.beginPath();
      ctx.moveTo(0, base);
      const pulses = [...s.pulses].sort((a, b) => a.real - b.real);
      const realNow = performance.now();
      const px = (pl: Pulse, k: number) =>
        reduced ? width - 60 - (pulses.length - 1 - k) * 34 : width - 40 - ((realNow - pl.real) / 1000) * LANE_PX_PER_S;
      pulses.forEach((pl, k) => {
        const x = px(pl, k);
        if (x < -20) return;
        ctx.lineTo(x, base);
        ctx.lineTo(x, base - 20);
        ctx.lineTo(x + 8, base - 20);
        ctx.lineTo(x + 8, base);
      });
      ctx.lineTo(width, base);
      ctx.stroke();
      ctx.font = `10px ${monoFont}`;
      pulses.forEach((pl, k) => {
        const x = px(pl, k);
        if (x < -20) return;
        const newest = pl.seq === s.seq;
        const next = pulses[k + 1];
        const room = newest || !next || px(next, k + 1) - x > 36;
        ctx.fillStyle = newest ? colors.ink : colors.muted;
        if (room || pl.label.length === 1) ctx.fillText(pl.label, x, base - 26);
        if (pl.ms !== null && room) ctx.fillText(`${pl.ms.toFixed(1)} ms`, x, base + 13);
      });
    }

    const loop = (nowReal: number) => {
      const dt = Math.min(0.1, (nowReal - last) / 1000);
      last = nowReal;
      if (!reduced) s.now += dt * SIM_SPEED;
      s.graph.schedule(s.now + 400);
      s.graph.prune(s.now - width / pxPerS() - 1200);
      draw();
      raf = requestAnimationFrame(loop);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      s.visible = e.isIntersecting;
      cancelAnimationFrame(raf);
      if (e.isIntersecting) {
        last = performance.now();
        raf = requestAnimationFrame(loop);
      }
    });
    io.observe(canvas);
    s.graph.schedule(s.now + 400);
    resize();

    const move = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      s.pointer = { x: e.clientX - r.left, y: e.clientY - r.top };
      if (reduced) draw();
    };
    const leave = () => {
      s.pointer = null;
      if (reduced) draw();
    };
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerdown", move);
    canvas.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerdown", move);
      canvas.removeEventListener("pointerleave", leave);
    };
  }, [reduced]);

  return (
    <div className="relative h-full w-full">
      <canvas
        ref={canvasRef}
        className="block h-full w-full touch-pan-y"
        role="img"
        aria-label="A live train graph: each line is a train running between stations over time. Moving the pointer reads the timetable; pressing keys draws timed pulses on a signal lane."
      />
      {hint && (
        <p className="pointer-events-none absolute right-10 bottom-[22px] text-right text-sm text-muted">
          Type anything. Each key is timed from press to the next frame.
        </p>
      )}
    </div>
  );
}
