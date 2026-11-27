/**
 * The GPU option pricer's original run, from the outputs saved in the notebook of
 * https://github.com/Ahmed-Berrada/Monte-Carlo-Option-Pricing (GPU_programming_mini_project.ipynb).
 * European call, S0 = 100, K = 105, r = 5 %, sigma = 20 %, T = 1 year. The GPU model was not recorded.
 */
export const pricerRun = {
  paths: 100_000_000,
  seconds: { python: 294.8211, numpy: 7.4372, cupy: 0.4556 },
} as const;
