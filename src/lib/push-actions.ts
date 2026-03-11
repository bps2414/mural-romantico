"use server";

import { createClient } from "@/lib/supabase/server";
// @ts-expect-error - no types available
import webpush from "web-push";

// Configure VAPID
webpush.setVapidDetails(
  "mailto:bryan@mural-romantico.app",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

// Save a push subscription to Supabase
export async function saveSubscription(subscription: PushSubscription) {
  const supabase = await createClient();

  const { error } = await supabase.from("push_subscriptions").insert({
    subscription: JSON.parse(JSON.stringify(subscription)),
    user_agent: "web-client",
  });

  if (error) {
    console.error("Error saving subscription:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// Remove a push subscription
export async function removeSubscription(endpoint: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("push_subscriptions")
    .delete()
    .eq("subscription->>endpoint", endpoint);

  if (error) {
    console.error("Error removing subscription:", error);
    return { success: false };
  }

  return { success: true };
}

// Send push notification to all subscribers
export async function sendPushNotification(
  title: string,
  body: string,
  url: string = "/"
) {
  const supabase = await createClient();

  const { data: subscriptions, error } = await supabase
    .from("push_subscriptions")
    .select("id, subscription");

  if (error || !subscriptions?.length) {
    return;
  }

  const payload = JSON.stringify({ title, body, url });

  const results = await Promise.allSettled(
    subscriptions.map(async (sub: any) => {
      try {
        await webpush.sendNotification(sub.subscription, payload);
      } catch (err: any) {
        // If subscription is expired/invalid, remove it
        if (err.statusCode === 410 || err.statusCode === 404) {
          await (await createClient())
            .from("push_subscriptions")
            .delete()
            .eq("id", sub.id);
        }
      }
    })
  );

  return { sent: results.length };
}
