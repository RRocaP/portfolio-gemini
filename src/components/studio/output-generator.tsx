"use client";

import type { StudioOutputType } from "@/lib/types";

interface OutputGeneratorProps {
  type: StudioOutputType;
  label: string;
  icon: string;
  description: string;
  onGenerate: () => void;
}

export function OutputGenerator({
  label,
  icon,
  description,
  onGenerate,
}: OutputGeneratorProps) {
  return (
    <button
      onClick={onGenerate}
      className="flex flex-col items-center gap-1 rounded-lg border p-3 text-center hover:bg-accent transition-colors"
    >
      <span className="text-xl">{icon}</span>
      <span className="text-xs font-medium">{label}</span>
      <span className="text-[10px] text-muted-foreground line-clamp-1">
        {description}
      </span>
    </button>
  );
}
