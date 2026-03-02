"use client";

import { useState } from "react";
import { SourcesPanel } from "@/components/sources/sources-panel";
import { ChatPanel } from "@/components/chat/chat-panel";
import { StudioPanel } from "@/components/studio/studio-panel";
import { cn } from "@/lib/utils";

type TabValue = "sources" | "chat" | "studio";

const tabs: { value: TabValue; label: string; icon: string }[] = [
  { value: "sources", label: "Sources", icon: "📚" },
  { value: "chat", label: "Chat", icon: "💬" },
  { value: "studio", label: "Studio", icon: "🎨" },
];

export function MobileLayout() {
  const [activeTab, setActiveTab] = useState<TabValue>("chat");

  return (
    <div className="flex h-screen flex-col">
      {/* Top bar */}
      <header className="flex h-12 items-center justify-between border-b px-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">🔬</span>
          <h1 className="text-base font-semibold">OpenNotebook</h1>
        </div>
        <button className="rounded-md border px-2 py-1 text-sm hover:bg-accent">
          ≡
        </button>
      </header>

      {/* Active panel */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "sources" && <SourcesPanel />}
        {activeTab === "chat" && <ChatPanel />}
        {activeTab === "studio" && <StudioPanel />}
      </div>

      {/* Bottom tab bar */}
      <nav className="flex h-14 items-center justify-around border-t bg-background">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              "flex flex-col items-center gap-0.5 px-4 py-1 text-xs",
              activeTab === tab.value
                ? "text-primary font-medium"
                : "text-muted-foreground"
            )}
          >
            <span className="text-base">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
