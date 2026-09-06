"use client";

import { useState } from "react";

interface Point {
  date: string;
  rate: number;
}

/**
 * Rate history for one currency pair. A line, because the job is
 * change-over-time (a truncated y-range is correct here — the line encodes
 * movement, not magnitude from zero). Single series, so the title names it
 * and no legend box is needed. Explicitly captioned as history, never a
 * forecast: nothing is drawn to the right of the last real observation.
 */
export function RateSparkline({
  points,
  baseCurrency,
  targetCurrency,
}: {
  points: Point[];
  baseCurrency: string;
  targetCurrency: string;
}) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  if (points.length < 2) return null;

  const W = 560;
  const H = 120;
  const padY = 14;
  const padRight = 8;

  const rates = points.map((p) => p.rate);
  const min = Math.min(...rates);
  const max = Math.max(...rates);
  const span = max - min || max * 0.001;

  const x = (i: number) => (i / (points.length - 1)) * (W - padRight);
  const y = (r: number) => padY + (1 - (r - min) / span) * (H - padY * 2);

  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.rate).toFixed(1)}`).join(" ");
  const area = `${path} L${x(points.length - 1).toFixed(1)},${H} L0,${H} Z`;

  const last = points[points.length - 1];
  const active = hoverIdx !== null ? points[hoverIdx] : null;

  // One decimal count for every readout on the chart, chosen from the
  // magnitude of the rate — so min, max and current line up visually.
  const decimals = max >= 100 ? 1 : max >= 1 ? 3 : 5;
  const fmtRate = (r: number) =>
    r.toLocaleString("en-CA", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  const fmtDate = (d: string) => new Date(d + "T00:00:00Z").toLocaleDateString("en-CA", { day: "numeric", month: "short" });

  function handleMove(e: React.MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    const idx = Math.round(ratio * (points.length - 1));
    setHoverIdx(Math.max(0, Math.min(points.length - 1, idx)));
  }

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-medium">
          1 {baseCurrency} in {targetCurrency} — last {points.length} business days
        </p>
        <p className="text-xs tabular-nums text-muted-foreground">
          {active ? `${fmtDate(active.date)} · ${fmtRate(active.rate)}` : `Today · ${fmtRate(last.rate)}`}
        </p>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-28 w-full overflow-visible"
        role="img"
        aria-label={`Rate history for ${baseCurrency} to ${targetCurrency} over the last ${points.length} business days. Lowest ${fmtRate(min)}, highest ${fmtRate(max)}, latest ${fmtRate(last.rate)}.`}
        onMouseMove={handleMove}
        onMouseLeave={() => setHoverIdx(null)}
      >
        <defs>
          <linearGradient id="rate-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--viz-series-1)" stopOpacity="0.18" />
            <stop offset="100%" stopColor="var(--viz-series-1)" stopOpacity="0" />
          </linearGradient>
        </defs>

        <path d={area} fill="url(#rate-fill)" />
        <path d={path} fill="none" stroke="var(--viz-series-1)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

        {hoverIdx !== null && (
          <g>
            <line x1={x(hoverIdx)} y1={padY - 6} x2={x(hoverIdx)} y2={H - padY + 6} stroke="var(--viz-axis)" strokeWidth="1" />
            <circle cx={x(hoverIdx)} cy={y(points[hoverIdx].rate)} r="4.5" fill="var(--viz-series-1)" stroke="var(--card)" strokeWidth="2" />
          </g>
        )}

        <circle cx={x(points.length - 1)} cy={y(last.rate)} r="4" fill="var(--viz-series-1)" stroke="var(--card)" strokeWidth="2" />
      </svg>

      <div className="flex justify-between text-[11px] tabular-nums text-muted-foreground">
        <span>{fmtDate(points[0].date)}</span>
        <span>Low {fmtRate(min)} · High {fmtRate(max)}</span>
        <span>{fmtDate(last.date)}</span>
      </div>
      <p className="text-[11px] text-muted-foreground">
        This chart shows what happened, not what will happen — nobody can predict the direction of an exchange rate.
      </p>
    </div>
  );
}
