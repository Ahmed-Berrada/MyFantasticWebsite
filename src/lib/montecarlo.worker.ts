import { newSim, PAIRS_PER_FRAME, snapshot, statsOf, stepSim, TARGET_PATHS, type Sim } from "./mcsim";

/** Messages the demo sends to this worker, and what comes back. */
export type WorkerIn = { type: "snapshot"; seed: number } | { type: "run"; seed: number; instant: boolean };
export type WorkerOut = {
  type: "frame";
  paths: number;
  price: number;
  ci: number;
  hist: Uint32Array;
  /** Price paths added since the previous frame. */
  newPaths: Float64Array[];
  /** The view should be cleared before applying this frame. */
  reset: boolean;
  done: boolean;
};

const ctx = self as unknown as { postMessage(message: unknown): void; onmessage: ((e: MessageEvent<WorkerIn>) => void) | null };

let current = 0;

function post(s: Sim, from: number, reset: boolean, done: boolean): void {
  const out: WorkerOut = { type: "frame", ...statsOf(s), hist: s.hist.slice(), newPaths: s.paths.slice(from), reset, done };
  ctx.postMessage(out);
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** A run lasts about RUN_FRAMES x RUN_FRAME_MS: 45 frames of 60 ms, under three seconds. */
const RUN_FRAMES = 45;
const RUN_FRAME_MS = 60;

ctx.onmessage = async (e) => {
  const m = e.data;
  const id = ++current;
  if (m.type === "snapshot") {
    post(snapshot(m.seed), 0, true, false);
    return;
  }
  const s = newSim(m.seed);
  post(s, 0, true, false);
  if (m.instant) {
    while (s.est.paths < TARGET_PATHS) stepSim(s, PAIRS_PER_FRAME);
    post(s, 0, false, true);
    return;
  }
  // Paced by time, not by CPU: the run grows geometrically from about a thousand paths to a million over a few
  // seconds, so the interval visibly narrows on any device. The work itself stays off the main thread.
  let sent = 0;
  for (let f = 1; f <= RUN_FRAMES; f++) {
    const started = performance.now();
    const goal = Math.min(TARGET_PATHS, Math.round(1000 * Math.pow(TARGET_PATHS / 1000, f / RUN_FRAMES)));
    while (s.est.paths < goal) {
      if (id !== current) return; // a newer request replaced this run
      stepSim(s, Math.min(PAIRS_PER_FRAME, Math.ceil((goal - s.est.paths) / 2)));
    }
    const done = f === RUN_FRAMES;
    post(s, sent, false, done);
    sent = s.paths.length;
    if (!done) await sleep(Math.max(0, RUN_FRAME_MS - (performance.now() - started)));
  }
};
