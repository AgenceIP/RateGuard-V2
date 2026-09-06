import type { RatePoint } from "./frankfurter";

/**
 * All the math here follows one non-negotiable rule: never predict direction.
 * We only ever describe the *dispersion* (how much a rate typically moves),
 * never a signed "it will go up/down". Where a distribution could carry a
 * historical drift (average trend), we explicitly de-mean it first so an
 * "expected" value collapses back to "no change from today's rate" and only
 * the spread communicates risk.
 */

export interface WindowStats {
  windowDays: number;
  sampleWindows: number;
  p10: number; // 10th percentile of de-meaned % change over the window
  p50: number;
  p90: number;
}

export interface VolatilityStats {
  periodDays: number;
  sampleDays: number;
  annualizedPct: number; // annualized stdev of daily log returns, as %
}

export interface CurrencyRiskStats {
  currency: string;
  asOfDate: string | null;
  dataAvailable: boolean;
  vol30d: VolatilityStats | null;
  vol90d: VolatilityStats | null;
  vol365d: VolatilityStats | null;
  typicalWindowMove: WindowStats | null;
  demeanedDailyReturns: number[]; // exposed for bootstrap simulation reuse
}

export function dailyLogReturns(series: RatePoint[]): number[] {
  const returns: number[] = [];
  for (let i = 1; i < series.length; i++) {
    const prev = series[i - 1].rate;
    const curr = series[i].rate;
    if (prev > 0 && curr > 0) returns.push(Math.log(curr / prev));
  }
  return returns;
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function stdev(values: number[]): number {
  if (values.length < 2) return 0;
  const m = mean(values);
  const variance = values.reduce((sum, v) => sum + (v - m) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

function percentile(sortedAsc: number[], p: number): number {
  if (sortedAsc.length === 0) return 0;
  const idx = (sortedAsc.length - 1) * p;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sortedAsc[lo];
  const weight = idx - lo;
  return sortedAsc[lo] * (1 - weight) + sortedAsc[hi] * weight;
}

const TRADING_DAYS_PER_YEAR = 252;

function computeVolatilityForWindow(series: RatePoint[], periodDays: number): VolatilityStats | null {
  const cutoffDate = new Date(series[series.length - 1]?.date ?? Date.now());
  cutoffDate.setUTCDate(cutoffDate.getUTCDate() - periodDays);
  const cutoffISO = cutoffDate.toISOString().slice(0, 10);

  const windowSeries = series.filter((p) => p.date >= cutoffISO);
  if (windowSeries.length < 5) return null;

  const returns = dailyLogReturns(windowSeries);
  if (returns.length < 4) return null;

  const dailyStdev = stdev(returns);
  const annualizedPct = dailyStdev * Math.sqrt(TRADING_DAYS_PER_YEAR) * 100;

  return { periodDays, sampleDays: returns.length, annualizedPct };
}

/** % change distribution over rolling windows of `windowDays`, de-meaned (no drift). */
function computeTypicalWindowMove(series: RatePoint[], windowDays: number): WindowStats | null {
  if (series.length < 10) return null;

  const byDate = new Map(series.map((p) => [p.date, p.rate]));
  const dates = series.map((p) => p.date);

  const changes: number[] = [];
  for (let i = 0; i < dates.length; i++) {
    const startDate = new Date(dates[i] + "T00:00:00Z");
    const targetDate = new Date(startDate);
    targetDate.setUTCDate(targetDate.getUTCDate() + windowDays);

    // FX data only exists on business days; look forward up to 4 days for
    // the nearest available point instead of demanding an exact match.
    let match: number | undefined;
    for (let offset = 0; offset <= 4; offset++) {
      const d = new Date(targetDate);
      d.setUTCDate(d.getUTCDate() + offset);
      match = byDate.get(d.toISOString().slice(0, 10));
      if (match !== undefined) break;
    }
    if (match === undefined) continue;

    const startRate = byDate.get(dates[i]);
    if (!startRate) continue;
    changes.push(match / startRate - 1);
  }

  if (changes.length < 8) return null;

  const m = mean(changes);
  const demeaned = changes.map((c) => c - m).sort((a, b) => a - b);

  return {
    windowDays,
    sampleWindows: demeaned.length,
    p10: percentile(demeaned, 0.1) * 100,
    p50: percentile(demeaned, 0.5) * 100,
    p90: percentile(demeaned, 0.9) * 100,
  };
}

export function computeCurrencyRiskStats(
  currency: string,
  series: RatePoint[],
  payFrequencyDays: number,
): CurrencyRiskStats {
  if (series.length === 0) {
    return {
      currency,
      asOfDate: null,
      dataAvailable: false,
      vol30d: null,
      vol90d: null,
      vol365d: null,
      typicalWindowMove: null,
      demeanedDailyReturns: [],
    };
  }

  const allReturns = dailyLogReturns(series);
  const m = mean(allReturns);
  const demeanedDailyReturns = allReturns.map((r) => r - m);

  return {
    currency,
    asOfDate: series[series.length - 1].date,
    dataAvailable: true,
    vol30d: computeVolatilityForWindow(series, 30),
    vol90d: computeVolatilityForWindow(series, 90),
    vol365d: computeVolatilityForWindow(series, 365),
    typicalWindowMove: computeTypicalWindowMove(series, payFrequencyDays),
    demeanedDailyReturns,
  };
}

export interface BootstrapResult {
  sims: number;
  p10Factor: number; // multiplicative factor vs today's rate
  p50Factor: number;
  p90Factor: number;
}

/**
 * Bootstrap-resamples de-meaned historical daily returns to characterize the
 * *dispersion* of a cumulative rate move over `horizonDays`. Because the
 * returns are de-meaned, the median factor stays ~1 (today's rate) — this
 * models risk/uncertainty, not a forecast.
 */
export function bootstrapHorizonFactor(
  demeanedDailyReturns: number[],
  horizonDays: number,
  sims = 3000,
): BootstrapResult | null {
  if (demeanedDailyReturns.length < 10 || horizonDays <= 0) return null;

  const factors: number[] = [];
  for (let s = 0; s < sims; s++) {
    let logSum = 0;
    for (let d = 0; d < horizonDays; d++) {
      const idx = Math.floor(Math.random() * demeanedDailyReturns.length);
      logSum += demeanedDailyReturns[idx];
    }
    factors.push(Math.exp(logSum));
  }
  factors.sort((a, b) => a - b);

  return {
    sims,
    p10Factor: percentile(factors, 0.1),
    p50Factor: percentile(factors, 0.5),
    p90Factor: percentile(factors, 0.9),
  };
}

/**
 * Same idea, but for N equally-spaced sub-payments (DCA) instead of one lump
 * sum at the horizon — the blended factor is the equal-weighted average of
 * the factor at each installment date, which mechanically has lower variance
 * than a single draw at the horizon. That variance reduction (not a
 * directional bet) is the whole point of dollar-cost-averaging.
 */
export function bootstrapDcaFactor(
  demeanedDailyReturns: number[],
  horizonDays: number,
  installments: number,
  sims = 3000,
): BootstrapResult | null {
  if (demeanedDailyReturns.length < 10 || horizonDays <= 0 || installments < 2) return null;

  const step = horizonDays / installments;
  const installmentDays = Array.from({ length: installments }, (_, i) => Math.round(step * (i + 1)));

  const factors: number[] = [];
  for (let s = 0; s < sims; s++) {
    let logCumulative = 0;
    let nextInstallmentIdx = 0;
    let blended = 0;
    for (let d = 1; d <= horizonDays; d++) {
      const idx = Math.floor(Math.random() * demeanedDailyReturns.length);
      logCumulative += demeanedDailyReturns[idx];
      if (nextInstallmentIdx < installmentDays.length && d === installmentDays[nextInstallmentIdx]) {
        blended += Math.exp(logCumulative) / installments;
        nextInstallmentIdx++;
      }
    }
    factors.push(blended);
  }
  factors.sort((a, b) => a - b);

  return {
    sims,
    p10Factor: percentile(factors, 0.1),
    p50Factor: percentile(factors, 0.5),
    p90Factor: percentile(factors, 0.9),
  };
}
