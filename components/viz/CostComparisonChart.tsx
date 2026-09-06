"use client";

import { useState } from "react";
import type { StrategyResult } from "@/lib/strategies/compare";

/**
 * Compares the four strategies by *extra cost versus the cheapest option*,
 * not by absolute total.
 *
 * Why the delta and not the total: the four totals sit within ~2 % of each
 * other, so zero-based bars of the absolute amount would all look identical,
 * and a truncated axis would exaggerate the difference dishonestly. Charting
 * the difference keeps a true zero baseline while making the real gap
 * readable. The absolute total stays directly labelled on every row.
 */
export function CostComparisonChart({
  strategies,
  currency,
}: {
  strategies: StrategyResult[];
  currency: string;
}) {
  const [hovered, setHovered] = useState<string | null>(null);

  const money = (v: number) =>
    new Intl.NumberFormat("en-CA", { style: "currency", currency, maximumFractionDigits: 0 }).format(v);

  const cheapest = Math.min(...strategies.map((s) => s.expectedCostBase));
  const deltas = strategies.map((s) => ({
    ...s,
    delta: s.expectedCostBase - cheapest,
    deltaLow: s.costRangeLowBase - cheapest,
    deltaHigh: s.costRangeHighBase - cheapest,
  }));
  const maxDelta = Math.max(...deltas.map((d) => Math.max(d.delta, d.deltaHigh)), 1);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-medium">Extra cost versus the cheapest option</p>
        <p className="text-xs text-muted-foreground">Bars start at $0 · the real total is on the right</p>
      </div>

      <div className="space-y-2.5">
        {deltas.map((s) => {
          const widthPct = (s.delta / maxDelta) * 100;
          const lowPct = (Math.max(s.deltaLow, 0) / maxDelta) * 100;
          const highPct = (s.deltaHigh / maxDelta) * 100;
          const isCheapest = s.delta < 0.5;
          const isHovered = hovered === s.key;

          return (
            <div
              key={s.key}
              className="grid grid-cols-[minmax(7.5rem,1fr)_2fr_auto] items-center gap-3 rounded-lg px-1.5 py-1.5 transition-colors"
              style={{ background: isHovered ? "var(--muted)" : "transparent" }}
              onMouseEnter={() => setHovered(s.key)}
              onMouseLeave={() => setHovered(null)}
            >
              <span className="truncate text-xs text-muted-foreground" title={s.label}>
                {s.label}
              </span>

              <div className="relative h-6">
                {/* zero baseline */}
                <div className="absolute inset-y-0 left-0 w-px" style={{ background: "var(--viz-axis)" }} />

                {/* uncertainty band (only where the strategy actually carries market risk) */}
                {s.hasMarketRisk && (
                  <div
                    className="absolute top-1/2 h-2.5 -translate-y-1/2 rounded-full"
                    style={{
                      left: `${lowPct}%`,
                      width: `${Math.max(highPct - lowPct, 0.5)}%`,
                      background: "var(--viz-series-1-soft)",
                    }}
                    aria-hidden
                  />
                )}

                {/* expected cost bar — 4px rounded end, anchored to the zero baseline */}
                <div
                  className="absolute top-1/2 h-3 -translate-y-1/2 rounded-r-[4px]"
                  style={{
                    left: 0,
                    width: `${Math.max(widthPct, isCheapest ? 0 : 0.8)}%`,
                    background: isCheapest ? "var(--viz-good)" : "var(--viz-series-1)",
                    boxShadow: "0 0 0 2px var(--card)",
                  }}
                />
              </div>

              <div className="text-right">
                <p className="text-sm font-medium tabular-nums">{money(s.expectedCostBase)}</p>
                <p className="text-[11px] tabular-nums" style={{ color: isCheapest ? "var(--good)" : "var(--muted-foreground)" }}>
                  {isCheapest ? "✓ cheapest" : `+ ${money(s.delta)}`}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-4 border-t border-border pt-2 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-4 rounded-[3px]" style={{ background: "var(--viz-series-1)" }} />
          Expected cost
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-4 rounded-full" style={{ background: "var(--viz-series-1-soft)" }} />
          Possible range (options exposed to the market)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-4 rounded-[3px]" style={{ background: "var(--viz-good)" }} />
          Cheapest
        </span>
      </div>
    </div>
  );
}
