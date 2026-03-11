"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteNote } from "@/lib/actions";
import { useRouter } from "next/navigation";

interface NoteProps {
  id: string;
  text: string;
  color: string;
  created_at: string;
}

const COLOR_MAP: Record<string, { bg: string; border: string; tape: string }> = {
  yellow: { bg: "bg-amber-50", border: "border-amber-200", tape: "bg-amber-300/60" },
  pink: { bg: "bg-pink-50", border: "border-pink-200", tape: "bg-pink-300/60" },
  blue: { bg: "bg-sky-50", border: "border-sky-200", tape: "bg-sky-300/60" },
  mint: { bg: "bg-emerald-50", border: "border-emerald-200", tape: "bg-emerald-300/60" },
  peach: { bg: "bg-orange-50", border: "border-orange-200", tape: "bg-orange-300/60" },
  lavender: { bg: "bg-violet-50", border: "border-violet-200", tape: "bg-violet-300/60" },
};

// Deterministic "random" rotation based on note id
function getRotation(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash) + id.charCodeAt(i);
    hash |= 0;
  }
  return (hash % 7) - 3; // Range: -3 to 3 degrees
}

export function NoteCard({ note, isAdmin }: { note: NoteProps; isAdmin: boolean }) {
  const [deleting, setDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const router = useRouter();

  const colors = COLOR_MAP[note.color] || COLOR_MAP.yellow;
  const rotation = getRotation(note.id);

  const dateStr = new Date(note.created_at).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });

  const handleDelete = async () => {
    if (!confirm("Apagar essa cartinha?")) return;
    setDeleting(true);
    const ok = await deleteNote(note.id);
    if (ok) {
      setDeleted(true);
      router.refresh();
    } else {
      setDeleting(false);
    }
  };

  if (deleted) return null;

  return (
    <div
      className={`relative break-inside-avoid mb-4 p-5 pt-7 rounded-lg border shadow-sm ${colors.bg} ${colors.border} transition-transform hover:scale-[1.02] hover:shadow-md`}
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      {/* Washi tape decoration */}
      <div
        className={`absolute -top-2.5 left-1/2 -translate-x-1/2 w-16 h-5 rounded-sm ${colors.tape} opacity-80`}
        style={{ transform: `rotate(${-rotation * 0.5}deg)` }}
      />

      {/* Delete button for admin */}
      {isAdmin && (
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="absolute top-1.5 right-1.5 p-1 rounded-full text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors disabled:opacity-50 z-10"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Note content */}
      <p className="font-handwriting text-lg leading-relaxed text-gray-700 whitespace-pre-wrap">
        {note.text}
      </p>

      {/* Date and author */}
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-gray-400 font-sans">{dateStr}</span>
        <span className="font-handwriting text-sm text-gray-400">— Bryan 💌</span>
      </div>
    </div>
  );
}
