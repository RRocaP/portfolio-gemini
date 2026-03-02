"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { LiveSourceBadge } from "./live-source-badge";
import type { Source } from "@/lib/types";

const sourceTypeIcons: Record<string, string> = {
  pdf: "📄",
  audio: "🎵",
  image: "🖼️",
  website: "🌐",
  text: "📝",
  note: "📌",
};

interface SourceCardProps {
  source: Source;
  onToggle: () => void;
}

export function SourceCard({ source, onToggle }: SourceCardProps) {
  return (
    <div
      className="flex items-start gap-2 rounded-md p-2 hover:bg-accent cursor-pointer"
      onClick={onToggle}
    >
      <Checkbox
        checked={source.selected}
        onCheckedChange={() => onToggle()}
        onClick={(e) => e.stopPropagation()}
        className="mt-0.5"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">{sourceTypeIcons[source.type] || "📄"}</span>
          <span className="text-sm font-medium truncate">{source.name}</span>
          {source.isLive && (
            <LiveSourceBadge connected={source.liveConnected ?? false} />
          )}
        </div>
        {source.summary && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {source.summary}
          </p>
        )}
        {source.pageCount && (
          <span className="text-xs text-muted-foreground">
            {source.pageCount} pages
          </span>
        )}
      </div>
    </div>
  );
}
