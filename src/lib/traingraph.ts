import { prng } from "./prng";

/**
 * A Marey-style train graph model: stations along a line, trains running both ways,
 * each with run segments between stations and dwells at them. Times are simulated seconds.
 */

export interface Waypoint {
  t: number;
  /** Position along the line, 0 (first station) to 1 (last station). */
  y: number;
}

export interface Train {
  id: number;
  dir: 1 | -1;
  path: Waypoint[];
}

export type TrainState =
  | { kind: "dwell"; station: number; leavesIn: number }
  | { kind: "run"; nextStation: number; arrivesIn: number };

const TOTAL_RUN_S = 960; // end-to-end running time, excluding dwells
const DWELL_S = 26;
const HEADWAY_S = 150;

export class TrainGraph {
  readonly stations: number[];
  readonly trains: Train[] = [];
  private readonly rand: () => number;
  private nextDeparture: [number, number];
  private nextId = 1;

  constructor(seed: number, count = 13, startAt = -2600) {
    this.rand = prng(seed);
    // Uneven spacing, like a real line.
    const gaps = Array.from({ length: count - 1 }, () => 0.6 + this.rand());
    const total = gaps.reduce((a, b) => a + b, 0);
    let acc = 0;
    this.stations = [0, ...gaps.map((g) => (acc += g / total))];
    this.stations[count - 1] = 1;
    this.nextDeparture = [startAt, startAt + HEADWAY_S / 2];
  }

  /** Make sure every train departing before `until` exists. */
  schedule(until: number): void {
    for (const d of [0, 1] as const) {
      while (this.nextDeparture[d] < until) {
        this.trains.push(this.build(this.nextDeparture[d], d === 0 ? 1 : -1));
        this.nextDeparture[d] += HEADWAY_S * (0.75 + this.rand() * 0.5);
      }
    }
  }

  /** Drop trains that finished before `t`. */
  prune(t: number): void {
    let i = 0;
    while (i < this.trains.length && this.trains[i].path[this.trains[i].path.length - 1].t < t) i++;
    if (i > 0) this.trains.splice(0, i);
  }

  positionAt(train: Train, t: number): number | null {
    const p = train.path;
    if (t < p[0].t || t > p[p.length - 1].t) return null;
    for (let i = 1; i < p.length; i++) {
      if (t <= p[i].t) {
        const a = p[i - 1];
        const b = p[i];
        return b.t === a.t ? b.y : a.y + ((t - a.t) / (b.t - a.t)) * (b.y - a.y);
      }
    }
    return null;
  }

  stateAt(train: Train, t: number): TrainState | null {
    const p = train.path;
    for (let i = 1; i < p.length; i++) {
      if (t >= p[i - 1].t && t <= p[i].t) {
        const a = p[i - 1];
        const b = p[i];
        if (a.y === b.y) return { kind: "dwell", station: this.stationIndex(a.y) + 1, leavesIn: b.t - t };
        return { kind: "run", nextStation: this.stationIndex(b.y) + 1, arrivesIn: b.t - t };
      }
    }
    return null;
  }

  private stationIndex(y: number): number {
    let best = 0;
    for (let i = 1; i < this.stations.length; i++) {
      if (Math.abs(this.stations[i] - y) < Math.abs(this.stations[best] - y)) best = i;
    }
    return best;
  }

  private build(t0: number, dir: 1 | -1): Train {
    const order = dir === 1 ? this.stations : [...this.stations].reverse();
    const pace = 0.92 + this.rand() * 0.16;
    const path: Waypoint[] = [{ t: t0, y: order[0] }];
    let t = t0;
    for (let i = 1; i < order.length; i++) {
      t += Math.abs(order[i] - order[i - 1]) * TOTAL_RUN_S * pace;
      path.push({ t, y: order[i] });
      if (i < order.length - 1) {
        t += DWELL_S * (0.6 + this.rand() * 0.8);
        path.push({ t, y: order[i] });
      }
    }
    return { id: this.nextId++, dir, path };
  }
}
