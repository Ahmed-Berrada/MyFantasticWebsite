import { describe, expect, it } from "vitest";
import { histogramRun, lobCommittedMethod, lobReadmeMethod, median, summarize, type BenchResult } from "./index";

/** The JSON files are imported with a cast, so check their shape here: a file from the script must just work. */
describe.each([
  ["5 M operations after a warm-up", lobReadmeMethod],
  ["50 M operations", lobCommittedMethod],
] as [string, BenchResult][])("bench result: %s", (_, r) => {
  it("records the machine it ran on", () => {
    for (const k of ["model", "cpu", "os", "compiler", "governor"] as const) expect(r.machine[k], k).toMatch(/\S/);
  });

  it("has complete runs with ordered percentiles", () => {
    expect(r.runs.length).toBeGreaterThan(0);
    for (const run of r.runs) {
      expect(run.p50).toBeLessThanOrEqual(run.p99);
      expect(run.p99).toBeLessThanOrEqual(run.p999);
      expect(run.p999).toBeLessThanOrEqual(run.max);
      expect(run.throughput).toBeGreaterThan(0);
    }
  });

  it("has a histogram whose counts add up to the operations of one run", () => {
    const total = r.histogram.buckets.reduce((s, [, c]) => s + c, 0);
    expect(total).toBe(r.method.ops);
    expect(histogramRun(r)).toBeDefined();
  });

  it("summarises each metric as the median of the runs", () => {
    const s = summarize(r);
    expect(s.p50.median).toBe(median(r.runs.map((x) => x.p50)));
  });
});

describe("median", () => {
  it("takes the middle value, or the mean of the two middle values", () => {
    expect(median([3, 1, 2])).toBe(2);
    expect(median([4, 1, 3, 2])).toBe(2.5);
  });
});
