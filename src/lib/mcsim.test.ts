import { describe, expect, it } from "vitest";
import { BS, newSim, PAIRS_PER_FRAME, snapshot, stepSim, TARGET_PATHS } from "./mcsim";

describe("monte carlo demo simulation", () => {
  it("opens on a snapshot that is already inside its own 95 % interval", () => {
    const s = snapshot(17);
    expect(s.paths).toHaveLength(180);
    expect(s.est.paths).toBeGreaterThan(200_000);
    expect(Math.abs(s.est.price - BS)).toBeLessThan(s.est.ci95);
  });

  it("is deterministic for a given seed", () => {
    const a = snapshot(5);
    const b = snapshot(5);
    expect(a.est.price).toBe(b.est.price);
    expect(Array.from(a.hist)).toEqual(Array.from(b.hist));
  });

  it("a full first run ends inside its interval, with a narrow one", () => {
    const s = newSim(18);
    while (s.est.paths < TARGET_PATHS) stepSim(s, PAIRS_PER_FRAME);
    expect(s.est.paths).toBe(TARGET_PATHS);
    expect(Math.abs(s.est.price - BS)).toBeLessThan(s.est.ci95);
    expect(s.est.ci95).toBeLessThan(0.03);
  });
});
