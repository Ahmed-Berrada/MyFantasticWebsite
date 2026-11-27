import { OrderBook, type Side, type Trade } from "./engine";

import { prng } from "../prng";

export interface FlowStats {
  ops: number;
  trades: number;
  volume: number;
  cancels: number;
  /** Total time spent inside the engine, in milliseconds. */
  engineMs: number;
}

/**
 * Synthetic order flow around a drifting mid price: mostly passive limits,
 * some aggressive limits and market orders, and cancels of live orders.
 */
export class OrderFlow {
  readonly book = new OrderBook();
  readonly stats: FlowStats = { ops: 0, trades: 0, volume: 0, cancels: 0, engineMs: 0 };
  private readonly rand: () => number;
  private readonly live: number[] = [];
  private fair: number;

  constructor(readonly seed: number, startPrice = 10_000) {
    this.rand = prng(seed);
    this.fair = startPrice;
  }

  /** Run `n` operations; appends executed trades to `out`. */
  step(n: number, out: Trade[]): void {
    const book = this.book;
    const r = this.rand;
    const t0 = performance.now();
    for (let i = 0; i < n; i++) {
      // Fair value: slow mean-reverting random walk in ticks.
      this.fair += (r() - 0.5) * 0.6;
      const fair = Math.round(this.fair);
      const side: Side = r() < 0.5 ? "buy" : "sell";
      const u = r();
      const before = out.length;
      if (u < 0.62) {
        // Passive limit, 1..10 ticks away from fair, occasionally crossing.
        const offset = Math.floor(r() * 10) + (r() < 0.08 ? -3 : 1);
        const price = side === "buy" ? fair - offset : fair + offset;
        const qty = 1 + Math.floor(r() * r() * 40);
        const res = book.limit(side, price, qty, out);
        if (res.resting) this.live.push(res.id);
      } else if (u < 0.72) {
        book.market(side, 1 + Math.floor(r() * 25), out);
      } else if (this.live.length) {
        const k = Math.floor(r() * this.live.length);
        const id = this.live[k];
        this.live[k] = this.live[this.live.length - 1];
        this.live.pop();
        if (book.cancel(id)) this.stats.cancels++;
      }
      for (let j = before; j < out.length; j++) this.stats.volume += out[j].qty;
      this.stats.trades += out.length - before;
    }
    this.stats.engineMs += performance.now() - t0;
    this.stats.ops += n;
    // Drop ids that were filled since they were added, so cancels stay meaningful.
    if (this.live.length > 4096) this.live.splice(0, this.live.length - 2048);
  }
}
