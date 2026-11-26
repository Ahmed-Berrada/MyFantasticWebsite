import { blackScholesCall, boxMuller, CallEstimator, type OptionParams } from "./montecarlo";
import { prng } from "./prng";

/** The option and the simulation shape behind the live Monte Carlo demo. Pure functions, run in a Web Worker. */
export const P: OptionParams = { s0: 100, k: 100, r: 0.05, sigma: 0.2, t: 1 };
export const BS = blackScholesCall(P);
export const STEPS = 64;
export const MAX_DRAWN = 180;
export const DRAW_PER_FRAME = 3;
export const PAIRS_PER_FRAME = 5_000;
export const SNAPSHOT_FRAMES = MAX_DRAWN / DRAW_PER_FRAME;
export const SNAPSHOT_PAIRS = 1_700;
export const TARGET_PATHS = 1_000_000;
export const Y_MIN = 55;
export const Y_MAX = 175;
export const BINS = 48;

export interface Sim {
  /** Price paths kept for drawing (a few hundred at most). */
  paths: Float64Array[];
  /** Histogram of terminal prices over [Y_MIN, Y_MAX]. */
  hist: Uint32Array;
  est: CallEstimator;
  rand: () => number;
}

export const newSim = (seed: number): Sim => ({ paths: [], hist: new Uint32Array(BINS), est: new CallEstimator(P), rand: prng(seed) });

/** One frame's worth of work: a few drawn paths, a histogram sample, and `pairs` priced antithetic pairs. */
export function stepSim(s: Sim, pairs: number): void {
  const dt = P.t / STEPS;
  const drift = (P.r - (P.sigma * P.sigma) / 2) * dt;
  const vol = P.sigma * Math.sqrt(dt);
  for (let n = 0; n < DRAW_PER_FRAME && s.paths.length < MAX_DRAWN; n++) {
    const path = new Float64Array(STEPS + 1);
    path[0] = P.s0;
    for (let i = 1; i <= STEPS; i++) path[i] = path[i - 1] * Math.exp(drift + vol * boxMuller(s.rand));
    s.paths.push(path);
  }
  const tDrift = (P.r - (P.sigma * P.sigma) / 2) * P.t;
  const tVol = P.sigma * Math.sqrt(P.t);
  for (let i = 0; i < 400; i++) {
    const st = P.s0 * Math.exp(tDrift + tVol * boxMuller(s.rand));
    const b = Math.floor(((st - Y_MIN) / (Y_MAX - Y_MIN)) * BINS);
    if (b >= 0 && b < BINS) s.hist[b]++;
  }
  s.est.simulate(pairs, s.rand);
}

/** A cheap first picture so the panel is never empty: 180 paths and about 204,000 simulated paths. */
export function snapshot(seed: number): Sim {
  const s = newSim(seed);
  for (let i = 0; i < SNAPSHOT_FRAMES; i++) stepSim(s, SNAPSHOT_PAIRS);
  return s;
}

export const statsOf = (s: Sim) => ({ paths: s.est.paths, price: s.est.price, ci: s.est.ci95 });
