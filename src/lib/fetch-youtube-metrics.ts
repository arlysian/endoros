import { supabaseAdmin } from "@/lib/supabase";
import { z } from "zod";

interface Account {
  id: string;
  platformUserId: string;
  accessToken: string;
  refreshToken: string | null;
}

// --- Zod schemas for external API responses ---

const TokenResponseSchema = z.object({
  access_token: z.string(),
  expires_in: z.number().optional(),
  refresh_token: z.string().optional(),
});

const ChannelStatisticsSchema = z.object({
  items: z
    .array(
      z.object({
        statistics: z.object({
          subscriberCount: z.string(),
          hiddenSubscriberCount: z.boolean(),
        }),
      })
    )
    .min(1, "No YouTube channel data returned"),
});

const AnalyticsReportSchema = z.object({
  rows: z
    .array(z.tuple([z.number(), z.number(), z.number(), z.number()]))
    .optional(),
});

const ChannelContentDetailsSchema = z.object({
  items: z
    .array(
      z.object({
        contentDetails: z.object({
          relatedPlaylists: z.object({
            uploads: z.string(),
          }),
        }),
      })
    )
    .optional(),
});

const PlaylistPageInfoSchema = z.object({
  pageInfo: z.object({
    totalResults: z.number(),
  }),
});

// --- Functions ---

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

  const raw = await res.json();
  const data = TokenResponseSchema.parse(raw);

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
  const headers = { Authorization: `Bearer ${accessToken}` };

  const res = await fetch(
    `https://youtubeanalytics.googleapis.com/v2/reports?ids=channel==MINE&startDate=2010-01-01&endDate=${today}&metrics=views,likes,comments,shares`,
    { headers }
  );
  const raw = await res.json();
  const data = AnalyticsReportSchema.parse(raw);
  const [views, likes, comments, shares] = data.rows?.[0] ?? [0, 0, 0, 0];

  return { views, likes, comments, shares };
}

async function fetchUploadCount(channelId: string, accessToken: string): Promise<number> {
  const headers = { Authorization: `Bearer ${accessToken}` };

  const chRes = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}`,
    { headers }
  );
  const chRaw = await chRes.json();
  const chData = ChannelContentDetailsSchema.parse(chRaw);
  const uploadsId = chData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!uploadsId) return 0;

  const plRes = await fetch(
    `https://www.googleapis.com/youtube/v3/playlistItems?part=id&playlistId=${uploadsId}&maxResults=0`,
    { headers }
  );
  const plRaw = await plRes.json();
  const plData = PlaylistPageInfoSchema.parse(plRaw);
  return plData.pageInfo.totalResults;
}

export async function fetchYouTubeMetrics(account: Account) {
  const accessToken = await refreshAccessToken(account);

  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${account.platformUserId}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  const raw = await res.json();
  const data = ChannelStatisticsSchema.parse(raw);
  const stats = data.items[0].statistics;

  if (stats.hiddenSubscriberCount) {
    throw new Error("Subscriber count is hidden");
  }

  const [analyticsData, videoCount] = await Promise.all([
    fetchYouTubeAnalytics(accessToken),
    fetchUploadCount(account.platformUserId, accessToken),
  ]);

  const metrics = {
    followers: parseInt(stats.subscriberCount, 10) || 0,
    videoCount,
    avgViews: videoCount > 0 ? Math.round(analyticsData.views / videoCount) : 0,
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
