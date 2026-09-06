import { bootstrapDcaFactor, bootstrapHorizonFactor } from "@/lib/fx/stats";
import type { ShariaCompliance } from "@/lib/types";

export type StrategyKey = "spot" | "forward" | "dca" | "multi_currency";

export interface FeeAssumption {
  value: number; // decimal, e.g. 0.025 = 2.5%
  low: number;
  high: number;
  label: string;
}

export const DEFAULT_FEES: Record<
  "spot" | "forward" | "forwardRateDifferential" | "multiCurrency",
  FeeAssumption
> = {
  spot: {
    value: 0.02,
    low: 0.015,
    high: 0.025,
    label: "Typical fee on an international spot transfer (1.5% to 2.5%) — check the rate your provider quotes.",
  },
  forward: {
    value: 0.025,
    low: 0.02,
    high: 0.03,
    label:
      "Typical fee to lock a rate ahead of time (2% to 3%), on top of the rate differential — usually a little more than spot, which is the price of certainty.",
  },
  forwardRateDifferential: {
    value: 0,
    low: -0.01,
    high: 0.01,
    label:
      "The interest-rate differential between the two currencies, which drives the price of a locked-in rate. No reliable free source publishes this in real time — get a real quote from your provider and adjust it here.",
  },
  multiCurrency: {
    value: 0.01,
    low: 0.004,
    high: 0.02,
    label: "Typical multi-currency account fee (e.g. Wise Business, Airwallex) on this corridor (0.4% to 2%).",
  },
};

export interface CompareInput {
  amountTargetCurrency: number;
  targetCurrency: string;
  baseCurrency: string;
  spotRate: number; // 1 base -> spotRate target
  horizonDays: number; // days until the payment is due
  frequencyDays: number; // pay cycle, used to size DCA installments
  demeanedDailyReturns: number[];
  shariaMode: boolean;
  fees?: Partial<{
    spotPct: number;
    forwardFeePct: number;
    forwardRateDifferentialPct: number;
    multiCurrencyFeePct: number;
  }>;
  dcaInstallments?: number;
}

export interface StrategyResult {
  key: StrategyKey;
  label: string;
  jargonTerm: string;
  plainExplanation: string;
  expectedCostBase: number;
  costRangeLowBase: number;
  costRangeHighBase: number;
  feesBase: number;
  hasMarketRisk: boolean;
  shariaBadge: ShariaCompliance;
  shariaNote: string;
  dataAvailable: boolean;
}

export interface CompareOutput {
  strategies: StrategyResult[];
  payNowCostBase: number;
  waitAndPayLater: {
    dataAvailable: boolean;
    expectedCostBase: number | null;
    worstCaseCostBase: number | null; // p90 factor applied, i.e. the adverse case for the payer
    riskOfWaitingBase: number | null; // worstCase - payNow
  };
}

function baseCostFor(amountTarget: number, spotRate: number, factor: number, feePct: number): number {
  return (amountTarget / spotRate) * factor * (1 + feePct);
}

