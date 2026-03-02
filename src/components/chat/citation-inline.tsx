"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Citation } from "@/lib/types";

interface CitationInlineProps {
  citation: Citation;
}

export function CitationInline({ citation }: CitationInlineProps) {
  if (citation.isGeneralKnowledge) {
    return (
      <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
        General Knowledge
      </span>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 transition-colors">
          {citation.sourceName.length > 20
            ? citation.sourceName.slice(0, 20) + "..."
            : citation.sourceName}
          {citation.pageOrSection && `, ${citation.pageOrSection}`}
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <p className="font-medium text-xs">{citation.sourceName}</p>
        <p className="text-xs text-muted-foreground mt-1">
          &quot;{citation.passage}&quot;
        </p>
        {citation.pageOrSection && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {citation.pageOrSection}
          </p>
        )}
      </TooltipContent>
    </Tooltip>
  );
}
