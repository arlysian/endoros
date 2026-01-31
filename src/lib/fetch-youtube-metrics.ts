import { supabaseAdmin } from "@/lib/supabase";

interface Account {
  id: string;
  platformUserId: string;
  accessToken: string;
  refreshToken: string | null;
}

async function refreshAccessToken(account: Account): Promise<string> {
  if (!account.refreshToken) {
    throw new Error("No refresh token available for YouTube account");
  }

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: account.refreshToken,
      grant_type: "refresh_token",
    }),
  });

  const data = await res.json();

  if (data.error || !data.access_token) {
    throw new Error(data.error_description || "Failed to refresh YouTube token");
  }

  const tokenExpiresAt = new Date(Date.now() + (data.expires_in || 3600) * 1000);

  const updateFields: Record<string, string> = {
    accessToken: data.access_token,
    tokenExpiresAt: tokenExpiresAt.toISOString(),
  };

  if (data.refresh_token && data.refresh_token !== account.refreshToken) {
    updateFields.refreshToken = data.refresh_token;
  }

  await supabaseAdmin
    .from("ConnectedAccount")
    .update(updateFields)
    .eq("id", account.id);

  return data.access_token;
}

async function fetchYouTubeAnalytics(accessToken: string) {
  const today = new Date().toISOString().split("T")[0];
  const res = await fetch(
    `https://youtubeanalytics.googleapis.com/v2/reports?ids=channel==MINE&startDate=2010-01-01&endDate=${today}&metrics=views,likes,comments,shares`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const data = await res.json();

  if (!data.rows || data.rows.length === 0) {
    return { views: 0, likes: 0, comments: 0, shares: 0 };
  }

  const [views, likes, comments, shares] = data.rows[0];
  return { views, likes, comments, shares };
}

export async function fetchYouTubeMetrics(account: Account) {
  // Refresh token first since Google tokens expire in 1 hour
  const accessToken = await refreshAccessToken(account);

  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${account.platformUserId}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  const data = await res.json();

  if (!data.items || data.items.length === 0) {
    throw new Error("No YouTube channel data returned");
  }

  const stats = data.items[0].statistics;

  if (stats.hiddenSubscriberCount) {
    throw new Error("Subscriber count is hidden");
  }

  const totalViews = parseInt(stats.viewCount, 10) || 0;
  const videoCount = parseInt(stats.videoCount, 10) || 0;

  // Fetch lifetime engagement from YouTube Analytics API
  const analyticsData = await fetchYouTubeAnalytics(accessToken);

  const metrics = {
    followers: parseInt(stats.subscriberCount, 10) || 0,
    videoCount,
    avgViews: videoCount > 0 ? Math.round(totalViews / videoCount) : 0,
    total_likes: analyticsData.likes,
    total_comments: analyticsData.comments,
    total_shares: analyticsData.shares,
    engagementRate: analyticsData.views > 0
      ? Math.round(((analyticsData.likes + analyticsData.comments + analyticsData.shares) / analyticsData.views) * 10000) / 100
      : 0,
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
