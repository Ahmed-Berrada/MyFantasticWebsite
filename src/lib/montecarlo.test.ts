import { describe, expect, it } from "vitest";
import { blackScholesCall, CallEstimator, normCdf } from "./montecarlo";
import { prng } from "./prng";

const params = { s0: 100, k: 100, r: 0.05, sigma: 0.2, t: 1 };

describe("pricing", () => {
  it("normCdf matches known values", () => {
    expect(normCdf(0)).toBeCloseTo(0.5, 7);
    expect(normCdf(1.96)).toBeCloseTo(0.975, 3);
    expect(normCdf(-1)).toBeCloseTo(0.158655, 5);
  });

  it("Black-Scholes call matches the textbook value", () => {
    expect(blackScholesCall(params)).toBeCloseTo(10.4506, 3);
  });

  it("Monte Carlo converges to Black-Scholes within its confidence interval", () => {
    const est = new CallEstimator(params);
    est.simulate(200_000, prng(7));
    expect(Math.abs(est.price - blackScholesCall(params))).toBeLessThan(est.ci95);
    expect(est.ci95).toBeLessThan(0.05);
  });
});
