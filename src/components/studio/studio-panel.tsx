"use client";

import { useState, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { AudioOverview } from "./audio-overview";
import { OutputGenerator } from "./output-generator";
import { NotesSection } from "./notes-section";
import { GeneratedMedia } from "./generated-media";
import type { StudioOutputType, StudioOutput, Note } from "@/lib/types";

const outputTypes: {
  type: StudioOutputType;
  label: string;
  icon: string;
  description: string;
}[] = [
  {
    type: "study_guide",
    label: "Study Guide",
    icon: "📝",
    description: "Comprehensive study material",
  },
  {
    type: "briefing_doc",
    label: "Briefing Doc",
    icon: "📋",
    description: "Executive-style briefing",
  },
  {
    type: "faq",
    label: "FAQ",
    icon: "❓",
    description: "Frequently asked questions",
  },
  {
    type: "timeline",
    label: "Timeline",
    icon: "📅",
    description: "Chronological overview",
  },
  {
    type: "flashcards",
    label: "Flashcards",
    icon: "🃏",
    description: "Study flashcards",
  },
  {
    type: "quiz",
    label: "Quiz",
    icon: "📝",
    description: "Test your knowledge",
  },
  {
    type: "infographic",
    label: "Infographic",
    icon: "📊",
    description: "Visual data summary",
  },
  {
    type: "slide_deck",
    label: "Slide Deck",
    icon: "📑",
    description: "Presentation slides",
  },
];

const mockNotes: Note[] = [
  {
    id: "n1",
    title: "Key findings from AI Safety paper",
    content: "The main framework proposes...",
    createdAt: new Date(),
    updatedAt: new Date(),
    sourceIds: ["1"],
  },
  {
    id: "n2",
    title: "Industry trends summary",
    content: "Three major trends identified...",
    createdAt: new Date(),
    updatedAt: new Date(),
    sourceIds: ["3"],
  },
];

export function StudioPanel() {
  const [outputs, setOutputs] = useState<StudioOutput[]>([
    {
      id: "o2",
      type: "study_guide",
      title: "Study Guide (draft)",
      status: "preview",
      createdAt: new Date(),
    },
  ]);

  const handleGenerate = () => {};

  const handlePodcastGenerated = useCallback(
    (audioUrl: string, title: string) => {
      const newOutput: StudioOutput = {
        id: `podcast-${Date.now()}`,
        type: "audio_overview",
        title,
        status: "ready",
        createdAt: new Date(),
        content: audioUrl,
        duration: "~3 min",
      };
      setOutputs((prev) => [newOutput, ...prev]);
    },
    []
  );

  return (
    <div className="flex h-full flex-col">
      <div className="p-3">
        <h2 className="text-sm font-semibold">Studio</h2>
      </div>
      <Separator />
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-4">
          {/* Audio Overview — wired to Kokoro TTS */}
          <AudioOverview onPodcastGenerated={handlePodcastGenerated} />

          <Separator />

          {/* Generate New section */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground mb-2">
              Generate New
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {outputTypes.map((ot) => (
                <OutputGenerator
                  key={ot.type}
                  type={ot.type}
                  label={ot.label}
                  icon={ot.icon}
                  description={ot.description}
                  onGenerate={handleGenerate}
                />
              ))}
            </div>
          </div>

          <Separator />

          {/* Notes */}
          <NotesSection notes={mockNotes} />

          <Separator />

          {/* Generated Media */}
          <GeneratedMedia outputs={outputs} />
        </div>
      </ScrollArea>
    </div>
  );
}
