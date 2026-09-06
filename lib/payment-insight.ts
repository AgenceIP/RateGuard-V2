import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getHistoricalRates, getSupportedCurrencies, UnsupportedCurrencyError } from "@/lib/fx/frankfurter";
import { computeCurrencyRiskStats, type VolatilityStats, type WindowStats } from "@/lib/fx/stats";
import { compareStrategies, type CompareOutput } from "@/lib/strategies/compare";
import { generatePlainSummary } from "@/lib/copy/plain-summary";
import { analyzePastFees, type FeeAnalysis } from "@/lib/fees/effective";
import { buildDemoHistory } from "@/lib/demo-data";
import { frequencyToDays, type Employee, type PaymentHistoryEntry } from "@/lib/types";

export interface PaymentInsight {
  dataAvailable: boolean;
  unsupportedCurrency: boolean;
  spotRate: number | null;
  asOfDate: string | null;
  compare: CompareOutput | null;
  plainSummary: string;
  horizonDays: number;
  vol30d: VolatilityStats | null;
  vol90d: VolatilityStats | null;
  vol365d: VolatilityStats | null;
  typicalWindowMove: WindowStats | null;
  /** Last ~90 real observations, for the rate history sparkline. */
  recentHistory: { date: string; rate: number }[];
  /** What the provider actually charged on past payments, when history exists. */
  feeAnalysis: FeeAnalysis | null;
  /** True when the spot fee used in the comparison was measured, not assumed. */
  feeSourceIsMeasured: boolean;
  paymentsPerYear: number;
}

function daysUntil(dateISO: string): number {
  const target = new Date(dateISO + "T00:00:00Z").getTime();
  const now = Date.now();
  return Math.max(1, Math.round((target - now) / 86400000));
}

/** Real rows when connected; demo rows priced off real rates otherwise. */
async function loadPaymentHistory(
  supabase: SupabaseClient | null,
  employee: Employee,
  series: { date: string; rate: number }[],
): Promise<PaymentHistoryEntry[]> {
  if (!supabase) return buildDemoHistory(employee, series);

  const { data } = await supabase
    .from("payment_history")
    .select("*")
    .eq("employee_id", employee.id)
    .order("paid_at", { ascending: false })
    .limit(24);

  return (data as PaymentHistoryEntry[]) ?? [];
}

export interface PaymentInsightOptions {
  fees?: Partial<{
    spotPct: number;
    forwardFeePct: number;
    forwardRateDifferentialPct: number;
    multiCurrencyFeePct: number;
  }>;
  dcaInstallments?: number;
}

export async function computePaymentInsight(
  supabase: SupabaseClient | null,
  employee: Employee,
  baseCurrency: string,
  shariaMode: boolean,
  options: PaymentInsightOptions = {},
): Promise<PaymentInsight> {
  const horizonDays = employee.next_payment_date ? daysUntil(employee.next_payment_date) : 14;
  const frequencyDays = frequencyToDays(employee.frequency, employee.custom_frequency_days);
  const dueDateLabel = employee.next_payment_date
    ? new Date(employee.next_payment_date + "T00:00:00Z").toLocaleDateString("en-CA", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "soon";

  try {
    const supportedCurrencies = await getSupportedCurrencies();
    if (!supportedCurrencies.has(employee.currency) || !supportedCurrencies.has(baseCurrency)) {
      throw new UnsupportedCurrencyError(employee.currency);
    }

    const series = await getHistoricalRates(supabase, baseCurrency, employee.currency, 400);
    const riskStats = computeCurrencyRiskStats(employee.currency, series, frequencyDays);

    if (!riskStats.dataAvailable || series.length === 0) {
      return {
        dataAvailable: false,
        unsupportedCurrency: false,
        spotRate: null,
        asOfDate: null,
        compare: null,
        horizonDays,
        vol30d: null,
        vol90d: null,
        vol365d: null,
        typicalWindowMove: null,
        recentHistory: [],
        feeAnalysis: null,
        feeSourceIsMeasured: false,
        paymentsPerYear: Math.round(365 / frequencyDays),
        plainSummary: `Not enough history on ${employee.currency} to estimate this risk.`,
      };
    }

    const spotRate = series[series.length - 1].rate;
    const paymentsPerYear = Math.round(365 / frequencyDays);

    // What did this company's provider really charge on past payments? When we
    // can measure it, that beats any generic "typical fee" assumption.
    const history = await loadPaymentHistory(supabase, employee, series);
    const feeAnalysis = analyzePastFees(history, series, paymentsPerYear);

    const measuredSpotPct =
      feeAnalysis && feeAnalysis.averageMarginPct > 0 ? feeAnalysis.averageMarginPct : undefined;
    const feeSourceIsMeasured = measuredSpotPct !== undefined && options.fees?.spotPct === undefined;

    const compare = compareStrategies({
      amountTargetCurrency: employee.amount,
      targetCurrency: employee.currency,
      baseCurrency,
      spotRate,
      horizonDays,
      frequencyDays,
      demeanedDailyReturns: riskStats.demeanedDailyReturns,
      shariaMode,
      // Precedence: what the user typed > what we measured > generic default.
      fees: { ...options.fees, spotPct: options.fees?.spotPct ?? measuredSpotPct },
      dcaInstallments: options.dcaInstallments,
    });

    const plainSummary = generatePlainSummary({
      employeeName: employee.name,
      amountTargetCurrency: employee.amount,
      targetCurrency: employee.currency,
      baseCurrency,
      dueDateLabel,
      compare,
    });

    return {
      dataAvailable: true,
      unsupportedCurrency: false,
      spotRate,
      asOfDate: riskStats.asOfDate,
      compare,
      horizonDays,
      vol30d: riskStats.vol30d,
      vol90d: riskStats.vol90d,
      vol365d: riskStats.vol365d,
      typicalWindowMove: riskStats.typicalWindowMove,
      recentHistory: series.slice(-90),
      feeAnalysis,
      feeSourceIsMeasured,
      paymentsPerYear,
      plainSummary,
    };
  } catch (err) {
    if (err instanceof UnsupportedCurrencyError) {
      return {
        dataAvailable: false,
        unsupportedCurrency: true,
        spotRate: null,
        asOfDate: null,
        compare: null,
        horizonDays,
        vol30d: null,
        vol90d: null,
        vol365d: null,
        typicalWindowMove: null,
        recentHistory: [],
        feeAnalysis: null,
        feeSourceIsMeasured: false,
        paymentsPerYear: Math.round(365 / frequencyDays),
        plainSummary: `No exchange-rate data available for ${employee.currency} from our source (Frankfurter/ECB). We can't estimate this risk reliably — check the rate directly with your provider.`,
      };
    }
    throw err;
  }
}
