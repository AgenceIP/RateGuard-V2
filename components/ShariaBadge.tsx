"use client";

import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SHARIA_BADGE_LABELS } from "@/lib/copy/sharia";
import type { ShariaCompliance } from "@/lib/types";

const STYLES: Record<ShariaCompliance, string> = {
  compliant: "border-emerald-600/30 bg-emerald-600/10 text-emerald-700 dark:text-emerald-400",
  generally_not_compliant: "border-red-600/30 bg-red-600/10 text-red-700 dark:text-red-400",
  depends_on_provider: "border-amber-600/30 bg-amber-600/10 text-amber-700 dark:text-amber-400",
};

export function ShariaBadge({ status, note }: { status: ShariaCompliance; note: string }) {
  return (
    <Tooltip>
      <TooltipTrigger className="rounded-none border-none bg-transparent p-0">
        <Badge variant="outline" className={STYLES[status]}>
          {SHARIA_BADGE_LABELS[status]}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>{note}</TooltipContent>
    </Tooltip>
  );
}
