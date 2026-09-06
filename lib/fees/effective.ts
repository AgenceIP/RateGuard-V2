import type { RatePoint } from "@/lib/fx/frankfurter";
import type { PaymentHistoryEntry } from "@/lib/types";

/**
 * Measures what a provider *actually* charged, by comparing what the company
 * really paid against the ECB mid-market rate on that same day.
 *
 * This is the one place in the app where a fee figure is not an assumption:
 * it is derived from the user's own bank statement and a real published rate.
 * When it's available, it replaces the generic "typical fee" default in the
 * strategy comparator.
 */

export interface MeasuredPayment {
  paidAt: string;
  amountTargetCurrency: number;
  /** What actually left the account, in base currency. */
  actualCostBase: number;
  /** What it would have cost at the ECB mid-market rate that day, with no margin. */
  midMarketCostBase: number;
  /** Extra paid over mid-market, in base currency. */
  extraCostBase: number;
  /** Extra paid as a share of the mid-market cost. */
  marginPct: number;
  midRate: number;
}

export interface FeeAnalysis {
  payments: MeasuredPayment[];
  /** Cost-weighted average margin — a big payment counts more than a small one. */
  averageMarginPct: number;
  totalExtraCostBase: number;
  totalPaidBase: number;
  sampleSize: number;
  /** Estimated yearly cost of that margin, given the pay frequency. */
  annualExtraCostBase: number | null;
}

/** Nearest published rate on or before a date (FX data only exists on business days). */
function rateOnOrBefore(series: RatePoint[], date: string): number | null {
  let found: number | null = null;
  for (const point of series) {
    if (point.date <= date) found = point.rate;
    else break;
  }
  // A payment older than our history window falls back to the earliest point
  // we do have rather than being silently dropped.
  return found ?? series[0]?.rate ?? null;
}

export function analyzePastFees(
  history: PaymentHistoryEntry[],
  series: RatePoint[],
  paymentsPerYear: number | null,
): FeeAnalysis | null {
  if (series.length === 0) return null;

  const sorted = [...series].sort((a, b) => a.date.localeCompare(b.date));
  const payments: MeasuredPayment[] = [];

  for (const entry of history) {
    const actualCostBase = resolveActualCost(entry, sorted);
    if (actualCostBase === null || actualCostBase <= 0) continue;

    const midRate = rateOnOrBefore(sorted, entry.paid_at);
    if (!midRate || midRate <= 0) continue;

    const midMarketCostBase = entry.amount_source_currency / midRate;
    if (midMarketCostBase <= 0) continue;

    payments.push({
      paidAt: entry.paid_at,
      amountTargetCurrency: entry.amount_source_currency,
      actualCostBase,
      midMarketCostBase,
      extraCostBase: actualCostBase - midMarketCostBase,
      marginPct: (actualCostBase - midMarketCostBase) / midMarketCostBase,
      midRate,
    });
  }

  if (payments.length === 0) return null;

  const totalExtraCostBase = payments.reduce((sum, p) => sum + p.extraCostBase, 0);
  const totalMidBase = payments.reduce((sum, p) => sum + p.midMarketCostBase, 0);
  const totalPaidBase = payments.reduce((sum, p) => sum + p.actualCostBase, 0);
  const averageMarginPct = totalMidBase > 0 ? totalExtraCostBase / totalMidBase : 0;

  const averageExtraPerPayment = totalExtraCostBase / payments.length;

  return {
    payments: payments.sort((a, b) => b.paidAt.localeCompare(a.paidAt)),
    averageMarginPct,
    totalExtraCostBase,
    totalPaidBase,
    sampleSize: payments.length,
    annualExtraCostBase: paymentsPerYear ? averageExtraPerPayment * paymentsPerYear : null,
  };
}

/**
 * Prefers the total debited from the account (what a bank statement shows).
 * Falls back to the older rate + fees fields when that's all the user recorded.
 */
function resolveActualCost(entry: PaymentHistoryEntry, series: RatePoint[]): number | null {
  if (entry.total_cost_base_currency && entry.total_cost_base_currency > 0) {
    return entry.total_cost_base_currency;
  }

  if (entry.fx_rate_used && entry.fx_rate_used > 0) {
    return entry.amount_source_currency / entry.fx_rate_used + (entry.fees_paid ?? 0);
  }

  // Only fees recorded: not enough to measure a margin honestly.
  void series;
  return null;
}
