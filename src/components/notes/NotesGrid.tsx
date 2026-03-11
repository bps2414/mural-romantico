import { NoteCard } from "./NoteCard";
import { StickyNote } from "lucide-react";

interface Note {
  id: string;
  text: string;
  color: string;
  created_at: string;
}

export function NotesGrid({ notes, isAdmin }: { notes: Note[]; isAdmin: boolean }) {
  if (!notes || notes.length === 0) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-center text-rose-300">
        <StickyNote className="w-12 h-12 mb-4 opacity-50" strokeWidth={1} />
        <p className="font-heading font-medium text-lg">Nenhuma cartinha ainda...</p>
        <p className="text-sm">As cartinhas do Bryan vão aparecer aqui.</p>
      </div>
    );
  }

  return (
    <div className="columns-2 gap-3 py-2">
      {notes.map((note) => (
        <NoteCard key={note.id} note={note} isAdmin={isAdmin} />
      ))}
    </div>
  );
}
