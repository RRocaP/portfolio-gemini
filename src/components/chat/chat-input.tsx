"use client";

import { useState, type KeyboardEvent } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ChatInputProps {
  onSend: (text: string) => void;
  sourceCount: number;
}

export function ChatInput({ onSend, sourceCount }: ChatInputProps) {
  const [value, setValue] = useState("");

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-3">
      <div className="flex items-end gap-2 rounded-lg border bg-background p-2">
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Ask ${sourceCount} sources...`}
          className="min-h-[40px] max-h-[120px] resize-none border-0 p-1 text-sm focus-visible:ring-0 shadow-none"
          rows={1}
        />
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs whitespace-nowrap">
            {sourceCount} sources
          </Badge>
          <Button size="sm" onClick={handleSend} disabled={!value.trim()}>
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
