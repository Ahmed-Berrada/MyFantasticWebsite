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

const yieldToQueue = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

ctx.onmessage = async (e) => {
  const m = e.data;
  const id = ++current;
  if (m.type === "snapshot") {
    post(snapshot(m.seed), 0, true, false);
    return;
  }
  const s = newSim(m.seed);
  post(s, 0, true, false);
  let sent = 0;
  let last = performance.now();
  while (s.est.paths < TARGET_PATHS) {
    if (id !== current) return; // a newer request replaced this run
    stepSim(s, PAIRS_PER_FRAME);
    if (!m.instant && performance.now() - last >= 40) {
      post(s, sent, false, false);
      sent = s.paths.length;
      last = performance.now();
      await yieldToQueue();
    }
  }
  post(s, sent, false, true);
};
