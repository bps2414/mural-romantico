"use server";

import { createClient } from "@/lib/supabase/server";
import { getAuthCookie } from "@/app/actions";
import { revalidatePath } from "next/cache";

/**
 * Add multiple phrases to the love jar (admin only)
 * Accepts multi-line text, splits by newline
 */
export async function addPhrases(text: string, category: string = "motivo") {
  const role = await getAuthCookie();
  if (role !== "admin") return { success: false, count: 0 };

  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) return { success: false, count: 0 };

  const supabase = await createClient();

  const rows = lines.map((phrase) => ({ phrase, category }));

  const { error } = await supabase.from("love_jar_phrases").insert(rows);

  if (error) {
    console.error("Error adding phrases:", error);
    return { success: false, count: 0 };
  }

  revalidatePath("/");
  return { success: true, count: lines.length };
}

/**
 * Draw a random phrase (anti-repeat: skips recently drawn)
 */
export async function drawPhrase() {
  const supabase = await createClient();

  // Fetch a random phrase not drawn in the last 3 hours
  const { data, error } = await supabase
    .from("love_jar_phrases")
    .select("*")
    .or("last_drawn_at.is.null,last_drawn_at.lt." + new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString())
    .order("created_at", { ascending: false })
    .limit(50);

  if (error || !data || data.length === 0) {
    // Fallback: try ANY phrase if all were recently drawn
    const { data: fallback } = await supabase
      .from("love_jar_phrases")
      .select("*")
      .order("last_drawn_at", { ascending: true, nullsFirst: true })
      .limit(1)
      .single();

    if (fallback) {
      await supabase
        .from("love_jar_phrases")
        .update({ last_drawn_at: new Date().toISOString() })
        .eq("id", fallback.id);
      return fallback;
    }

    return null;
  }

  // Pick random from eligible
  const chosen = data[Math.floor(Math.random() * data.length)];

  // Mark as drawn
  await supabase
    .from("love_jar_phrases")
    .update({ last_drawn_at: new Date().toISOString() })
    .eq("id", chosen.id);

  return chosen;
}

/**
 * Get count of phrases in the jar
 */
export async function getPhraseCount() {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("love_jar_phrases")
    .select("*", { count: "exact", head: true });

  if (error) return 0;
  return count ?? 0;
}
