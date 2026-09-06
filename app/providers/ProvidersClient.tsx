"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  CATEGORY_LABELS,
  PROVIDERS,
  PROVIDERS_REVIEWED_AT,
  SHARIA_STATUS_LABELS,
  type Provider,
} from "@/lib/data/providers";
import { SHARIA_DISCLAIMER } from "@/lib/copy/sharia";
import { dateLabel } from "@/lib/format";

const STATUS_STYLE: Record<Provider["shariaStatus"], { bg: string; color: string }> = {
  generally_compatible: { bg: "color-mix(in oklch, var(--good) 12%, transparent)", color: "var(--good)" },
  depends_on_product: { bg: "color-mix(in oklch, var(--warning) 15%, transparent)", color: "var(--warning)" },
  generally_not_compatible: { bg: "color-mix(in oklch, var(--destructive) 12%, transparent)", color: "var(--destructive)" },
};

export function ProvidersClient({ shariaMode }: { shariaMode: boolean }) {
  const [shariaOnly, setShariaOnly] = useState(shariaMode);

  const shown = shariaOnly
    ? PROVIDERS.filter((p) => p.shariaStatus !== "generally_not_compatible")
    : PROVIDERS;

  return (
    <div className="space-y-5">
      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Switch checked={shariaOnly} onCheckedChange={setShariaOnly} id="sharia-only" />
            <Label htmlFor="sharia-only" className="text-sm font-normal">
              Hide options generally not compatible with Sharia
            </Label>
          </div>
          <p className="text-xs text-muted-foreground">
            Reviewed {dateLabel(PROVIDERS_REVIEWED_AT)} · {shown.length} option{shown.length > 1 ? "s" : ""} shown
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {shown.map((provider) => (
          <ProviderCard key={provider.id} provider={provider} showSharia={shariaOnly || shariaMode} />
        ))}
      </div>

      <Card>
        <CardContent className="space-y-2 text-xs text-muted-foreground">
          <p>
            <strong className="text-foreground">None of these prices are fetched live.</strong> None of these providers
            publishes a free pricing API, so the ranges above are published orders of magnitude, reviewed{" "}
            {dateLabel(PROVIDERS_REVIEWED_AT)}. The only reliable figure is your own quote — and the surest way to know
            it is to record your past payments and measure what your provider actually charged.
          </p>
          <p>
            This page is not a ranking, a recommendation, or a commercial partnership. {SHARIA_DISCLAIMER}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function ProviderCard({ provider, showSharia }: { provider: Provider; showSharia: boolean }) {
  const style = STATUS_STYLE[provider.shariaStatus];

  return (
    <Card className="h-full">
      <CardContent className="space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-medium leading-tight">{provider.name}</h3>
            <p className="mt-0.5 text-[11px] uppercase tracking-wide text-muted-foreground">
              {CATEGORY_LABELS[provider.category]}
            </p>
          </div>
          {showSharia && (
            <span
              className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium"
              style={{ background: style.bg, color: style.color }}
            >
              {SHARIA_STATUS_LABELS[provider.shariaStatus]}
            </span>
          )}
        </div>

        <p className="text-sm leading-relaxed text-muted-foreground">{provider.summary}</p>

        <div className="space-y-1.5">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Tools offered</p>
          <div className="flex flex-wrap gap-1.5">
            {provider.tools.map((tool) => (
              <span key={tool} className="rounded-full bg-secondary px-2 py-0.5 text-[11px]">
                {tool}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-muted/50 p-3">
          <p className="text-[11px] text-muted-foreground">Typical FX margin</p>
          <p className="mt-0.5 text-lg font-semibold tabular-nums">
            {provider.typicalMarginRange
              ? `${(provider.typicalMarginRange[0] * 100).toFixed(1)}% to ${(provider.typicalMarginRange[1] * 100).toFixed(1)}%`
              : "On request"}
          </p>
          <p className="mt-1 text-[11px] leading-snug text-muted-foreground">{provider.marginNote}</p>
        </div>

        {showSharia && (
          <div className="rounded-xl bg-accent/50 p-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Sharia view</p>
            <p className="mt-1 text-xs leading-relaxed">{provider.shariaNote}</p>
          </div>
        )}

        {provider.url && (
          <a
            href={provider.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary underline underline-offset-2"
          >
            Check current pricing
            <ExternalLink className="size-3" />
          </a>
        )}
      </CardContent>
    </Card>
  );
}
