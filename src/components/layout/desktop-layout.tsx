"use client";

import { useState } from "react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { SourcesPanel } from "@/components/sources/sources-panel";
import { ChatPanel } from "@/components/chat/chat-panel";
import { StudioPanel } from "@/components/studio/studio-panel";
import { PluginMarketplace } from "@/components/marketplace/plugin-marketplace";

export function DesktopLayout() {
  const [marketplaceOpen, setMarketplaceOpen] = useState(false);

  return (
    <div className="flex h-screen flex-col">
      {/* Top bar */}
      <header className="flex h-14 items-center justify-between border-b px-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🔬</span>
          <h1 className="text-lg font-semibold">OpenNotebook</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMarketplaceOpen(true)}
            className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
          >
            🧩 Plugins
          </button>
          <button className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent">
            Export
          </button>
          <button className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent">
            Share
          </button>
        </div>
      </header>

      <PluginMarketplace open={marketplaceOpen} onOpenChange={setMarketplaceOpen} />

      {/* 3-panel layout */}
      <ResizablePanelGroup orientation="horizontal" className="flex-1">
        <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
          <SourcesPanel />
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={50} minSize={30}>
          <ChatPanel />
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={30} minSize={20} maxSize={40}>
          <StudioPanel />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
