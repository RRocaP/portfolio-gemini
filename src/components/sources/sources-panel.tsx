"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { SourceCard } from "./source-card";
import { SourceUpload } from "./source-upload";
import type { Source } from "@/lib/types";

const mockSources: Source[] = [
  { id: "1", name: "Research Paper - AI Safety.pdf", type: "pdf", selected: true, addedAt: new Date(), pageCount: 24, summary: "Comprehensive overview of AI safety challenges" },
  { id: "2", name: "Meeting Notes Q4.docx", type: "text", selected: true, addedAt: new Date(), summary: "Quarterly planning meeting notes" },
  { id: "3", name: "Industry Report 2025.pdf", type: "pdf", selected: false, addedAt: new Date(), pageCount: 48, summary: "Market analysis and trends" },
  { id: "4", name: "Project Slides.pptx", type: "text", selected: true, addedAt: new Date(), summary: "Project presentation deck" },
  { id: "5", name: "Google Drive", type: "text", selected: false, addedAt: new Date(), isLive: true, liveSourceType: "google_drive", liveConnected: true },
  { id: "6", name: "PubMed", type: "text", selected: false, addedAt: new Date(), isLive: true, liveSourceType: "pubmed", liveConnected: false },
];

export function SourcesPanel() {
  const [sources, setSources] = useState<Source[]>(mockSources);
  const [search, setSearch] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);

  const filtered = sources.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );
  const selectedCount = sources.filter((s) => s.selected).length;

  const toggleSource = (id: string) => {
    setSources((prev) =>
      prev.map((s) => (s.id === id ? { ...s, selected: !s.selected } : s))
    );
  };

  const toggleAll = () => {
    const allSelected = sources.every((s) => s.selected);
    setSources((prev) => prev.map((s) => ({ ...s, selected: !allSelected })));
  };

  return (
    <div className="flex h-full flex-col">
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold">Sources</h2>
          <span className="text-xs text-muted-foreground">
            {selectedCount} selected
          </span>
        </div>
        <Input
          placeholder="Search sources..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 text-sm"
        />
      </div>

      <Separator />

      <div className="px-3 py-2">
        <button
          onClick={toggleAll}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          {sources.every((s) => s.selected) ? "Deselect all" : "Select all"}
        </button>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-1 p-2">
          {filtered.map((source) => (
            <SourceCard
              key={source.id}
              source={source}
              onToggle={() => toggleSource(source.id)}
            />
          ))}
        </div>
      </ScrollArea>

      <Separator />

      <div className="p-3">
        <Button
          variant="outline"
          className="w-full text-sm"
          onClick={() => setUploadOpen(true)}
        >
          + Add Source
        </Button>
      </div>

      <SourceUpload open={uploadOpen} onOpenChange={setUploadOpen} />
    </div>
  );
}
