"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { crc32mpeg2 } from "@/src/lib/crc";
import { prng } from "@/src/lib/orderbook/flow";
import { useOnScreen, usePrefersReducedMotion } from "@/src/lib/useInView";
import { fill } from "@/src/lib/format";
import type { Dict } from "@/src/content";

type Source = "CC" | "ZC" | "WRG" | "you";
type FieldId = "srcPort" | "dstPort" | "length" | "udpSum" | "type" | "seq" | "payload" | "crc";

interface Frame {
  source: Source;
  type: number;
  seq: number;
  payload: number[];
  bytes: number[];
  crc: number;
  fields: { id: FieldId; from: number; to: number }[];
}

const CODE: Record<Source, number> = { CC: 0x21, ZC: 0x42, WRG: 0x13, you: 0x7e };

/** UDP header + illustrative message (type, seq, payload) + CRC-32/MPEG-2 over the message. */
function buildFrame(source: Source, seq: number, payload: number[]): Frame {
  const type = CODE[source];
  const message = [type, (seq >> 8) & 0xff, seq & 0xff, ...payload];
  const crc = crc32mpeg2(message);
  const udpLen = 8 + message.length + 4;
  const header = [0xc3, 0x51, 0xc3, 0x52, (udpLen >> 8) & 0xff, udpLen & 0xff, 0x00, 0x00];
  const bytes = [...header, ...message, crc >>> 24, (crc >>> 16) & 0xff, (crc >>> 8) & 0xff, crc & 0xff];
  const p0 = 11;
  return {
    source,
    type,
    seq,
    payload,
    bytes,
    crc,
    fields: [
      { id: "srcPort", from: 0, to: 2 },
      { id: "dstPort", from: 2, to: 4 },
      { id: "length", from: 4, to: 6 },
      { id: "udpSum", from: 6, to: 8 },
      { id: "type", from: 8, to: 9 },
      { id: "seq", from: 9, to: 11 },
      { id: "payload", from: p0, to: p0 + payload.length },
      { id: "crc", from: p0 + payload.length, to: p0 + payload.length + 4 },
    ],
  };
}

const hex = (n: number, w = 2) => n.toString(16).toUpperCase().padStart(w, "0");

// Scene geometry (SVG units)
const TRACK_Y = 58;
const MASTS = [190, 450];
const ZC = { x: 548, y: 112 };
const CRG = { x: 262, y: 148, w: 116, h: 40 };
const CRG_IN = { x: CRG.x + CRG.w / 2, y: CRG.y };
const LOOP_MS = 14000;
const MSG_EVERY_MS = 1700;
const TRAVEL_MS = 700;

interface Pulse {
  source: Source;
  from: { x: number; y: number };
  via?: { x: number; y: number };
  start: number;
}

