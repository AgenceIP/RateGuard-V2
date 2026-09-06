import Link from "next/link";
import { Receipt, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dateLabel, money } from "@/lib/format";
import type { FeeAnalysis } from "@/lib/fees/effective";

/**
 * The measured counterpart to the estimated fees: what this company's provider
 * actually took, computed from its own past payments against the ECB rate of
 * each payment date. No assumption anywhere in this card.
 */
export function FeeAnalysisCard({
  analysis,
  baseCurrency,
  targetCurrency,
  isDemo,
}: {
  analysis: FeeAnalysis;
  baseCurrency: string;
  targetCurrency: string;
  isDemo: boolean;
}) {
  const marginPct = analysis.averageMarginPct * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Receipt className="size-4 text-muted-foreground" />
          What your provider actually charged you
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Measured across your last {analysis.sampleSize} payments, comparing what left your account to the official
          ECB rate for that day. It&apos;s the only fee figure on this page that isn&apos;t an estimate.
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-muted/50 p-3">
            <p className="text-[11px] text-muted-foreground">Average margin taken</p>
            <p className="mt-0.5 text-2xl font-semibold tabular-nums" style={{ color: "var(--warning)" }}>
              {marginPct.toFixed(1)}%
            </p>
            <p className="text-[11px] text-muted-foreground">above the market rate</p>
          </div>
          <div className="rounded-xl bg-muted/50 p-3">
            <p className="text-[11px] text-muted-foreground">Overpaid on these payments</p>
            <p className="mt-0.5 text-2xl font-semibold tabular-nums">
              {money(analysis.totalExtraCostBase, baseCurrency)}
            </p>
            <p className="text-[11px] text-muted-foreground">
              on {money(analysis.totalPaidBase, baseCurrency)} sent
            </p>
          </div>
          <div className="rounded-xl bg-muted/50 p-3">
            <p className="text-[11px] text-muted-foreground">At this rate, per year</p>
            <p className="mt-0.5 text-2xl font-semibold tabular-nums" style={{ color: "var(--warning)" }}>
              {analysis.annualExtraCostBase !== null ? money(analysis.annualExtraCostBase, baseCurrency) : "—"}
            </p>
            <p className="text-[11px] text-muted-foreground">for this person alone</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="pb-2 font-medium">Date</th>
                <th className="pb-2 font-medium">Sent</th>
                <th className="pb-2 text-right font-medium">Real cost</th>
                <th className="pb-2 text-right font-medium">At market rate</th>
                <th className="pb-2 text-right font-medium">Gap</th>
              </tr>
            </thead>
            <tbody>
              {analysis.payments.map((payment) => (
                <tr key={payment.paidAt} className="border-b border-border/60 last:border-0">
                  <td className="py-2 whitespace-nowrap">{dateLabel(payment.paidAt)}</td>
                  <td className="py-2 whitespace-nowrap tabular-nums">
                    {money(payment.amountTargetCurrency, targetCurrency)}
                  </td>
                  <td className="py-2 text-right tabular-nums">{money(payment.actualCostBase, baseCurrency)}</td>
                  <td className="py-2 text-right tabular-nums text-muted-foreground">
                    {money(payment.midMarketCostBase, baseCurrency)}
                  </td>
                  <td className="py-2 text-right tabular-nums" style={{ color: "var(--warning)" }}>
                    + {money(payment.extraCostBase, baseCurrency)} ({(payment.marginPct * 100).toFixed(1)}%)
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="flex items-start gap-2 rounded-xl bg-accent/50 p-3 text-xs">
          <TrendingDown className="mt-0.5 size-3.5 shrink-0" />
          <span>
            This measured margin replaces the generic estimate in the comparison above. Compare it to what other
            providers typically charge on the{" "}
            <Link href="/providers" className="font-medium text-primary underline underline-offset-2">
              Where to make your payments
            </Link>{" "}
            page.
          </span>
        </p>

        {isDemo && (
          <p className="text-[11px] text-muted-foreground">
            In demo mode the margins in this history are invented — but they are applied to the real ECB rate for each
            date, and the calculation that measures them back out here is the same one that runs on your real data.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
