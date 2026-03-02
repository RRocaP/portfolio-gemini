"use client";

interface SuggestedQuestionsProps {
  onSelect: (question: string) => void;
}

const suggestions = [
  "What are the key findings from the safety research?",
  "Summarize the industry trends for 2025",
  "What were the Q4 planning priorities?",
  "How do the sources relate to each other?",
];

export function SuggestedQuestions({ onSelect }: SuggestedQuestionsProps) {
  return (
    <div className="px-4 py-3">
      <p className="text-xs text-muted-foreground mb-2">Suggested questions</p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((q) => (
          <button
            key={q}
            onClick={() => onSelect(q)}
            className="rounded-full border px-3 py-1.5 text-xs hover:bg-accent transition-colors text-left"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
