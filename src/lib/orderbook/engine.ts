/**
 * Limit order book with price-time priority.
 *
 * Mirrors the layout of the C++17 version of the engine: each price level holds an intrusive
 * doubly linked FIFO of orders, and an id -> order map gives O(1) cancel.
 * Prices are integer ticks so comparisons are exact.
 */

export type Side = "buy" | "sell";

export interface Trade {
  price: number;
  qty: number;
  makerId: number;
  takerId: number;
  aggressor: Side;
}

export interface DepthLevel {
  price: number;
  qty: number;
  orders: number;
}

export interface Depth {
  bids: DepthLevel[];
  asks: DepthLevel[];
}

interface Order {
  id: number;
  side: Side;
  price: number;
  qty: number;
  prev: Order | null;
  next: Order | null;
  level: Level;
}

interface Level {
  price: number;
  head: Order | null;
  tail: Order | null;
  qty: number;
  orders: number;
}

export class OrderBook {
  private readonly bidLevels = new Map<number, Level>();
  private readonly askLevels = new Map<number, Level>();
  /** Bid prices sorted best (highest) first. */
  private readonly bidPrices: number[] = [];
  /** Ask prices sorted best (lowest) first. */
  private readonly askPrices: number[] = [];
  private readonly orders = new Map<number, Order>();
  private nextId = 1;

  bestBid(): number | null {
    return this.bidPrices.length ? this.bidPrices[0] : null;
  }

  bestAsk(): number | null {
    return this.askPrices.length ? this.askPrices[0] : null;
  }

  /** Number of resting orders. */
  size(): number {
    return this.orders.size;
  }

  /**
   * Submit a limit order. Crosses against the opposite side first, then rests
   * the remainder. Returns the trades and the resting id (null if fully filled).
   */
  limit(side: Side, price: number, qty: number, trades: Trade[] = []): { id: number; resting: boolean; trades: Trade[] } {
    if (!Number.isInteger(price) || !Number.isInteger(qty) || qty <= 0) {
      throw new RangeError("price and qty must be integers, qty > 0");
    }
    const id = this.nextId++;
    const remaining = this.match(side, qty, price, id, trades);
    if (remaining > 0) {
      this.rest(id, side, price, remaining);
      return { id, resting: true, trades };
    }
    return { id, resting: false, trades };
  }

  /** Submit a market order. Unfilled quantity is dropped (immediate-or-cancel). */
  market(side: Side, qty: number, trades: Trade[] = []): { id: number; unfilled: number; trades: Trade[] } {
    if (!Number.isInteger(qty) || qty <= 0) throw new RangeError("qty must be a positive integer");
    const id = this.nextId++;
    const unfilled = this.match(side, qty, null, id, trades);
    return { id, unfilled, trades };
  }

  /** Cancel a resting order in O(1). Returns false if it is unknown or already filled. */
  cancel(id: number): boolean {
    const order = this.orders.get(id);
    if (!order) return false;
    this.unlink(order);
    return true;
  }

  depth(levels: number): Depth {
    const read = (prices: number[], book: Map<number, Level>): DepthLevel[] =>
      prices.slice(0, levels).map((p) => {
        const l = book.get(p)!;
        return { price: p, qty: l.qty, orders: l.orders };
      });
    return { bids: read(this.bidPrices, this.bidLevels), asks: read(this.askPrices, this.askLevels) };
  }

  private match(side: Side, qty: number, limit: number | null, takerId: number, trades: Trade[]): number {
    const prices = side === "buy" ? this.askPrices : this.bidPrices;
    const book = side === "buy" ? this.askLevels : this.bidLevels;
    let remaining = qty;
    while (remaining > 0 && prices.length > 0) {
      const best = prices[0];
      if (limit !== null && (side === "buy" ? best > limit : best < limit)) break;
      const level = book.get(best)!;
      while (remaining > 0 && level.head) {
        const maker = level.head;
        const fill = Math.min(remaining, maker.qty);
        trades.push({ price: best, qty: fill, makerId: maker.id, takerId, aggressor: side });
        remaining -= fill;
        maker.qty -= fill;
        level.qty -= fill;
        if (maker.qty === 0) this.unlink(maker);
      }
    }
    return remaining;
  }

  private rest(id: number, side: Side, price: number, qty: number): void {
    const book = side === "buy" ? this.bidLevels : this.askLevels;
    let level = book.get(price);
    if (!level) {
      level = { price, head: null, tail: null, qty: 0, orders: 0 };
      book.set(price, level);
      insertSorted(side === "buy" ? this.bidPrices : this.askPrices, price, side === "buy");
    }
    const order: Order = { id, side, price, qty, prev: level.tail, next: null, level };
    if (level.tail) level.tail.next = order;
    else level.head = order;
    level.tail = order;
    level.qty += qty;
    level.orders += 1;
    this.orders.set(id, order);
  }

  private unlink(order: Order): void {
    const level = order.level;
    if (order.prev) order.prev.next = order.next;
    else level.head = order.next;
    if (order.next) order.next.prev = order.prev;
    else level.tail = order.prev;
    level.qty -= order.qty;
    level.orders -= 1;
    this.orders.delete(order.id);
    if (level.orders === 0) {
      const isBid = order.side === "buy";
      (isBid ? this.bidLevels : this.askLevels).delete(level.price);
      const prices = isBid ? this.bidPrices : this.askPrices;
      prices.splice(prices.indexOf(level.price), 1);
    }
  }
}

/** Binary-search insert keeping `arr` sorted descending (bids) or ascending (asks). */
function insertSorted(arr: number[], value: number, descending: boolean): void {
  let lo = 0;
  let hi = arr.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    const before = descending ? arr[mid] > value : arr[mid] < value;
    if (before) lo = mid + 1;
    else hi = mid;
  }
  arr.splice(lo, 0, value);
}
