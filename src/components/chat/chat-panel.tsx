"use client";

import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { MessageList } from "./message-list";
import { ChatInput } from "./chat-input";
import { SuggestedQuestions } from "./suggested-questions";
import type { Message, Citation } from "@/lib/types";

const mockMessages: Message[] = [
  {
    id: "1",
    role: "assistant",
    content:
      "Based on your sources, this notebook covers AI safety research, quarterly planning outcomes, and current industry trends. The research paper provides a comprehensive framework for evaluating safety in large language models, while the industry report contextualizes these findings within broader market dynamics.",
    citations: [
      { id: "c1", sourceId: "1", sourceName: "Research Paper - AI Safety.pdf", passage: "Framework for evaluating safety", pageOrSection: "p.3", isGeneralKnowledge: false },
      { id: "c2", sourceId: "3", sourceName: "Industry Report 2025.pdf", passage: "Market dynamics overview", pageOrSection: "Section 2", isGeneralKnowledge: false },
    ],
    timestamp: new Date(),
  },
];

export function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>(mockMessages);

  const handleSend = (text: string) => {
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text,
      citations: [],
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);

    // Simulate AI response
    setTimeout(() => {
      const aiMsg: Message = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: `Based on the selected sources, here's what I found regarding "${text}": The research paper discusses this topic in the context of safety evaluation methodologies [Source: Research Paper - AI Safety.pdf, p.12]. The industry report provides complementary market data [Source: Industry Report 2025.pdf, Section 4].`,
        citations: [
          { id: `c-${Date.now()}`, sourceId: "1", sourceName: "Research Paper - AI Safety.pdf", passage: "Safety evaluation methodologies", pageOrSection: "p.12", isGeneralKnowledge: false },
        ],
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    }, 1000);
  };

  const handleQuestion = (q: string) => handleSend(q);

  return (
    <div className="flex h-full flex-col">
      {/* Notebook header */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">🔬</span>
          <h2 className="text-lg font-semibold">AI Safety Research</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          This notebook contains research on AI safety frameworks, quarterly
          planning documents, and industry analysis for 2025.
        </p>
      </div>

      <Separator />

      {/* Suggested questions */}
      {messages.length <= 1 && (
        <>
          <SuggestedQuestions onSelect={handleQuestion} />
          <Separator />
        </>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1">
        <MessageList messages={messages} />
      </ScrollArea>

      <Separator />

      {/* Input */}
      <ChatInput onSend={handleSend} sourceCount={4} />
    </div>
  );
}
