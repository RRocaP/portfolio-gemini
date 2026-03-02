"use client";

import { CitationInline } from "./citation-inline";
import { Button } from "@/components/ui/button";
import type { Message } from "@/lib/types";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isAssistant = message.role === "assistant";

  return (
    <div className={`flex ${isAssistant ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-[85%] rounded-lg p-3 ${
          isAssistant
            ? "bg-muted"
            : "bg-primary text-primary-foreground"
        }`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>

        {/* Citations */}
        {isAssistant && message.citations.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {message.citations.map((citation) => (
              <CitationInline key={citation.id} citation={citation} />
            ))}
          </div>
        )}

        {/* Action buttons for assistant messages */}
        {isAssistant && (
          <div className="mt-2 flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-7 text-xs">
              Save as note
            </Button>
            <Button variant="ghost" size="sm" className="h-7 px-2">
              👍
            </Button>
            <Button variant="ghost" size="sm" className="h-7 px-2">
              👎
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
