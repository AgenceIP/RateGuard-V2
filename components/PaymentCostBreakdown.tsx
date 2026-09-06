import { CircleCheck, Sigma } from "lucide-react";
import { money } from "@/lib/format";

/**
 * Answers, in one block, "what does it cost me every time I pay this person?".
 *
 * The single stacked bar is a part-to-whole of one total (what the employee
 * receives vs what the provider keeps), so it earns a bar rather than a chart:
 * two parts, both directly labelled, true zero baseline, 2px surface gap.
 */
export function PaymentCostBreakdown({
  amountTargetCurrency,
  targetCurrency,
  baseCurrency,
  midMarketCostBase,
  feesBase,
  totalCostBase,
  paymentsPerYear,
  feeIsMeasured,
  spotRate,
}: {
  amountTargetCurrency: number;
  targetCurrency: string;
  baseCurrency: string;
  midMarketCostBase: number;
  feesBase: number;
  totalCostBase: number;
  paymentsPerYear: number;
  feeIsMeasured: boolean;
  spotRate: number;
}) {
  const feeShare = totalCostBase > 0 ? feesBase / totalCostBase : 0;
  const annualFees = feesBase * paymentsPerYear;

  return (
    <div className="space-y-4">
      <div className="space-y-2.5">
        <Row
          label="Your employee receives"
          detail={money(amountTargetCurrency, targetCurrency)}
          value={money(midMarketCostBase, baseCurrency)}
          hint={`at the ECB market rate (1 ${baseCurrency} = ${spotRate.toLocaleString("en-CA", { maximumFractionDigits: 4 })} ${targetCurrency})`}
        />
        <Row
          label="Your provider's margin and fees"
          value={`+ ${money(feesBase, baseCurrency)}`}
          hint={
            feeIsMeasured
              ? "measured from your past payments"
              : "typical estimate — adjust it below, or record past payments to measure it"
          }
          emphasis="warning"
        />
        <div className="flex items-baseline justify-between gap-3 border-t border-border pt-2.5">
          <div>
            <p className="text-sm font-medium">Debited from your account</p>
            <p className="text-[11px] text-muted-foreground">the real cost of this payment</p>
          </div>
          <p className="text-2xl font-semibold tabular-nums">{money(totalCostBase, baseCurrency)}</p>
        </div>
      </div>

      {/* Part-to-whole: what reaches the employee vs what the provider keeps. */}
      <div>
        <div className="flex h-3 w-full overflow-hidden rounded-full" style={{ background: "var(--muted)" }}>
          <div
            style={{
              width: `${Math.max((1 - feeShare) * 100, 1)}%`,
              background: "var(--viz-series-1)",
              marginRight: 2,
              borderRadius: "999px 4px 4px 999px",
            }}
          />
          <div
            style={{
              width: `${Math.max(feeShare * 100, 1)}%`,
              background: "var(--warning)",
              borderRadius: "4px 999px 999px 4px",
            }}
          />
        </div>
        <div className="mt-1.5 flex flex-wrap justify-between gap-2 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block size-2 rounded-full" style={{ background: "var(--viz-series-1)" }} />
            Reaches your employee · {((1 - feeShare) * 100).toFixed(1)}%
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block size-2 rounded-full" style={{ background: "var(--warning)" }} />
            Stays with the provider · {(feeShare * 100).toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="flex items-start gap-2.5 rounded-xl bg-muted/50 p-3">
        <Sigma className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        <div className="text-sm">
          <p>
            Over a full year ({paymentsPerYear} payment{paymentsPerYear > 1 ? "s" : ""}), these fees add up to{" "}
            <strong className="font-semibold" style={{ color: "var(--warning)" }}>
              {money(annualFees, baseCurrency)}
            </strong>{" "}
            for this one person.
          </p>
          {feeIsMeasured && (
            <p className="mt-1 inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <CircleCheck className="size-3" style={{ color: "var(--good)" }} />
              Based on what you actually paid, not a market average.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  detail,
  value,
  hint,
  emphasis,
}: {
  label: string;
  detail?: string;
  value: string;
  hint?: string;
  emphasis?: "warning";
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm">
          {label}
          {detail && <span className="text-muted-foreground"> · {detail}</span>}
        </p>
        {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
      </div>
      <p
        className="shrink-0 text-sm font-medium tabular-nums"
        style={emphasis === "warning" ? { color: "var(--warning)" } : undefined}
      >
        {value}
      </p>
    </div>
  );
}