export function compareStrategies(input: CompareInput): CompareOutput {
  const {
    amountTargetCurrency,
    spotRate,
    horizonDays,
    frequencyDays,
    demeanedDailyReturns,
    shariaMode,
  } = input;

  const spotFeePct = input.fees?.spotPct ?? DEFAULT_FEES.spot.value;
  const forwardFeePct = input.fees?.forwardFeePct ?? DEFAULT_FEES.forward.value;
  const forwardDiffPct = input.fees?.forwardRateDifferentialPct ?? DEFAULT_FEES.forwardRateDifferential.value;
  const multiCurrencyFeePct = input.fees?.multiCurrencyFeePct ?? DEFAULT_FEES.multiCurrency.value;
  const dcaInstallments = input.dcaInstallments ?? Math.max(2, Math.min(6, Math.round(frequencyDays / 7)));

  const payNowCostBase = baseCostFor(amountTargetCurrency, spotRate, 1, spotFeePct);

  // --- Spot: paid today, no market risk. Range reflects only fee uncertainty. ---
  const spot: StrategyResult = {
    key: "spot",
    label: "Pay now (today's rate)",
    jargonTerm: "Spot rate",
    plainExplanation: "= today's exchange rate, the one you'd get if you paid right now.",
    expectedCostBase: payNowCostBase,
    costRangeLowBase: baseCostFor(amountTargetCurrency, spotRate, 1, DEFAULT_FEES.spot.low),
    costRangeHighBase: baseCostFor(amountTargetCurrency, spotRate, 1, DEFAULT_FEES.spot.high),
    feesBase: (amountTargetCurrency / spotRate) * spotFeePct,
    hasMarketRisk: false,
    shariaBadge: "compliant",
    shariaNote: "An immediate currency-for-currency exchange — in line with the hand-to-hand principle.",
    dataAvailable: true,
  };

  // --- Forward / Wa'd: rate locked today, cost known in advance, no market risk. ---
  const forwardFactor = 1 + forwardDiffPct * (horizonDays / 360);
  const forwardCost = baseCostFor(amountTargetCurrency, spotRate, forwardFactor, forwardFeePct);
  const forward: StrategyResult = shariaMode
    ? {
        key: "forward",
        label: "Wa'd (one-sided promise)",
        jargonTerm: "Wa'd",
        plainExplanation:
          "= a promise to buy or sell at a price set today, with no interest component, used by Islamic banks to hedge currency risk.",
        expectedCostBase: forwardCost,
        costRangeLowBase: baseCostFor(amountTargetCurrency, spotRate, forwardFactor, DEFAULT_FEES.forward.low),
        costRangeHighBase: baseCostFor(amountTargetCurrency, spotRate, forwardFactor, DEFAULT_FEES.forward.high),
        feesBase: (amountTargetCurrency / spotRate) * forwardFeePct,
        hasMarketRisk: false,
        shariaBadge: "compliant",
        shariaNote: "Wa'd structure: a one-sided promise with no interest, accepted by most Islamic finance standards.",
        dataAvailable: true,
      }
    : {
        key: "forward",
        label: "Rate locked ahead (forward)",
        jargonTerm: "Forward",
        plainExplanation:
          "= you reserve an exchange rate today for use later: you may pay a little more now, but you know exactly what it will cost, with no surprises.",
        expectedCostBase: forwardCost,
        costRangeLowBase: baseCostFor(amountTargetCurrency, spotRate, forwardFactor, DEFAULT_FEES.forward.low),
        costRangeHighBase: baseCostFor(amountTargetCurrency, spotRate, forwardFactor, DEFAULT_FEES.forward.high),
        feesBase: (amountTargetCurrency / spotRate) * forwardFeePct,
        hasMarketRisk: false,
        shariaBadge: "generally_not_compliant",
        shariaNote: "A conventional forward is priced on an interest-rate differential, which is generally problematic (riba) in Islamic finance — see the Wa'd alternative.",
        dataAvailable: true,
      };

  // --- DCA: bootstrap simulation of spread-out payments vs a single lump sum. ---
  const dcaResult = bootstrapDcaFactor(demeanedDailyReturns, horizonDays, dcaInstallments);
  const dca: StrategyResult = dcaResult
    ? {
        key: "dca",
        label: `Spread over ${dcaInstallments} payments`,
        jargonTerm: "Spread-out payments (DCA)",
        plainExplanation:
          "= several smaller transfers instead of one big one, so the highs and lows even out rather than betting on a single day.",
        expectedCostBase: baseCostFor(amountTargetCurrency, spotRate, dcaResult.p50Factor, spotFeePct),
        costRangeLowBase: baseCostFor(amountTargetCurrency, spotRate, dcaResult.p10Factor, spotFeePct),
        costRangeHighBase: baseCostFor(amountTargetCurrency, spotRate, dcaResult.p90Factor, spotFeePct),
        feesBase: (amountTargetCurrency / spotRate) * spotFeePct,
        hasMarketRisk: true,
        shariaBadge: "compliant",
        shariaNote: "Each instalment is an immediate exchange — the same principle as paying spot.",
        dataAvailable: true,
      }
    : {
        key: "dca",
        label: `Spread over ${dcaInstallments} payments`,
        jargonTerm: "Spread-out payments (DCA)",
        plainExplanation:
          "= several smaller transfers instead of one big one, so the highs and lows even out rather than betting on a single day.",
        expectedCostBase: payNowCostBase,
        costRangeLowBase: payNowCostBase,
        costRangeHighBase: payNowCostBase,
        feesBase: (amountTargetCurrency / spotRate) * spotFeePct,
        hasMarketRisk: true,
        shariaBadge: "compliant",
        shariaNote: "Each instalment is an immediate exchange — the same principle as paying spot.",
        dataAvailable: false,
      };

  // --- Multi-currency account: fee-only, assumes funds already held/received in target currency. ---
  const multiCurrency: StrategyResult = {
    key: "multi_currency",
    label: "Multi-currency account",
    jargonTerm: "Multi-currency account",
    plainExplanation:
      "= an account (e.g. Wise Business, Airwallex) that holds and pays in several currencies without converting every time — most useful for recurring payments in the same currency.",
    expectedCostBase: baseCostFor(amountTargetCurrency, spotRate, 1, multiCurrencyFeePct),
    costRangeLowBase: baseCostFor(amountTargetCurrency, spotRate, 1, DEFAULT_FEES.multiCurrency.low),
    costRangeHighBase: baseCostFor(amountTargetCurrency, spotRate, 1, DEFAULT_FEES.multiCurrency.high),
    feesBase: (amountTargetCurrency / spotRate) * multiCurrencyFeePct,
    hasMarketRisk: false,
    shariaBadge: "depends_on_provider",
    shariaNote: "Check that the account pays no interest on the balance (a Wadiah/Qard structure) to stay compliant.",
    dataAvailable: true,
  };

  // --- "Risk of waiting": bootstrap a lump sum paid at the due date instead of today. ---
  const waitResult = bootstrapHorizonFactor(demeanedDailyReturns, horizonDays);
  const waitAndPayLater = waitResult
    ? {
        dataAvailable: true,
        expectedCostBase: baseCostFor(amountTargetCurrency, spotRate, waitResult.p50Factor, spotFeePct),
        worstCaseCostBase: baseCostFor(amountTargetCurrency, spotRate, waitResult.p90Factor, spotFeePct),
        riskOfWaitingBase:
          baseCostFor(amountTargetCurrency, spotRate, waitResult.p90Factor, spotFeePct) - payNowCostBase,
      }
    : { dataAvailable: false, expectedCostBase: null, worstCaseCostBase: null, riskOfWaitingBase: null };

  return {
    strategies: [spot, forward, dca, multiCurrency],
    payNowCostBase,
    waitAndPayLater,
  };
}
