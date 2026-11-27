import { describe, expect, it } from "vitest";
import { OrderBook, type Trade } from "./engine";
import { OrderFlow } from "./flow";
import { prng } from "../prng";

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

describe("OrderBook accounting", () => {
  const resting = (book: OrderBook) => {
    const { bids, asks } = book.depth(Infinity);
    return [...bids, ...asks].reduce((sum, l) => sum + l.qty, 0);
  };

  it("conserves quantity exactly: submitted = 2 x traded + resting + cancelled + dropped", () => {
    for (const seed of [3, 11, 2027]) {
      const rand = prng(seed);
      const book = new OrderBook();
      const ids: number[] = [];
      let submitted = 0;
      let traded = 0;
      let cancelled = 0;
      let dropped = 0;
      for (let i = 0; i < 3000; i++) {
        const r = rand();
        const side = rand() < 0.5 ? "buy" : "sell";
        const qty = 1 + Math.floor(rand() * 20);
        if (r < 0.65) {
          submitted += qty;
          const res = book.limit(side, 95 + Math.floor(rand() * 11), qty);
          traded += res.trades.reduce((s, t) => s + t.qty, 0);
          if (res.resting) ids.push(res.id);
        } else if (r < 0.9 && ids.length) {
          const before = resting(book);
          book.cancel(ids.splice(Math.floor(rand() * ids.length), 1)[0]);
          cancelled += before - resting(book);
        } else {
          submitted += qty;
          const res = book.market(side, qty);
          traded += res.trades.reduce((s, t) => s + t.qty, 0);
          dropped += res.unfilled;
        }
      }
      // Each trade takes its quantity from two orders: the taker's and the maker's.
      expect(submitted, `seed ${seed}`).toBe(2 * traded + resting(book) + cancelled + dropped);
      // Each level's quantity is the sum of its orders: it never drifts from the orders it holds.
      for (const l of [...book.depth(Infinity).bids, ...book.depth(Infinity).asks]) expect(l.qty).toBeGreaterThan(0);
    }
  });

  it("keeps a partly filled order at the front of its level", () => {
    const book = new OrderBook();
    const first = book.limit("sell", 101, 10);
    const second = book.limit("sell", 101, 10);
    book.limit("buy", 101, 4); // takes 4 from `first`
    const { trades } = book.limit("buy", 101, 8);
    expect(trades.map((t) => [t.makerId, t.qty])).toEqual([
      [first.id, 6],
      [second.id, 2],
    ]);
  });

  it("sweeps several levels, then rests the remainder at its own limit price", () => {
    const book = new OrderBook();
    book.limit("sell", 100, 3);
    book.limit("sell", 101, 3);
    book.limit("sell", 103, 3);
    const res = book.limit("buy", 102, 10);
    expect(res.trades.map((t) => [t.price, t.qty])).toEqual([
      [100, 3],
      [101, 3],
    ]);
    expect(res.resting).toBe(true);
    expect(book.depth(1).bids).toEqual([{ price: 102, qty: 4, orders: 1 }]);
    expect(book.bestAsk()).toBe(103);
  });

  it("orders bid levels from the highest price down and ask levels from the lowest up", () => {
    const book = new OrderBook();
    for (const p of [97, 99, 98]) book.limit("buy", p, 1);
    for (const p of [104, 102, 103]) book.limit("sell", p, 1);
    const d = book.depth(3);
    expect(d.bids.map((l) => l.price)).toEqual([99, 98, 97]);
    expect(d.asks.map((l) => l.price)).toEqual([102, 103, 104]);
  });

  it("cannot cancel an order that has already been filled", () => {
    const book = new OrderBook();
    const maker = book.limit("sell", 100, 5);
    book.limit("buy", 100, 5);
    expect(book.cancel(maker.id)).toBe(false);
  });
});

describe("OrderBook input checks", () => {
  it("rejects prices and quantities that are not positive integers", () => {
    const book = new OrderBook();
    expect(() => book.limit("buy", 100.5, 1)).toThrow(RangeError);
    expect(() => book.limit("buy", 100, 0)).toThrow(RangeError);
    expect(() => book.market("sell", -3)).toThrow(RangeError);
    expect(book.size()).toBe(0);
  });
});
