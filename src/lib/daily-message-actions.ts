"use server";

import { createClient } from "@/lib/supabase/server";
import { getAuthCookie } from "@/app/actions";
import { revalidatePath } from "next/cache";
import { sendPushNotification } from "@/lib/push-actions";

/**
 * Get today's date in São Paulo timezone (YYYY-MM-DD)
 */
function getTodayDateSP(): string {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Sao_Paulo",
  });
}

/**
 * Fetch today's daily message (timezone-aware)
 */
export async function getDailyMessage() {
  const supabase = await createClient();
  const today = getTodayDateSP();

  const { data, error } = await supabase
    .from("daily_messages")
    .select("*")
    .eq("date", today)
    .maybeSingle();

  if (error) {
    console.error("Error fetching daily message:", error);
    return null;
  }

  return data;
}

/**
 * Create today's daily message (admin only)
 */
export async function createDailyMessage(text: string) {
  const role = await getAuthCookie();
  if (role !== "admin") return { success: false, error: "Unauthorized" };

  if (!text.trim()) return { success: false, error: "Texto vazio" };

  const supabase = await createClient();
  const today = getTodayDateSP();

  const { error } = await supabase.from("daily_messages").insert({
    text: text.trim(),
    date: today,
  });

  if (error) {
    if (error.code === "23505") {
      // UNIQUE violation — already sent today
      return { success: false, error: "Você já enviou a frase de hoje!" };
    }
    console.error("Error creating daily message:", error);
    return { success: false, error: "Erro ao enviar" };
  }

  revalidatePath("/");
  sendPushNotification("💬 Frase do Dia", "Bryan escreveu algo especial pra você!", "/").catch(() => {});
  return { success: true, error: null };
}

/**
 * Update today's daily message (admin only)
 */
export async function updateDailyMessage(id: string, text: string) {
  const role = await getAuthCookie();
  if (role !== "admin") return false;

  if (!text.trim()) return false;

  const supabase = await createClient();

  const { error } = await supabase
    .from("daily_messages")
    .update({ text: text.trim(), updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("Error updating daily message:", error);
    return false;
  }

  revalidatePath("/");
  return true;
}

/**
 * Mark message as read (Tata clicks to reveal)
 */
export async function markMessageAsRead(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("daily_messages")
    .update({ is_read: true })
    .eq("id", id);

  if (error) {
    console.error("Error marking message as read:", error);
    return false;
  }

  revalidatePath("/");
  return true;
}
