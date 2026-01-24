import { supabaseAdmin } from "@/lib/supabase";

interface Account {
  id: string;
  platformUserId: string;
  accessToken: string;
}

export async function fetchTikTokMetrics(account: Account) {
  const { id, accessToken } = account;

  // Fetch user info with stats
  const userResponse = await fetch(
    "https://open.tiktokapis.com/v2/user/info/?fields=follower_count,likes_count,video_count",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const userData = await userResponse.json();

  if (userData.error?.code !== "ok" && userData.error) {
    throw new Error(userData.error?.message || "Failed to fetch TikTok user info");
  }

  const user = userData.data?.user;
  if (!user) {
    throw new Error("No user data returned from TikTok");
  }

  const metrics: Record<string, number> = {
    followers: user.follower_count ?? 0,
    videoCount: user.video_count ?? 0,
  };

  // Fetch video list to calculate aggregated metrics
  let totalViews = 0;
  let totalLikes = 0;
  let totalComments = 0;
  let totalShares = 0;
  let cursor: string | undefined;
  let hasMore = true;

  while (hasMore) {
    const videoResponse = await fetch(
      "https://open.tiktokapis.com/v2/video/list/?fields=view_count,like_count,comment_count,share_count",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          max_count: 20,
          ...(cursor && { cursor }),
        }),
      }
    );

    const videoData = await videoResponse.json();

    if (videoData.error?.code !== "ok" && videoData.error) {
      console.error("Failed to fetch TikTok videos:", videoData.error);
      break;
    }

    const videos = videoData.data?.videos || [];
    for (const video of videos) {
      totalViews += video.view_count ?? 0;
      totalLikes += video.like_count ?? 0;
      totalComments += video.comment_count ?? 0;
      totalShares += video.share_count ?? 0;
    }

    hasMore = videoData.data?.has_more ?? false;
    cursor = videoData.data?.cursor;
  }

  metrics.total_likes = totalLikes;
  metrics.total_comments = totalComments;
  metrics.total_shares = totalShares;
  if (metrics.videoCount > 0) {
    metrics.avgViews = Math.round(totalViews / metrics.videoCount);
  }
  if (totalViews > 0) {
    metrics.engagementRate = Math.round(((totalLikes + totalComments + totalShares) / totalViews) * 10000) / 100;
  }

  // Upsert into PlatformMetrics
  const todayStr = new Date().toISOString().split("T")[0];

  const { error: upsertError } = await supabaseAdmin
    .from("PlatformMetrics")
    .upsert(
      {
        connectedAccountId: id,
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
