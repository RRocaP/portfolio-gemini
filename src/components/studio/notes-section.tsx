"use client";

import { Button } from "@/components/ui/button";
import { NoteCard } from "./note-card";
import type { Note } from "@/lib/types";

const templates = ["Study Guide", "Briefing", "FAQ", "Timeline"];

interface NotesSectionProps {
  notes: Note[];
}

export function NotesSection({ notes }: NotesSectionProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-muted-foreground">Notes</h3>
        <Button variant="ghost" size="sm" className="h-6 text-xs">
          + New
        </Button>
      </div>

      {/* Template chips */}
      <div className="flex flex-wrap gap-1 mb-2">
        {templates.map((t) => (
          <button
            key={t}
            className="rounded-full border px-2 py-0.5 text-[10px] hover:bg-accent transition-colors"
          >
            {t}
          </button>
        ))}
      </div>

      {/* Note cards */}
      <div className="space-y-1">
        {notes.map((note) => (
          <NoteCard key={note.id} note={note} />
        ))}
      </div>
    </div>
  );
}