export default function RadioLink({ t }: { t: Dict["siemens"]["radio"] }) {
  const reduced = usePrefersReducedMotion();
  const [ref, onScreen] = useOnScreen<HTMLDivElement>();
  const rand = useMemo(() => prng(2025), []);
  const seqRef = useRef(1040);
  const [now, setNow] = useState(0);
  const [frame, setFrame] = useState<Frame>(() => buildFrame("CC", 1040, [0x00, 0x2f, 0x9a, 0x11, 0x04, 0x63]));
  const [revealed, setRevealed] = useState(Infinity);
  const [hover, setHover] = useState<number | null>(null);
  const [typed, setTyped] = useState<number[] | null>(null);
  const pulse = useRef<Pulse | null>(null);
  /** What the render reads: a copy of `pulse`, updated with the clock. */
  const [p, setPulse] = useState<Pulse | null>(null);
  const lastTyped = useRef(-Infinity);
  const nextMsg = useRef(0);

  const trainX = (t: number) => 40 + ((t % LOOP_MS) / LOOP_MS) * 520;

  // Animation clock + automatic messages
  useEffect(() => {
    // With reduced motion nothing moves, so there is no clock to run: frames come only from the field.
    if (!onScreen || reduced) return;
    let raf = 0;
    const t0 = performance.now() - now;
    const tick = (wall: number) => {
      const t = wall - t0;
      setNow(t);
      if (t >= nextMsg.current && wall - lastTyped.current > 4000) {
        nextMsg.current = t + MSG_EVERY_MS;
        const r = rand();
        const source: Source = r < 0.5 ? "CC" : r < 0.8 ? "ZC" : "WRG";
        const tx = trainX(t);
        const mast = MASTS.reduce((a, b) => (Math.abs(b - tx) < Math.abs(a - tx) ? b : a));
        pulse.current =
          source === "CC"
            ? { source, from: { x: tx + 27, y: TRACK_Y - 10 }, via: { x: mast, y: 22 }, start: t }
            : source === "ZC"
              ? { source, from: { x: ZC.x, y: ZC.y }, start: t }
              : { source, from: { x: mast, y: 22 }, start: t };
      }
      const p = pulse.current;
      if (p && t - p.start >= TRAVEL_MS) {
        pulse.current = null;
        const len = 5 + Math.floor(rand() * 6);
        const payload = Array.from({ length: len }, () => Math.floor(rand() * 256));
        seqRef.current = (seqRef.current + 1) & 0xffff;
        setHover(null);
        setFrame(buildFrame(p.source, seqRef.current, payload));
        setRevealed(0);
      }
      setPulse(pulse.current);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- clock resumes from `now`
  }, [onScreen, reduced, rand]);

  // Bytes appear left to right, like a frame on the wire.
  useEffect(() => {
    if (reduced || revealed >= frame.bytes.length) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 18);
    return () => clearTimeout(id);
  }, [revealed, frame, reduced]);

  /** The field writes the payload; the CRC follows every byte. ASCII only, at most 12 bytes. */
  const onPayload = (value: string) => {
    const next = Array.from(value, (c) => c.charCodeAt(0))
      .filter((c) => c < 128)
      .slice(0, 12);
    lastTyped.current = performance.now();
    pulse.current = null;
    setPulse(null);
    setHover(null);
    setTyped(next);
    seqRef.current = (seqRef.current + 1) & 0xffff;
    setFrame(buildFrame("you", seqRef.current, next));
    setRevealed(Infinity);
  };

  const tx = reduced ? 300 : trainX(now);
  let dot: { x: number; y: number } | null = null;
  let ripple = 0;
  if (p) {
    const k = Math.min(1, (now - p.start) / TRAVEL_MS);
    ripple = k;
    const a = p.from;
    const pts = p.via ? [a, p.via, CRG_IN] : [a, CRG_IN];
    const seg = k * (pts.length - 1);
    const i = Math.min(pts.length - 2, Math.floor(seg));
    const f = seg - i;
    dot = { x: pts[i].x + (pts[i + 1].x - pts[i].x) * f, y: pts[i].y + (pts[i + 1].y - pts[i].y) * f };
  }

  // A new frame can be shorter than the byte under the pointer: ignore a hover index the frame no longer has.
  const h = hover !== null && hover < frame.bytes.length ? hover : null;
  const hoverField = h !== null ? (frame.fields.find((f) => h >= f.from && h < f.to) ?? null) : null;
  const shown = reduced ? frame.bytes.length : Math.min(revealed, frame.bytes.length);
  const verified = shown >= frame.bytes.length;

  return (
    <div ref={ref} className="overflow-hidden rounded-[6px] border border-line-2 bg-sheet shadow-[0_24px_50px_-30px_#1b2a4a55]">
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 font-mono text-xs">
        <span className="text-ink-2">
          {t.title}
          <span className="hidden sm:inline">{t.titleLong}</span>
        </span>
        <span className="text-muted">{t.simulated}</span>
      </div>

      <svg viewBox="0 0 640 200" className="radio-scene block h-auto max-h-[260px] w-full" role="img" aria-label={t.aria}>
        {/* track */}
        <line x1="16" x2="624" y1={TRACK_Y} y2={TRACK_Y} stroke="var(--ink-2)" strokeWidth="1.5" />
        {Array.from({ length: 39 }, (_, i) => (
          <line key={i} x1={20 + i * 16} x2={20 + i * 16} y1={TRACK_Y - 3} y2={TRACK_Y + 3} stroke="var(--line-2)" />
        ))}

        {/* radio gateways */}
        {MASTS.map((m) => (
          <g key={m}>
            <line x1={m} x2={m} y1={22} y2={TRACK_Y - 6} stroke="var(--ink-2)" strokeDasharray="3 3" />
            <path d={`M${m - 7},30 L${m},16 L${m + 7},30`} fill="none" stroke="var(--ink-2)" strokeDasharray="3 2" />
            <text className="rl-label" x={m + 10} y={22} fontSize="11" fontFamily="var(--font-martian)" fill="var(--muted)">WRG</text>
          </g>
        ))}

        {/* train (CC onboard) */}
        <g transform={`translate(${tx},${TRACK_Y - 15})`}>
          <rect width="54" height="12" rx="3" fill="var(--sheet)" stroke="var(--ink)" strokeDasharray="4 2" />
          <rect x="6" y="3" width="8" height="4" fill="var(--ink-2)" />
          <rect x="20" y="3" width="8" height="4" fill="var(--ink-2)" />
          <rect x="34" y="3" width="8" height="4" fill="var(--ink-2)" />
          <text className="rl-label" x="0" y="-5" fontSize="11" fontFamily="var(--font-martian)" fill="var(--muted)">CC</text>
        </g>
        {p?.source === "CC" && ripple < 1 && (
          <circle cx={p.from.x} cy={p.from.y} r={6 + ripple * 26} fill="none" stroke="var(--ink)" strokeOpacity={1 - ripple} />
        )}

        {/* zone controller */}
        <rect x={ZC.x - 22} y={ZC.y - 14} width="56" height="28" rx="4" fill="var(--sheet)" stroke="var(--ink-2)" strokeDasharray="4 2" />
        <text className="rl-label" x={ZC.x - 10} y={ZC.y + 5} fontSize="12" fontFamily="var(--font-martian)" fill="var(--ink-2)">ZC</text>

        {/* links to the CRG */}
        <path d={`M${ZC.x - 22},${ZC.y} C${ZC.x - 120},${ZC.y} ${CRG_IN.x + 60},${CRG.y - 30} ${CRG_IN.x},${CRG.y}`} fill="none" stroke="var(--line-2)" />
        {MASTS.map((m) => (
          <path key={m} d={`M${m},${TRACK_Y + 4} C${m},${TRACK_Y + 50} ${CRG_IN.x},${CRG.y - 40} ${CRG_IN.x},${CRG.y}`} fill="none" stroke="var(--line-2)" />
        ))}

        {/* CRG: the real software under test */}
        <rect x={CRG.x} y={CRG.y} width={CRG.w} height={CRG.h} rx="5" fill="var(--ink)" />
        <text className="rl-title" x={CRG.x + 12} y={CRG.y + 18} fontSize="13" fontWeight="600" fontFamily="var(--font-instrument)" fill="var(--ground)">CRG</text>
        <text className="rl-sub" x={CRG.x + 12} y={CRG.y + 33} fontSize="10" fontFamily="var(--font-martian)" fill="#b9bec8">{t.crgSub}</text>
        {verified && (
          <circle cx={CRG.x + CRG.w - 14} cy={CRG.y + 14} r="4" fill="var(--accent)" />
        )}

        {dot && <circle cx={dot.x} cy={dot.y} r="5" fill="var(--accent)" stroke="var(--ink)" strokeWidth="1.5" />}
      </svg>

      {/* The frame, byte by byte */}
      <div className="border-t border-line px-4 pt-4 pb-3">
        {/* Reserve three rows on phones: payloads vary in length, and the panel must not change height. */}
        <div className="flex min-h-[150px] flex-wrap content-start gap-y-3 sm:min-h-0" onMouseLeave={() => setHover(null)}>
          {frame.fields.map((f) => (
            <div key={f.id} className="mr-2">
              <div className="flex">
                {frame.bytes.slice(f.from, f.to).map((b, j) => {
                  const i = f.from + j;
                  const on = i < shown;
                  const isPayload = f.id === "payload";
                  const isCrc = f.id === "crc";
                  return (
                    <span
                      key={i}
                      onMouseEnter={() => setHover(i)}
                      className={`w-[22px] text-center font-mono text-[11px] leading-6 tabular transition-colors duration-150 ${
                        h === i ? "bg-ink text-ground" : isCrc && verified ? "bg-accent text-ink" : isPayload ? "bg-sunken" : ""
                      } ${on ? "opacity-100" : "opacity-0"}`}
                    >
                      {hex(b)}
                    </span>
                  );
                })}
              </div>
              <p className={`mt-0.5 font-mono text-[10px] ${hoverField === f ? "text-ink" : "text-muted"}`}>{t.fields[f.id]}</p>
            </div>
          ))}
        </div>

        <p className="mt-3 min-h-[52px] font-mono text-[11px] text-ink-2 sm:min-h-5">
          {h !== null && hoverField
            ? fill(t.hover, {
                i: h,
                field: t.fields[hoverField.id],
                hex: `0x${hex(frame.bytes[h])}${frame.bytes[h] >= 32 && frame.bytes[h] < 127 ? ` '${String.fromCharCode(frame.bytes[h])}'` : ""}`,
              })
            : fill(t.status, {
                source: t.source[frame.source],
                meaning: t.meaning[frame.source],
                seq: frame.seq,
                n: frame.payload.length,
                crc: `0x${hex(frame.crc, 8)}`,
                state: verified ? t.verified : t.pending,
              })}
        </p>
        <label className="mt-3 flex items-center gap-3 font-mono text-[12px] text-ink-2">
          <span className="shrink-0">{t.inputLabel}</span>
          <input
            type="text"
            inputMode="text"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            maxLength={12}
            value={typed ? String.fromCharCode(...typed) : ""}
            onChange={(e) => onPayload(e.target.value)}
            placeholder={t.placeholder}
            className="min-h-9 w-full max-w-[16rem] rounded-[3px] border border-line-2 bg-ground px-2 font-mono text-[13px] text-ink placeholder:text-muted focus:border-ink"
          />
        </label>
        {/* Announce only frames the visitor wrote, not the automatic stream. */}
        <p role="status" className="sr-only">
          {frame.source === "you" ? fill(t.announce, { crc: `0x${hex(frame.crc, 8)}` }) : ""}
        </p>
      </div>
      <p className="border-t border-line bg-sunken px-4 py-2 text-[13px] text-muted">
        {frame.source === "you" ? t.typed : t.idle} {t.illustrative}
      </p>
    </div>
  );
}
