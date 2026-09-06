import { Check, LockKeyhole, Waves } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ShariaBadge } from "@/components/ShariaBadge";
import { money } from "@/lib/format";
import type { StrategyResult } from "@/lib/strategies/compare";

export function StrategyComparisonCard({
  strategy,
  currency,
  showSharia,
  isCheapest,
}: {
  strategy: StrategyResult;
  currency: string;
  showSharia: boolean;
  isCheapest: boolean;
}) {
  const spread = Math.abs(strategy.costRangeHighBase - strategy.costRangeLowBase);
  const isPoint = spread < 0.5;

  return (
    <Card className={isCheapest ? "ring-2 ring-[color:var(--good)]/40" : undefined}>
      <CardContent className="space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-medium leading-tight">{strategy.label}</h3>
              {isCheapest && (
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
                  style={{ background: "color-mix(in oklch, var(--good) 12%, transparent)", color: "var(--good)" }}
                >
                  <Check className="size-3" />
                  Cheapest
                </span>
              )}
            </div>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              <span className="font-medium text-foreground">{strategy.jargonTerm}</span> {strategy.plainExplanation}
            </p>
          </div>
          {showSharia && <ShariaBadge status={strategy.shariaBadge} note={strategy.shariaNote} />}
        </div>

        <div className="rounded-xl bg-muted/50 p-4">
          <p className="text-[11px] text-muted-foreground">
            {strategy.hasMarketRisk ? "Possible total cost" : "Total cost"}
          </p>
          <p className="mt-0.5 text-xl font-semibold tabular-nums">
            {isPoint
              ? `about ${money(strategy.expectedCostBase, currency)}`
              : `between ${money(strategy.costRangeLowBase, currency)} and ${money(strategy.costRangeHighBase, currency)}`}
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            {strategy.hasMarketRisk ? (
              <>
                <Waves className="size-3" />
                The final amount depends on the rate at each transfer
              </>
            ) : (
              <>
                <LockKeyhole className="size-3" />
                Amount known upfront — no surprise from the rate
              </>
            )}
          </p>
        </div>

        <div className="flex items-baseline justify-between text-xs">
          <span className="text-muted-foreground">Of which estimated fees</span>
          <span className="font-medium tabular-nums">{money(strategy.feesBase, currency)}</span>
        </div>

        {!strategy.dataAvailable && (
          <p className="text-[11px] text-muted-foreground">
            Not enough history to simulate this scenario — the cost shown assumes today&apos;s rate.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
