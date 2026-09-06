"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { GLOSSARY } from "@/lib/copy/glossary";

/**
 * Wraps a financial term with its plain-language explanation, both inline
 * (always visible, works without hover/touch) and as a tooltip on hover.
 */
export function JargonTerm({ glossaryKey, explanation }: { glossaryKey?: keyof typeof GLOSSARY; explanation?: string }) {
  const entry = glossaryKey ? GLOSSARY[glossaryKey] : undefined;
  const text = explanation ?? entry?.explanation;
  const term = entry?.term;

  if (!text) return null;

  return (
    <Tooltip>
      <TooltipTrigger className="inline-flex items-center gap-1 rounded-none border-none bg-transparent p-0 text-left text-sm text-muted-foreground underline decoration-dotted underline-offset-2 cursor-help">
        {term ? `${term} = ${text}` : `= ${text}`}
      </TooltipTrigger>
      <TooltipContent>{text}</TooltipContent>
    </Tooltip>
  );
}
