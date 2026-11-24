/** European call pricing: closed form and Monte Carlo under GBM (risk-neutral). */

export interface OptionParams {
  s0: number;
  k: number;
  r: number;
  sigma: number;
  t: number;
}

/** Standard normal CDF via erf (Abramowitz & Stegun 7.1.26, |error| < 1.5e-7). */
export function normCdf(x: number): number {
  const z = Math.abs(x) / Math.SQRT2;
  const t = 1 / (1 + 0.3275911 * z);
  const poly = t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429))));
  const erf = 1 - poly * Math.exp(-z * z);
  return x >= 0 ? 0.5 * (1 + erf) : 0.5 * (1 - erf);
}

export function blackScholesCall({ s0, k, r, sigma, t }: OptionParams): number {
  const d1 = (Math.log(s0 / k) + (r + (sigma * sigma) / 2) * t) / (sigma * Math.sqrt(t));
  const d2 = d1 - sigma * Math.sqrt(t);
  return s0 * normCdf(d1) - k * Math.exp(-r * t) * normCdf(d2);
}

/** Box-Muller: turns two uniforms into a standard normal (the cosine branch). */
export function boxMuller(rand: () => number): number {
  let u = 0;
  while (u === 0) u = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand());
}

/** Running Monte Carlo estimator using antithetic variates (Z and -Z). */
export class CallEstimator {
  private n = 0;
  private sum = 0;
  private sumSq = 0;
  private readonly drift: number;
  private readonly vol: number;
  private readonly discount: number;

  constructor(private readonly p: OptionParams) {
    this.drift = (p.r - (p.sigma * p.sigma) / 2) * p.t;
    this.vol = p.sigma * Math.sqrt(p.t);
    this.discount = Math.exp(-p.r * p.t);
  }

  /** Simulate `pairs` antithetic pairs (2 × pairs terminal prices). */
  simulate(pairs: number, rand: () => number): void {
    const { s0, k } = this.p;
    for (let i = 0; i < pairs; i++) {
      const z = boxMuller(rand);
      const up = s0 * Math.exp(this.drift + this.vol * z);
      const down = s0 * Math.exp(this.drift - this.vol * z);
      const y = (Math.max(up - k, 0) + Math.max(down - k, 0)) / 2;
      this.sum += y;
      this.sumSq += y * y;
      this.n++;
    }
  }

  /** Number of simulated terminal prices. */
  get paths(): number {
    return this.n * 2;
  }

  get price(): number {
    return this.n ? this.discount * (this.sum / this.n) : 0;
  }

  /** Half-width of the 95% confidence interval. */
  get ci95(): number {
    if (this.n < 2) return Infinity;
    const mean = this.sum / this.n;
    const variance = (this.sumSq - this.n * mean * mean) / (this.n - 1);
    return 1.96 * this.discount * Math.sqrt(variance / this.n);
  }
}
