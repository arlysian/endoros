import { supabaseAdmin } from "@/lib/supabase";
import { z } from "zod";

interface Account {
  id: string;
  pageId: string;
  pageAccessToken: string;
}

const FacebookPageSchema = z.object({
  followers_count: z.number(),
});

export async function fetchFacebookMetrics(account: Account) {
  const res = await fetch(
    `https://graph.facebook.com/v24.0/${account.pageId}?fields=followers_count&access_token=${account.pageAccessToken}`
  );

  const raw = await res.json();

  if (raw.error) {
    throw new Error(raw.error.message || "Failed to fetch Facebook metrics");
  }

  const data = FacebookPageSchema.parse(raw);

  const metrics = {
    followers: data.followers_count,
  };

  const todayStr = new Date().toISOString().split("T")[0];

  const { error: upsertError } = await supabaseAdmin
    .from("PlatformMetrics")
    .upsert(
      {
        connectedAccountId: account.id,
        date: todayStr,
        ...metrics,
        createdAt: new Date().toISOString(),
      },
      { onConflict: "connectedAccountId,date" }
    );

  if (upsertError) {
    throw new Error(upsertError.message);
  }

  return metrics;
}
