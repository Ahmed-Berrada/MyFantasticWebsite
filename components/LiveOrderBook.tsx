"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { OrderFlow } from "@/src/lib/orderbook/flow";
import type { Depth, Trade } from "@/src/lib/orderbook/engine";
import { useOnScreen, usePrefersReducedMotion } from "@/src/lib/useInView";
import type { Dict } from "@/src/content";
import type { Lang } from "@/src/content/types";
import { fill } from "@/src/lib/format";

const SEED = 2027;
const LEVELS = 7;
const OPS_PER_FRAME = 24;
const RENDER_EVERY_MS = 140;
const TAPE = 12;

interface TapeRow extends Trade {
  seq: number;
}

interface Snapshot {
  depth: Depth;
  tape: TapeRow[];
  ops: number;
  trades: number;
  volume: number;
  resting: number;
}

const px = (ticks: number) => (ticks / 100).toFixed(2);
const fmt = (n: number, lang: Lang) => n.toLocaleString(lang === "fr" ? "fr-FR" : "en-US");

export default function LiveOrderBook({ t, lang }: { t: Dict["work"]["orderBookUi"]; lang: Lang }) {
  const reduced = usePrefersReducedMotion();
  const [panelRef, onScreen] = useOnScreen<HTMLDivElement>();
  const flowRef = useRef<OrderFlow | null>(null);
  const tapeRef = useRef<TapeRow[]>([]);
  const seqRef = useRef(0);
  const [snap, setSnap] = useState<Snapshot | null>(null);
  const [userPaused, setUserPaused] = useState<boolean | null>(null);

  const paused = userPaused ?? true;
  const running = !paused && onScreen && !reduced;

  const publish = useCallback(() => {
    const flow = flowRef.current!;
    setSnap({
      depth: flow.book.depth(LEVELS),
      tape: tapeRef.current.slice(),
      ops: flow.stats.ops,
      trades: flow.stats.trades,
      volume: flow.stats.volume,
      resting: flow.book.size(),
    });
  }, []);

  const advance = useCallback((n: number) => {
    const flow = flowRef.current!;
    const out: Trade[] = [];
    flow.step(n, out);
    if (out.length) {
      const rows = out.slice(-TAPE).map((t) => ({ ...t, seq: ++seqRef.current }));
      tapeRef.current = [...rows.reverse(), ...tapeRef.current].slice(0, TAPE);
    }
  }, []);

  // Warm up a populated book once, on the client.
  useEffect(() => {
    if (flowRef.current) return;
    flowRef.current = new OrderFlow(SEED);
    advance(3_000);
    const id = requestAnimationFrame(publish);
    return () => cancelAnimationFrame(id);
  }, [advance, publish]);

  useEffect(() => {
    if (!running) return;
    let raf = 0;
    let last = 0;
    const loop = (t: number) => {
      advance(OPS_PER_FRAME);
      if (t - last > RENDER_EVERY_MS) {
        last = t;
        publish();
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [running, advance, publish]);

  const asks = snap ? snap.depth.asks.slice().reverse() : [];
  const bids = snap ? snap.depth.bids : [];
  const maxQty = Math.max(1, ...asks.map((l) => l.qty), ...bids.map((l) => l.qty));
  const bestBid = bids[0]?.price;
  const bestAsk = snap?.depth.asks[0]?.price;

  return (
    <div ref={panelRef} className="overflow-hidden rounded-[6px] border border-line-2 bg-sheet shadow-[0_24px_50px_-30px_#1b2a4a55]">
      {/* Title bar */}
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="relative flex size-2">
            {running && <span className="absolute inline-flex size-full animate-ping rounded-full bg-bid opacity-60" />}
            <span className={`relative inline-flex size-2 rounded-full ${running ? "bg-bid" : "bg-line-2"}`} />
          </span>
          <p className="truncate font-mono text-xs text-ink-2">
            <span className="font-medium text-ink">{running ? t.live : t.paused}</span>
            <span className="mx-2 text-line-2">/</span>
            {t.sub}
          </p>
        </div>
        <button
          onClick={() => {
            // With reduced motion nothing runs by itself; each press advances the flow by a batch and stops.
            if (reduced) {
              advance(OPS_PER_FRAME * 12);
              publish();
            } else setUserPaused(!paused);
          }}
          className="shrink-0 rounded-[3px] border border-line px-2.5 py-1 font-mono text-[11px] text-ink-2 transition-colors hover:border-ink hover:text-ink active:translate-y-px"
        >
          {paused || reduced ? t.run : t.pause}
        </button>
      </div>

      <div className="grid sm:grid-cols-[1.25fr_1fr]">
        {/* Ladder */}
        <div className="border-line sm:border-r">
          <div className="grid grid-cols-[1fr_1fr] px-4 pt-3 pb-1.5 font-mono text-[10px] text-muted">
            <span>{t.price}</span>
            <span className="text-right">{t.size}</span>
          </div>
          <Ladder label={t.asks} levels={asks} side="ask" maxQty={maxQty} pad={LEVELS} loading={!snap} />
          <div className="flex items-center justify-between border-y border-line bg-sunken px-4 py-1.5 font-mono text-[11px] text-ink-2 tabular">
            <span>
              {t.spread} {bestBid != null && bestAsk != null ? px(bestAsk - bestBid) : "–"}
            </span>
            <span>{t.mid} {bestBid != null && bestAsk != null ? px((bestAsk + bestBid) / 2) : "–"}</span>
          </div>
          <Ladder label={t.bids} levels={bids} side="bid" maxQty={maxQty} pad={LEVELS} loading={!snap} />
        </div>

        {/* Trade tape */}
        <div className="hidden sm:block">
          <div className="grid grid-cols-[1fr_auto] px-4 pt-3 pb-1.5 font-mono text-[10px] text-muted">
            <span>{t.trades}</span>
            <span>{t.qty}</span>
          </div>
          <ul className="px-2">
            {(snap?.tape ?? []).map((row) => (
              <li key={row.seq} className="tape-row grid grid-cols-[1fr_auto] rounded px-2 py-[3px] font-mono text-xs tabular">
                <span className={row.aggressor === "buy" ? "text-bid" : "text-ask"}>
                  {row.aggressor === "buy" ? "▲" : "▼"} {px(row.price)}
                </span>
                <span className="text-ink-2">{row.qty}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Stats + benchmark */}
      <div className="grid grid-cols-3 border-t border-line">
        <Stat label={t.orders} value={snap ? fmt(snap.ops, lang) : "–"} />
        <Stat label={t.tradeCount} value={snap ? fmt(snap.trades, lang) : "–"} />
        <Stat label={t.resting} value={snap ? fmt(snap.resting, lang) : "–"} />
      </div>
      <div className="border-t border-line bg-sunken px-4 py-3">
        <p className="font-mono text-xs text-muted">{fill(t.seed, { seed: SEED })}</p>
      </div>

      <style>{`
        .tape-row { animation: tapeIn .45s ease-out; }
        @keyframes tapeIn { from { background: var(--sunken); } to { background: transparent; } }
      `}</style>
    </div>
  );
}

interface LadderProps {
  label: string;
  levels: { price: number; qty: number }[];
  side: "bid" | "ask";
  maxQty: number;
  pad: number;
  loading: boolean;
}

function Ladder({ label, levels, side, maxQty, pad, loading }: LadderProps) {
  const rows: ({ price: number; qty: number } | null)[] = [...levels];
  while (rows.length < pad) {
    if (side === "ask") rows.unshift(null);
    else rows.push(null);
  }
  return (
    <ul aria-label={label}>
      {rows.map((l, i) => (
        <li key={l ? l.price : `empty-${i}`} className="relative grid h-[22px] grid-cols-[1fr_1fr] items-center px-4 font-mono text-xs tabular">
          {l && (
            <span
              className={`absolute inset-y-[3px] right-0 transition-[width] duration-150 ${side === "bid" ? "bg-bid-soft" : "bg-ask-soft"}`}
              style={{ width: `${(l.qty / maxQty) * 100}%` }}
              aria-hidden
            />
          )}
          <span className={`relative ${side === "bid" ? "text-bid" : "text-ask"}`}>{l ? px(l.price) : loading ? "·" : ""}</span>
          <span className="relative text-right text-ink-2">{l ? l.qty : ""}</span>
        </li>
      ))}
    </ul>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-line px-4 py-2.5 not-last:border-r">
      <p className="font-mono text-[10px] text-muted">{label}</p>
      <p className="font-mono text-sm tabular">{value}</p>
    </div>
  );
}
