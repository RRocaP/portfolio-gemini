import type { StudioOutput } from "@/lib/types";

const statusColors: Record<string, string> = {
  generating: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  preview: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  ready: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  error: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const typeIcons: Record<string, string> = {
  audio_overview: "🎧",
  study_guide: "📝",
  briefing_doc: "📋",
  faq: "❓",
  timeline: "📅",
  flashcards: "🃏",
  quiz: "📝",
  infographic: "📊",
  slide_deck: "📑",
};

interface GeneratedMediaProps {
  outputs: StudioOutput[];
}

export function GeneratedMedia({ outputs }: GeneratedMediaProps) {
  if (outputs.length === 0) return null;

  return (
    <div>
      <h3 className="text-xs font-semibold text-muted-foreground mb-2">
        Generated
      </h3>
      <div className="space-y-1">
        {outputs.map((output) => (
          <div
            key={output.id}
            className="flex items-center gap-2 rounded-md border p-2 hover:bg-accent cursor-pointer transition-colors"
          >
            <span className="text-sm">{typeIcons[output.type] || "📄"}</span>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-medium truncate block">
                {output.title}
              </span>
              {output.duration && (
                <span className="text-[10px] text-muted-foreground">
                  {output.duration}
                </span>
              )}
            </div>
            <span
              className={`inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-medium ${statusColors[output.status] || ""}`}
            >
              {output.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
