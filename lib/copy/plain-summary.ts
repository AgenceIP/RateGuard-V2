import type { CompareOutput } from "@/lib/strategies/compare";

function money(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function generatePlainSummary(params: {
  employeeName: string;
  amountTargetCurrency: number;
  targetCurrency: string;
  baseCurrency: string;
  dueDateLabel: string;
  compare: CompareOutput;
}): string {
  const { employeeName, amountTargetCurrency, targetCurrency, baseCurrency, dueDateLabel, compare } = params;

  const amountLabel = money(amountTargetCurrency, targetCurrency);
  const forward = compare.strategies.find((s) => s.key === "forward");

  if (!compare.waitAndPayLater.dataAvailable || compare.waitAndPayLater.riskOfWaitingBase === null) {
    return `For ${employeeName}'s payment of ${amountLabel} due ${dueDateLabel}: there isn't enough history on ${targetCurrency} to estimate the risk reliably. Use the fees and today's rate to compare your options.`;
  }

  const risk = compare.waitAndPayLater.riskOfWaitingBase;
  const riskLabel = money(Math.abs(risk), baseCurrency);

  if (!forward) {
    return `For ${employeeName}'s payment of ${amountLabel} due ${dueDateLabel}: waiting could cost you around ${riskLabel} more in an unfavourable scenario.`;
  }

  const forwardExtraCost = forward.expectedCostBase - compare.payNowCostBase;
  const forwardExtraLabel = money(Math.abs(forwardExtraCost), baseCurrency);

  if (risk <= 0) {
    return `For ${employeeName}'s payment of ${amountLabel} due ${dueDateLabel}: the history on ${targetCurrency} doesn't show a meaningful extra cost to waiting, beyond the usual fees. Paying now or later makes little expected difference.`;
  }

  if (forwardExtraCost <= 0) {
    return `For ${employeeName}'s payment of ${amountLabel} due ${dueDateLabel}: waiting could cost you around ${riskLabel} more. Locking the rate today costs about the same and removes that risk entirely.`;
  }

  return `For ${employeeName}'s payment of ${amountLabel} due ${dueDateLabel}: waiting could cost you around ${riskLabel} more. If that worries you, locking the rate today costs about ${forwardExtraLabel} more but removes the risk entirely.`;
}
