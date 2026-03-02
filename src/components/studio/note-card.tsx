import type { Note } from "@/lib/types";

interface NoteCardProps {
  note: Note;
}

export function NoteCard({ note }: NoteCardProps) {
  return (
    <div className="rounded-md border p-2 hover:bg-accent cursor-pointer transition-colors">
      <div className="flex items-center gap-1.5">
        <span className="text-sm">📌</span>
        <span className="text-xs font-medium truncate">{note.title}</span>
      </div>
      <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">
        {note.content}
      </p>
    </div>
  );
}
