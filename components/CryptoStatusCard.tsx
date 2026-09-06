import { CircleAlert, ExternalLink, Scale, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { CRYPTO_SHARIA_NOTE, SHARIA_DISCLAIMER } from "@/lib/copy/sharia";
import { dateLabel } from "@/lib/format";
import type { CryptoRegulatoryStatus } from "@/lib/types";

const ORIGIN: Record<CryptoRegulatoryStatus["origin"], { label: string; live: boolean }> = {
  live: { label: "Verified live by web search", live: true },
  "cache-fresh": { label: "Verified live recently (cached)", live: true },
  "cache-stale": { label: "Older check — needs refreshing", live: false },
  baseline: { label: "Internal baseline — not verified live", live: false },
};

export function CryptoStatusCard({
  countryName,
  status,
  showSharia,
}: {
  countryName: string;
  status: CryptoRegulatoryStatus;
  showSharia: boolean;
}) {
  const origin = ORIGIN[status.origin];

  return (
    <Card>
      <CardContent className="space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h2 className="text-lg font-semibold">{countryName}</h2>
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium"
            style={{
              background: origin.live ? "color-mix(in oklch, var(--good) 12%, transparent)" : "var(--muted)",
              color: origin.live ? "var(--good)" : "var(--muted-foreground)",
            }}
          >
            {origin.live ? <ShieldCheck className="size-3" /> : <CircleAlert className="size-3" />}
            {origin.label}
          </span>
        </div>

        <div className="rounded-xl bg-muted/50 p-4">
          <p className="font-medium">{status.status}</p>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{status.summary}</p>
        </div>

        {status.risks.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Main risks</p>
            <ul className="space-y-1.5">
              {status.risks.map((risk, i) => (
                <li key={i} className="flex gap-2 text-sm">
                  <CircleAlert className="mt-0.5 size-3.5 shrink-0" style={{ color: "var(--warning)" }} />
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {status.sources.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Sources</p>
            <ul className="space-y-1 text-sm">
              {status.sources.map((source, i) => (
                <li key={i}>
                  {source.url ? (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-primary underline underline-offset-2"
                    >
                      {source.label}
                      <ExternalLink className="size-3" />
                    </a>
                  ) : (
                    <span className="text-muted-foreground">{source.label}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="text-xs text-muted-foreground">Last checked: {dateLabel(status.checked_at)}</p>

        {showSharia && (
          <p className="flex items-start gap-2 rounded-xl bg-accent/50 p-3 text-xs">
            <Scale className="mt-0.5 size-3.5 shrink-0" />
            {CRYPTO_SHARIA_NOTE}
          </p>
        )}

        <div className="space-y-1 border-t border-border pt-4 text-xs font-medium text-muted-foreground">
          <p>
            This is not legal advice — check with a local accountant or lawyer before paying a salary in crypto.
          </p>
          {showSharia && <p>{SHARIA_DISCLAIMER}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
