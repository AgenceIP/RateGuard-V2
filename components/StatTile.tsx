import type { ReactNode } from "react";

/**
 * A single headline figure. No plot — per the form heuristic, one number with
 * context reads better as a tile than as a one-bar chart.
 */
export function StatTile({
  label,
  value,
  hint,
  tone = "neutral",
  icon,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "neutral" | "good" | "warning";
  icon?: ReactNode;
}) {
  const valueColor =
    tone === "good" ? "var(--good)" : tone === "warning" ? "var(--warning)" : "var(--foreground)";

  return (
    <div className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <p className="mt-1.5 text-2xl font-semibold leading-tight" style={{ color: valueColor }}>
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
