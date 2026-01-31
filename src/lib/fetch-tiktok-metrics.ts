import { supabaseAdmin } from "@/lib/supabase";
import { z } from "zod";

interface Account {
  id: string;
  platformUserId: string;
  accessToken: string;
}

// --- Zod schemas for TikTok API responses ---

const TikTokUserResponseSchema = z.object({
  data: z.object({
    user: z.object({
      follower_count: z.number(),
      likes_count: z.number(),
      video_count: z.number(),
    }),
  }),
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
});

const TikTokVideoSchema = z.object({
  view_count: z.number().optional().default(0),
  like_count: z.number().optional().default(0),
  comment_count: z.number().optional().default(0),
  share_count: z.number().optional().default(0),
});

const TikTokVideoListResponseSchema = z.object({
  data: z.object({
    videos: z.array(TikTokVideoSchema).optional().default([]),
    has_more: z.boolean().optional().default(false),
    cursor: z.union([z.string(), z.number()]).optional(),
  }),
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
});

// --- Functions ---

export async function fetchTikTokMetrics(account: Account) {
  const { id, accessToken } = account;

  const userResponse = await fetch(
    "https://open.tiktokapis.com/v2/user/info/?fields=follower_count,likes_count,video_count",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const userRaw = await userResponse.json();
  const userData = TikTokUserResponseSchema.parse(userRaw);

  if (userData.error.code !== "ok") {
    throw new Error(userData.error.message || "Failed to fetch TikTok user info");
  }

  const user = userData.data.user;

  const metrics: Record<string, number> = {
    followers: user.follower_count,
    videoCount: user.video_count,
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

    const videoRaw = await videoResponse.json();
    const videoData = TikTokVideoListResponseSchema.parse(videoRaw);

    if (videoData.error.code !== "ok") {
      console.error("Failed to fetch TikTok videos:", videoData.error);
      break;
    }

    for (const video of videoData.data.videos) {
      totalViews += video.view_count;
      totalLikes += video.like_count;
      totalComments += video.comment_count;
      totalShares += video.share_count;
    }

    hasMore = videoData.data.has_more;
    cursor = videoData.data.cursor?.toString();
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
