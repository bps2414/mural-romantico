"use server";

import { createClient } from "@/lib/supabase/server";
import { getAuthCookie } from "@/app/actions";
import { revalidatePath } from "next/cache";
import { sendPushNotification } from "@/lib/push-actions";

/**
 * Extract Spotify track ID from various URL formats:
 * - https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT
 * - https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT?si=xxxxx
 * - https://open.spotify.com/intl-pt/track/4cOdK2wGLETKBW3PvgPWqT
 * - spotify:track:4cOdK2wGLETKBW3PvgPWqT
 * - Just the ID: 4cOdK2wGLETKBW3PvgPWqT
 */
function extractSpotifyTrackId(input: string): string | null {
  const trimmed = input.trim();

  // Direct ID (22 chars alphanumeric)
  if (/^[a-zA-Z0-9]{22}$/.test(trimmed)) {
    return trimmed;
  }

  // spotify:track:ID format
  const uriMatch = trimmed.match(/spotify:track:([a-zA-Z0-9]{22})/);
  if (uriMatch) return uriMatch[1];

  // URL format (handles intl- variants and query params)
  const urlMatch = trimmed.match(/open\.spotify\.com\/(?:intl-[a-z]+\/)?track\/([a-zA-Z0-9]{22})/);
  if (urlMatch) return urlMatch[1];

  return null;
}

/**
 * Add a track to the playlist (admin only)
 */
export async function addTrack(
  spotifyInput: string,
  title: string,
  artist: string
) {
  const role = await getAuthCookie();
  if (role !== "admin") return { success: false, error: "Unauthorized" };

  const trackId = extractSpotifyTrackId(spotifyInput);
  if (!trackId) {
    return { success: false, error: "Link do Spotify inválido" };
  }

  if (!title.trim() || !artist.trim()) {
    return { success: false, error: "Preencha título e artista" };
  }

  const supabase = await createClient();

  const { error } = await supabase.from("playlist").insert({
    title: title.trim(),
    artist: artist.trim(),
    spotify_track_id: trackId,
  });

  if (error) {
    console.error("Error adding track:", error);
    return { success: false, error: "Erro ao adicionar música" };
  }

  revalidatePath("/");
  sendPushNotification("🎵 Música Nova", `Bryan adicionou "${title.trim()}"!`, "/").catch(() => {});
  return { success: true, error: null };
}

/**
 * Get all tracks ordered by newest first
 */
export async function getTracks() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("playlist")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching tracks:", error);
    return [];
  }

  return data;
}

/**
 * Delete a track (admin only)
 */
export async function deleteTrack(id: string) {
  const role = await getAuthCookie();
  if (role !== "admin") return false;

  const supabase = await createClient();

  const { error } = await supabase.from("playlist").delete().eq("id", id);

  if (error) {
    console.error("Error deleting track:", error);
    return false;
  }

  revalidatePath("/");
  return true;
}
