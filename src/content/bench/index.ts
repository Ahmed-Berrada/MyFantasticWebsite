import readmeMethod from "./lob-i7-10510u.json";
import committedMethod from "./lob-i7-10510u-committed.json";
import idMapProbe from "./lob-id-map-probe.json";

export interface BenchRun {
  throughput: number;
  mean: number;
  p50: number;
  p99: number;
  p999: number;
  max: number;
}

export interface BenchResult {
  date: string;
  repoCommit: string;
  machine: { model: string; cpu: string; os: string; compiler: string; governor: string; pinnedCpu: string | null };
  method: { name: string; ops: number; warmup: number; seed: number; flags: string; mix: string };
  timerOverheadNs: number;
  loadAverage1m: { before: number; after: number };
  runs: BenchRun[];
  histogram: { bucketsPerOctave: number; buckets: [number, number][]; fromRunWithP50: number };
}

/** What the lob-engine README publishes (README.en.md). It does not record the hardware. */
export const lobPublished = { throughput: 3_460_000, mean: 253.16, p50: 163, p99: 996, p999: 5517 } as const;

export const lobReadmeMethod = readmeMethod as BenchResult;
export const lobCommittedMethod = committedMethod as BenchResult;
export const lobIdMapProbe = idMapProbe;

export function median(xs: number[]): number {
  const s = [...xs].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

export interface Summary {
  median: number;
  min: number;
  max: number;
}

export function summarize(r: BenchResult): Record<keyof BenchRun, Summary> {
  const keys: (keyof BenchRun)[] = ["throughput", "mean", "p50", "p99", "p999", "max"];
  return Object.fromEntries(
    keys.map((k) => {
      const xs = r.runs.map((x) => x[k]);
      return [k, { median: median(xs), min: Math.min(...xs), max: Math.max(...xs) }];
    }),
  ) as Record<keyof BenchRun, Summary>;
}

/** The run whose histogram is stored: the one whose median latency is the median of the runs. */
export function histogramRun(r: BenchResult): BenchRun {
  return r.runs.find((x) => x.p50 === r.histogram.fromRunWithP50) ?? r.runs[0];
}
