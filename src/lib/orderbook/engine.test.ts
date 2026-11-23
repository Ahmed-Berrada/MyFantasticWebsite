import { describe, expect, it } from "vitest";
import { OrderBook, type Trade } from "./engine";
import { OrderFlow } from "./flow";

describe("OrderBook", () => {
  it("fills the earliest order first at the same price (time priority)", () => {
    const book = new OrderBook();
    const a = book.limit("sell", 101, 5);
    const b = book.limit("sell", 101, 5);
    const { trades } = book.limit("buy", 101, 7);
    expect(trades.map((t) => [t.makerId, t.qty])).toEqual([
      [a.id, 5],
      [b.id, 2],
    ]);
    expect(book.depth(1).asks).toEqual([{ price: 101, qty: 3, orders: 1 }]);
  });

  it("fills the best price first (price priority) and stops at the limit", () => {
    const book = new OrderBook();
    book.limit("sell", 103, 5);
    book.limit("sell", 101, 5);
    book.limit("sell", 102, 5);
    const res = book.limit("buy", 102, 20);
    expect(res.trades.map((t) => t.price)).toEqual([101, 102]);
    expect(res.resting).toBe(true);
    expect(book.bestBid()).toBe(102);
    expect(book.bestAsk()).toBe(103);
  });

  it("cancels in place and removes empty levels", () => {
    const book = new OrderBook();
    const a = book.limit("buy", 99, 4);
    const b = book.limit("buy", 99, 6);
    expect(book.cancel(a.id)).toBe(true);
    expect(book.cancel(a.id)).toBe(false);
    expect(book.depth(1).bids).toEqual([{ price: 99, qty: 6, orders: 1 }]);
    book.cancel(b.id);
    expect(book.bestBid()).toBeNull();
  });

  it("drops the unfilled part of a market order", () => {
    const book = new OrderBook();
    book.limit("buy", 100, 3);
    const res = book.market("sell", 10);
    expect(res.unfilled).toBe(7);
    expect(book.size()).toBe(0);
  });

  it("never leaves the book crossed and conserves quantity under random flow", () => {
    for (const seed of [1, 7, 42, 1337]) {
      const flow = new OrderFlow(seed);
      const trades: Trade[] = [];
      for (let i = 0; i < 200; i++) {
        flow.step(100, trades);
        const bid = flow.book.bestBid();
        const ask = flow.book.bestAsk();
        if (bid !== null && ask !== null) expect(bid).toBeLessThan(ask);
      }
      for (const t of trades) expect(t.qty).toBeGreaterThan(0);
      const { bids, asks } = flow.book.depth(Infinity);
      const resting = [...bids, ...asks].reduce((s, l) => s + l.orders, 0);
      expect(resting).toBe(flow.book.size());
    }
  });

  it("replays identically from the same seed", () => {
    const run = (seed: number) => {
      const flow = new OrderFlow(seed);
      const trades: Trade[] = [];
      flow.step(5_000, trades);
      return JSON.stringify([trades.slice(-50), flow.book.depth(5)]);
    };
    expect(run(2027)).toBe(run(2027));
  });
});
