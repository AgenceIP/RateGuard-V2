"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Info, ShieldCheck, TrendingUp } from "lucide-react";
import { StrategyComparisonCard } from "@/components/StrategyComparisonCard";
import { JargonTerm } from "@/components/JargonTerm";
import { PaymentCostBreakdown } from "@/components/PaymentCostBreakdown";
import { FeeAnalysisCard } from "@/components/FeeAnalysisCard";
import { CostComparisonChart } from "@/components/viz/CostComparisonChart";
import { RateSparkline } from "@/components/viz/RateSparkline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SHARIA_DISCLAIMER } from "@/lib/copy/sharia";
import { DEFAULT_FEES } from "@/lib/strategies/compare";
import { money } from "@/lib/format";
import type { PaymentInsight } from "@/lib/payment-insight";
import type { Employee } from "@/lib/types";

function toPct(value: number): number {
  return Math.round(value * 1000) / 10;
}

export function CompareClient({
  employee,
  baseCurrency,
  shariaMode,
  isDemo,
  initialInsight,
}: {
  employee: Employee;
  baseCurrency: string;
  shariaMode: boolean;
  isDemo: boolean;
  initialInsight: PaymentInsight;
}) {
  const [insight, setInsight] = useState(initialInsight);
  const [pending, startTransition] = useTransition();
  const [showFees, setShowFees] = useState(false);
  const [feesPct, setFeesPct] = useState({
    spotPct: toPct(DEFAULT_FEES.spot.value),
    forwardFeePct: toPct(DEFAULT_FEES.forward.value),
    forwardRateDifferentialPct: toPct(DEFAULT_FEES.forwardRateDifferential.value),
    multiCurrencyFeePct: toPct(DEFAULT_FEES.multiCurrency.value),
  });

  function recompute(next: typeof feesPct) {
    setFeesPct(next);
    startTransition(async () => {
      const res = await fetch("/api/strategies/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: employee.id,
          fees: {
            spotPct: next.spotPct / 100,
            forwardFeePct: next.forwardFeePct / 100,
            forwardRateDifferentialPct: next.forwardRateDifferentialPct / 100,
            multiCurrencyFeePct: next.multiCurrencyFeePct / 100,
          },
        }),
      });
      if (res.ok) setInsight(await res.json());
    });
  }

  if (!insight.dataAvailable || !insight.compare) {
    return (
      <Card>
        <CardContent className="flex gap-3 py-6">
          <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <div className="space-y-2 text-sm">
            <p>{insight.plainSummary}</p>
            <p className="text-muted-foreground">
              We&apos;d rather say so plainly than invent a number: without reliable rate data for {employee.currency}, any risk
              estimate would be fiction. Ask your payment provider for a quote on this corridor.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const compare = insight.compare;
  const cheapest = compare.strategies.reduce((min, s) => (s.expectedCostBase < min.expectedCostBase ? s : min));
  const risk = compare.waitAndPayLater.riskOfWaitingBase;
  const spotStrategy = compare.strategies.find((s) => s.key === "spot") ?? compare.strategies[0];

  return (
    <div className="space-y-6">
      {/* Headline: the one-sentence answer, before any chart. */}
      <Card className="border-l-2" style={{ borderLeftColor: "var(--primary)" }}>
        <CardContent className="space-y-3">
          <p className="text-base leading-relaxed">{insight.plainSummary}</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-3 text-xs text-muted-foreground">
            <span>
              Pay today: <strong className="font-medium text-foreground">{money(compare.payNowCostBase, baseCurrency)}</strong>
            </span>
            {risk !== null && (
              <span>
                Risk if you wait: <strong className="font-medium" style={{ color: "var(--warning)" }}>up to {money(risk, baseCurrency)}</strong>
              </span>
            )}
            <span>
              Cheapest option: <strong className="font-medium text-foreground">{cheapest.label}</strong>
            </span>
            <span>Rate data as of {insight.asOfDate ? new Date(insight.asOfDate).toLocaleDateString("en-CA") : "—"}</span>
          </div>
        </CardContent>
      </Card>

      {/* What this one payment actually costs, before any strategy talk. */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">What this payment costs you</CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentCostBreakdown
            amountTargetCurrency={employee.amount}
            targetCurrency={employee.currency}
            baseCurrency={baseCurrency}
            midMarketCostBase={spotStrategy.expectedCostBase - spotStrategy.feesBase}
            feesBase={spotStrategy.feesBase}
            totalCostBase={spotStrategy.expectedCostBase}
            paymentsPerYear={insight.paymentsPerYear}
            feeIsMeasured={insight.feeSourceIsMeasured}
            spotRate={insight.spotRate ?? 0}
          />
        </CardContent>
      </Card>

      {insight.feeAnalysis && (
        <FeeAnalysisCard
          analysis={insight.feeAnalysis}
          baseCurrency={baseCurrency}
          targetCurrency={employee.currency}
          isDemo={isDemo}
        />
      )}

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">What each option costs</CardTitle>
          </CardHeader>
          <CardContent>
            <CostComparisonChart strategies={compare.strategies} currency={baseCurrency} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5 text-base">
              <TrendingUp className="size-4 text-muted-foreground" />
              What the rate has done recently
            </CardTitle>
          </CardHeader>
          <CardContent>
            {insight.recentHistory.length > 1 ? (
              <RateSparkline points={insight.recentHistory} baseCurrency={baseCurrency} targetCurrency={employee.currency} />
            ) : (
              <p className="text-sm text-muted-foreground">Not enough history to draw a line.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Your options, in plain language</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {compare.strategies.map((s) => (
            <StrategyComparisonCard
              key={s.key}
              strategy={s}
              currency={baseCurrency}
              showSharia={shariaMode}
              isCheapest={s.key === cheapest.key}
            />
          ))}
        </div>
        {shariaMode && (
          <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl bg-muted/60 p-3">
            <p className="flex items-start gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="mt-0.5 size-3.5 shrink-0" />
              {SHARIA_DISCLAIMER}
            </p>
            <Link
              href="/sharia"
              className="text-xs font-medium text-primary underline underline-offset-2"
            >
              See every alternative without a forward →
            </Link>
          </div>
        )}
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">How much {employee.currency} has moved historically</CardTitle>
          <JargonTerm glossaryKey="annualizedVolatility" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: "Last 30 days", stats: insight.vol30d },
              { label: "Last 90 days", stats: insight.vol90d },
              { label: "Last 365 days", stats: insight.vol365d },
            ].map(({ label, stats }) => (
              <div key={label} className="rounded-xl bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="mt-0.5 text-lg font-semibold tabular-nums">
                  {stats ? `${stats.annualizedPct.toFixed(1)}%` : "—"}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {stats ? `across ${stats.sampleDays} observed days` : "not enough data"}
                </p>
              </div>
            ))}
          </div>

          {insight.typicalWindowMove && (
            <p className="rounded-xl bg-accent/50 px-4 py-3 text-sm">
              Over {insight.typicalWindowMove.windowDays}-day stretches — the gap between two of your payments — the rate has
              historically moved{" "}
              <strong className="font-medium">
                between {insight.typicalWindowMove.p10.toFixed(1)}% and +{insight.typicalWindowMove.p90.toFixed(1)}%
              </strong>{" "}
              in 8 cases out of 10 ({insight.typicalWindowMove.sampleWindows} observed periods). It can go either way: this is
              a range, not a direction.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base">Fees used in the calculation</CardTitle>
            <p className="text-xs text-muted-foreground">
              These are typical values, not real quotes. Replace them with the fees your provider actually charges for an
              exact result.
            </p>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={() => setShowFees((v) => !v)}>
            {showFees ? "Hide" : "Adjust"}
          </Button>
        </CardHeader>
        {showFees && (
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <FeeInput label="Transfer fee at today's rate (%)" hint={DEFAULT_FEES.spot.label} value={feesPct.spotPct} onChange={(v) => recompute({ ...feesPct, spotPct: v })} />
              <FeeInput label={`${shariaMode ? "Wa'd" : "Locked rate"} fee (%)`} hint={DEFAULT_FEES.forward.label} value={feesPct.forwardFeePct} onChange={(v) => recompute({ ...feesPct, forwardFeePct: v })} />
              <FeeInput label="Interest-rate differential (%)" hint={DEFAULT_FEES.forwardRateDifferential.label} value={feesPct.forwardRateDifferentialPct} onChange={(v) => recompute({ ...feesPct, forwardRateDifferentialPct: v })} />
              <FeeInput label="Multi-currency account fee (%)" hint={DEFAULT_FEES.multiCurrency.label} value={feesPct.multiCurrencyFeePct} onChange={(v) => recompute({ ...feesPct, multiCurrencyFeePct: v })} />
            </div>
            {pending && <p className="text-xs text-muted-foreground">Recalculating…</p>}
          </CardContent>
        )}
      </Card>
    </div>
  );
}

function FeeInput({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <Input type="number" step="0.1" value={value} onChange={(e) => onChange(Number(e.target.value))} />
      <p className="text-[11px] leading-snug text-muted-foreground">{hint}</p>
    </div>
  );
}
