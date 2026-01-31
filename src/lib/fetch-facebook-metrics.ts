import { supabaseAdmin } from "@/lib/supabase";

interface Account {
  id: string;
  pageId: string;
  pageAccessToken: string;
}

export async function fetchFacebookMetrics(account: Account) {
  const res = await fetch(
    `https://graph.facebook.com/v24.0/${account.pageId}?fields=followers_count&access_token=${account.pageAccessToken}`
  );

  const data = await res.json();

  if (data.error) {
    throw new Error(data.error.message || "Failed to fetch Facebook metrics");
  }

  const metrics = {
    followers: data.followers_count ?? 0,
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
