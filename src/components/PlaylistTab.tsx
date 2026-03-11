"use client";

import { Music, Trash2 } from "lucide-react";
import { deleteTrack } from "@/lib/playlist-actions";
import { useState, useTransition } from "react";

interface Track {
  id: string;
  title: string;
  artist: string;
  spotify_track_id: string;
}

interface PlaylistTabProps {
  tracks: Track[];
  isAdmin: boolean;
}

export function PlaylistTab({ tracks, isAdmin }: PlaylistTabProps) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (window.confirm("Certeza que quer apagar essa música da trilha?")) {
      setIsDeleting(id);
      await deleteTrack(id);
      setIsDeleting(null);
    }
  };
  // Empty state
  if (tracks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <Music className="w-12 h-12 text-rose-200 mb-4" strokeWidth={1} />
        <p className="text-sm text-rose-300 font-medium">
          Nenhuma música ainda...
        </p>
        <p className="text-xs text-rose-200 mt-1">
          Peça ao Bryan para adicionar as músicas de vocês 🎶
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-rose-300 text-center mb-2">
        🎵 {tracks.length} {tracks.length === 1 ? "música" : "músicas"} na trilha sonora
      </p>

      {tracks.map((track) => (
        <div key={track.id} className="playlist-card rounded-2xl overflow-hidden bg-white border border-rose-100 shadow-sm">
          {/* Track info header */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-rose-50/50">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-base">💿</span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-rose-900 truncate">
                  {track.title}
                </p>
                <p className="text-xs text-rose-400 truncate">
                  {track.artist}
                </p>
              </div>
            </div>
            {isAdmin && (
              <button
                onClick={() => handleDelete(track.id)}
                disabled={isDeleting === track.id}
                className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${
                  isDeleting === track.id 
                    ? "text-rose-200 cursor-not-allowed" 
                    : "text-rose-300 hover:text-red-500 hover:bg-red-50"
                }`}
                title="Remover música"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Spotify Embed - Compact (80px) */}
          <iframe
            src={`https://open.spotify.com/embed/track/${track.spotify_track_id}?utm_source=generator&theme=0`}
            width="100%"
            height="80"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="eager"
            className="border-0 bg-rose-50 rounded-b-2xl"
            title={`${track.title} - ${track.artist}`}
          />
        </div>
      ))}
    </div>
  );
}
