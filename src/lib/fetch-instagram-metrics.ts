import { supabaseAdmin } from "@/lib/supabase";
import { z } from "zod";

interface Account {
  id: string;
  instagramBusinessId: string;
  accessToken: string;
}

// --- Zod schemas for Meta/Instagram API responses ---

const IgProfileSchema = z.object({
  followers_count: z.number(),
  username: z.string().optional(),
});

const IgInsightValueSchema = z.object({
  data: z.array(
    z.object({
      values: z.array(z.object({ value: z.number() })).min(1),
    })
  ).min(1),
});

const IgInsightTotalValueSchema = z.object({
  data: z.array(
    z.object({
      total_value: z.object({ value: z.number() }),
    })
  ).min(1),
});

const IgMediaListSchema = z.object({
  data: z.array(
    z.object({
      id: z.string(),
      like_count: z.number().optional().default(0),
      comments_count: z.number().optional().default(0),
    })
  ),
});

const IgFollowsBreakdownSchema = z.object({
  data: z.array(
    z.object({
      total_value: z.object({
        breakdowns: z.array(
          z.object({
            results: z.array(
              z.object({
                dimension_values: z.array(z.string()),
                value: z.number(),
              })
            ),
          })
        ),
      }),
    })
  ).min(1),
});

const BatchResponseItemSchema = z.object({
  code: z.number(),
  body: z.string(),
});

const BatchResponseSchema = z.array(BatchResponseItemSchema);

// Helper to safely parse batch insight body
const BatchInsightBodySchema = z.object({
  data: z.array(
    z.object({
      name: z.string(),
      values: z.array(z.object({ value: z.number() })).min(1),
    })
  ).min(1),
});

// --- Functions ---

// Backfill last 30 days of follows/unfollows on initial connect
export async function backfillFollowerHistory(account: Account) {
  const { id, instagramBusinessId, accessToken: token } = account;

  const days: { date: string; nextDate: string }[] = [];
  for (let i = 30; i >= 1; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    days.push({
      date: date.toISOString().split("T")[0],
      nextDate: nextDate.toISOString().split("T")[0],
    });
  }

  const batchRequests = days.map((d) => ({
    method: "GET",
    relative_url: `${instagramBusinessId}/insights?metric=follows_and_unfollows&metric_type=total_value&period=day&breakdown=follow_type&since=${d.date}&until=${d.nextDate}`,
  }));

  const batchRes = await fetch(
    `https://graph.facebook.com/v24.0/`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ batch: batchRequests }),
    }
  );
  const batchRaw = await batchRes.json();

  if (!Array.isArray(batchRaw)) {
    console.error("Batch API error in backfillFollowerHistory:", batchRaw);
    return 0;
  }

  const batchData = BatchResponseSchema.parse(batchRaw);

  const rows: { connectedAccountId: string; date: string; newFollows?: number; unfollows?: number; createdAt: string }[] = [];

  for (let i = 0; i < batchData.length; i++) {
    const response = batchData[i];
    let newFollows = 0;
    let unfollows = 0;

    if (response.code === 200) {
      const parsed = IgFollowsBreakdownSchema.safeParse(JSON.parse(response.body));
      if (parsed.success) {
        const results = parsed.data.data[0].total_value.breakdowns[0].results;
        for (const result of results) {
          if (result.dimension_values[0] === "FOLLOWER") {
            newFollows = result.value;
          } else if (result.dimension_values[0] === "NON_FOLLOWER") {
            unfollows = result.value;
          }
        }
      }
    }

    rows.push({
      connectedAccountId: id,
      date: days[i].date,
      newFollows,
      unfollows,
      createdAt: new Date().toISOString(),
    });
  }

  if (rows.length > 0) {
    const { error } = await supabaseAdmin
      .from("PlatformMetrics")
      .upsert(rows, { onConflict: "connectedAccountId,date" });

    if (error) {
      console.error("Backfill upsert error:", error);
    }
  }

  return rows.length;
}

// Backfill last 30 days of profile visits on initial connect
export async function backfillProfileVisits(account: Account) {
  const { id, instagramBusinessId, accessToken: token } = account;

  const days: { date: string; since: number; until: number }[] = [];
  for (let i = 30; i >= 1; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    days.push({
      date: date.toISOString().split("T")[0],
      since: Math.floor(date.getTime() / 1000),
      until: Math.floor(nextDate.getTime() / 1000),
    });
  }

  const batchRequests = days.map((d) => ({
    method: "GET",
    relative_url: `${instagramBusinessId}/insights?metric=profile_views&period=day&metric_type=total_value&since=${d.since}&until=${d.until}`,
  }));

  const batchRes = await fetch(
    `https://graph.facebook.com/v24.0/`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ batch: batchRequests }),
    }
  );
  const batchRaw = await batchRes.json();

  if (!Array.isArray(batchRaw)) {
    console.error("Batch API error in backfillProfileVisits:", batchRaw);
    return 0;
  }

  const batchData = BatchResponseSchema.parse(batchRaw);

  const rows: { connectedAccountId: string; date: string; profileVisits?: number; createdAt: string }[] = [];

  for (let i = 0; i < batchData.length; i++) {
    const response = batchData[i];
    let profileVisits = 0;

    if (response.code === 200) {
      const parsed = IgInsightTotalValueSchema.safeParse(JSON.parse(response.body));
      if (parsed.success) {
        profileVisits = parsed.data.data[0].total_value.value;
      }
    }

    rows.push({
      connectedAccountId: id,
      date: days[i].date,
      profileVisits,
      createdAt: new Date().toISOString(),
    });
  }

  if (rows.length > 0) {
    const { error } = await supabaseAdmin
      .from("PlatformMetrics")
      .upsert(rows, { onConflict: "connectedAccountId,date" });

    if (error) {
      console.error("Backfill profile visits upsert error:", error);
    }
  }

  return rows.length;
}

// Backfill last 30 days of link clicks on initial connect
export async function backfillLinkClicks(account: Account) {
  const { id, instagramBusinessId, accessToken: token } = account;

  const days: { date: string; since: number; until: number }[] = [];
  for (let i = 30; i >= 1; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    days.push({
      date: date.toISOString().split("T")[0],
      since: Math.floor(date.getTime() / 1000),
      until: Math.floor(nextDate.getTime() / 1000),
    });
  }

  const batchRequests = days.map((d) => ({
    method: "GET",
    relative_url: `${instagramBusinessId}/insights?metric=website_clicks&period=day&metric_type=total_value&since=${d.since}&until=${d.until}`,
  }));

  const batchRes = await fetch(
    `https://graph.facebook.com/v24.0/`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ batch: batchRequests }),
    }
  );
  const batchRaw = await batchRes.json();

  if (!Array.isArray(batchRaw)) {
    console.error("Batch API error in backfillLinkClicks:", batchRaw);
    return 0;
  }

  const batchData = BatchResponseSchema.parse(batchRaw);

  const rows: { connectedAccountId: string; date: string; linkClicks?: number; createdAt: string }[] = [];

  for (let i = 0; i < batchData.length; i++) {
    const response = batchData[i];
    let linkClicks = 0;

    if (response.code === 200) {
      const parsed = IgInsightTotalValueSchema.safeParse(JSON.parse(response.body));
      if (parsed.success) {
        linkClicks = parsed.data.data[0].total_value.value;
      }
    }

    rows.push({
      connectedAccountId: id,
      date: days[i].date,
      linkClicks,
      createdAt: new Date().toISOString(),
    });
  }

  if (rows.length > 0) {
    const { error } = await supabaseAdmin
      .from("PlatformMetrics")
      .upsert(rows, { onConflict: "connectedAccountId,date" });

    if (error) {
      console.error("Backfill link clicks upsert error:", error);
    }
  }

  return rows.length;
}

// Backfill last 30 days of engagement metrics (likes, comments, shares, saves) on initial connect
export async function backfillEngagement(account: Account) {
  const { id, instagramBusinessId, accessToken: token } = account;

  const days: { date: string; since: number; until: number }[] = [];
  for (let i = 31; i >= 2; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    days.push({
      date: date.toISOString().split("T")[0],
      since: Math.floor(date.getTime() / 1000),
      until: Math.floor(nextDate.getTime() / 1000),
    });
  }

  const allBatchRequests = days.flatMap((d) => [
    {
      method: "GET",
      relative_url: `${instagramBusinessId}/insights?metric=likes&period=day&metric_type=total_value&since=${d.since}&until=${d.until}`,
    },
    {
      method: "GET",
      relative_url: `${instagramBusinessId}/insights?metric=comments&period=day&metric_type=total_value&since=${d.since}&until=${d.until}`,
    },
    {
      method: "GET",
      relative_url: `${instagramBusinessId}/insights?metric=shares&period=day&metric_type=total_value&since=${d.since}&until=${d.until}`,
    },
    {
      method: "GET",
      relative_url: `${instagramBusinessId}/insights?metric=saves&period=day&metric_type=total_value&since=${d.since}&until=${d.until}`,
    },
  ]);

  const batchSize = 50;
  const batches: typeof allBatchRequests[] = [];
  for (let i = 0; i < allBatchRequests.length; i += batchSize) {
    batches.push(allBatchRequests.slice(i, i + batchSize));
  }

  const allResponses: z.infer<typeof BatchResponseItemSchema>[] = [];
  for (const batch of batches) {
    const batchRes = await fetch(
      `https://graph.facebook.com/v24.0/`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ batch }),
      }
    );
    const batchRaw = await batchRes.json();
    if (Array.isArray(batchRaw)) {
      const parsed = BatchResponseSchema.parse(batchRaw);
      allResponses.push(...parsed);
    } else {
      console.error("Batch API error:", batchRaw);
    }
  }

  const rows: {
    connectedAccountId: string;
    date: string;
    likes?: number;
    comments?: number;
    shares?: number;
    saves?: number;
    createdAt: string;
  }[] = [];

  for (let i = 0; i < days.length; i++) {
    const baseIndex = i * 4;
    let likes = 0;
    let comments = 0;
    let shares = 0;
    let saves = 0;

    const extractValue = (idx: number): number => {
      if (allResponses[idx]?.code === 200) {
        const parsed = IgInsightTotalValueSchema.safeParse(JSON.parse(allResponses[idx].body));
        if (parsed.success) return parsed.data.data[0].total_value.value;
      }
      return 0;
    };

    likes = extractValue(baseIndex);
    comments = extractValue(baseIndex + 1);
    shares = extractValue(baseIndex + 2);
    saves = extractValue(baseIndex + 3);

    rows.push({
      connectedAccountId: id,
      date: days[i].date,
      likes,
      comments,
      shares,
      saves,
      createdAt: new Date().toISOString(),
    });
  }

  if (rows.length > 0) {
    const { error } = await supabaseAdmin
      .from("PlatformMetrics")
      .upsert(rows, { onConflict: "connectedAccountId,date" });

    if (error) {
      console.error("Backfill engagement upsert error:", error);
    }
  }

  return rows.length;
}

export async function fetchAudienceDemographics(account: Account) {
  const { id, instagramBusinessId, accessToken: token } = account;
  const baseUrl = `https://graph.facebook.com/v24.0/${instagramBusinessId}/insights`;
  const breakdowns = ["age", "gender", "country"] as const;

  const rows: { connectedAccountId: string; type: string; label: string; value: number; updatedAt: string }[] = [];

  for (const breakdown of breakdowns) {
    const res = await fetch(
      `${baseUrl}?metric=follower_demographics&period=lifetime&metric_type=total_value&breakdown=${breakdown}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const raw = await res.json();

    if (raw.error) {
      console.error(`Demographics error (${breakdown}):`, raw.error);
      continue;
    }

    if (!raw.data?.length) {
      continue;
    }

    const parsed = IgFollowsBreakdownSchema.safeParse(raw);
    if (parsed.success) {
      let results = parsed.data.data[0].total_value.breakdowns[0].results;

      // Only store top 5 countries
      if (breakdown === "country") {
        results = [...results].sort((a, b) => b.value - a.value).slice(0, 5);
      }

      for (const result of results) {
        rows.push({
          connectedAccountId: id,
          type: breakdown,
          label: result.dimension_values[0],
          value: result.value,
          updatedAt: new Date().toISOString(),
        });
      }
    }
  }

  if (rows.length > 0) {
    const { error } = await supabaseAdmin
      .from("AudienceDemographics")
      .upsert(rows, { onConflict: "connectedAccountId,type,label" });

    if (error) {
      console.error("Demographics upsert error:", error);
    }
  }

  return rows.length;
}

export async function fetchInstagramMetrics(account: Account) {
  const { id, instagramBusinessId, accessToken: token } = account;

  // 1. Fetch profile (followers, username)
  const profileResponse = await fetch(
    `https://graph.facebook.com/v24.0/${instagramBusinessId}?fields=followers_count,username`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const profileRaw = await profileResponse.json();

  if (profileRaw.error) {
    throw new Error(profileRaw.error.message);
  }

  const profileData = IgProfileSchema.parse(profileRaw);

  const baseUrl = `https://graph.facebook.com/v24.0/${instagramBusinessId}/insights`;

  const metrics: Record<string, number> = {
    followers: profileData.followers_count,
  };

  // Reach
  const reachRes = await fetch(`${baseUrl}?metric=reach&period=days_28`, { headers: { Authorization: `Bearer ${token}` } });
  const reachRaw = await reachRes.json();
  const reachParsed = IgInsightValueSchema.safeParse(reachRaw);
  if (reachParsed.success) {
    metrics.reach = reachParsed.data.data[0].values[0].value;
  }

  // Fetch recent media for engagement metrics
  const mediaRes = await fetch(
    `https://graph.facebook.com/v24.0/${instagramBusinessId}/media?fields=id,like_count,comments_count&limit=50`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const mediaRaw = await mediaRes.json();
  const mediaParsed = IgMediaListSchema.safeParse(mediaRaw);

  if (mediaParsed.success && mediaParsed.data.data.length > 0) {
    const mediaData = mediaParsed.data.data;
    let totalLikes = 0;
    let totalComments = 0;

    for (const media of mediaData) {
      totalLikes += media.like_count;
      totalComments += media.comments_count;
    }

    const totalEngagements = totalLikes + totalComments;
    metrics.total_likes = totalLikes;
    metrics.total_comments = totalComments;

    // Batch request for views, shares, and saves
    const batchRequests = mediaData.flatMap((media) => [
      { method: "GET", relative_url: `${media.id}/insights?metric=views` },
      { method: "GET", relative_url: `${media.id}/insights?metric=shares` },
      { method: "GET", relative_url: `${media.id}/insights?metric=saved` },
    ]);

    const batchSize = 50;
    const allResponses: z.infer<typeof BatchResponseItemSchema>[] = [];
    for (let i = 0; i < batchRequests.length; i += batchSize) {
      const batch = batchRequests.slice(i, i + batchSize);
      const batchRes = await fetch(
        `https://graph.facebook.com/v24.0/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ batch }),
        }
      );
      const batchRaw = await batchRes.json();
      if (Array.isArray(batchRaw)) {
        const parsed = BatchResponseSchema.parse(batchRaw);
        allResponses.push(...parsed);
      } else {
        console.error("Batch API error in fetchInstagramMetrics:", batchRaw);
      }
    }

    let totalViews = 0;
    let totalShares = 0;
    let totalSaves = 0;

    for (const response of allResponses) {
      if (response.code === 200) {
        const parsed = BatchInsightBodySchema.safeParse(JSON.parse(response.body));
        if (parsed.success) {
          const metricName = parsed.data.data[0].name;
          const value = parsed.data.data[0].values[0].value;
          if (metricName === "views") totalViews += value;
          else if (metricName === "shares") totalShares += value;
          else if (metricName === "saved") totalSaves += value;
        }
      }
    }

    metrics.total_shares = totalShares;
    metrics.total_saves = totalSaves;

    const postCount = mediaData.length;

    // Engagement Rate
    if (metrics.followers > 0) {
      const engagementRate = (totalEngagements / (postCount * metrics.followers)) * 100;
      metrics.engagementRate = Math.round(engagementRate * 100) / 100;
    }

    // Avg Views per post
    metrics.avgViews = Math.round(totalViews / postCount);
  }

  // Profile views (yesterday, 24h lag for data consistency)
  const profileViewsDate = new Date();
  profileViewsDate.setDate(profileViewsDate.getDate() - 1);
  profileViewsDate.setHours(0, 0, 0, 0);
  const profileViewsNextDate = new Date(profileViewsDate);
  profileViewsNextDate.setDate(profileViewsNextDate.getDate() + 1);
  const profileViewsSince = Math.floor(profileViewsDate.getTime() / 1000);
  const profileViewsUntil = Math.floor(profileViewsNextDate.getTime() / 1000);
  const profileViewsRes = await fetch(`${baseUrl}?metric=profile_views&period=day&metric_type=total_value&since=${profileViewsSince}&until=${profileViewsUntil}`, { headers: { Authorization: `Bearer ${token}` } });
  const profileViewsRaw = await profileViewsRes.json();
  let profileVisitsValue = 0;
  const pvParsed = IgInsightTotalValueSchema.safeParse(profileViewsRaw);
  if (pvParsed.success) {
    profileVisitsValue = pvParsed.data.data[0].total_value.value;
  }

  // Website clicks (yesterday, 24h lag)
  const websiteClicksRes = await fetch(`${baseUrl}?metric=website_clicks&period=day&metric_type=total_value&since=${profileViewsSince}&until=${profileViewsUntil}`, { headers: { Authorization: `Bearer ${token}` } });
  const websiteClicksRaw = await websiteClicksRes.json();
  let linkClicksValue = 0;
  const wcParsed = IgInsightTotalValueSchema.safeParse(websiteClicksRaw);
  if (wcParsed.success) {
    linkClicksValue = wcParsed.data.data[0].total_value.value;
  }

  // Daily engagement metrics (yesterday, 24h lag) — account-level totals across all media
  let dailyLikes = 0;
  let dailyComments = 0;
  let dailyShares = 0;
  let dailySaves = 0;

  const engagementBatch = [
    { method: "GET", relative_url: `${instagramBusinessId}/insights?metric=likes&period=day&metric_type=total_value&since=${profileViewsSince}&until=${profileViewsUntil}` },
    { method: "GET", relative_url: `${instagramBusinessId}/insights?metric=comments&period=day&metric_type=total_value&since=${profileViewsSince}&until=${profileViewsUntil}` },
    { method: "GET", relative_url: `${instagramBusinessId}/insights?metric=shares&period=day&metric_type=total_value&since=${profileViewsSince}&until=${profileViewsUntil}` },
    { method: "GET", relative_url: `${instagramBusinessId}/insights?metric=saves&period=day&metric_type=total_value&since=${profileViewsSince}&until=${profileViewsUntil}` },
  ];

  const engagementBatchRes = await fetch(
    `https://graph.facebook.com/v24.0/`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ batch: engagementBatch }),
    }
  );
  const engagementBatchRaw = await engagementBatchRes.json();
  if (Array.isArray(engagementBatchRaw)) {
    const parsed = BatchResponseSchema.safeParse(engagementBatchRaw);
    if (parsed.success) {
      const extractVal = (idx: number): number => {
        if (parsed.data[idx]?.code === 200) {
          const p = IgInsightTotalValueSchema.safeParse(JSON.parse(parsed.data[idx].body));
          if (p.success) return p.data.data[0].total_value.value;
        }
        return 0;
      };
      dailyLikes = extractVal(0);
      dailyComments = extractVal(1);
      dailyShares = extractVal(2);
      dailySaves = extractVal(3);
    }
  }

  // Follows and unfollows (day before yesterday → yesterday to avoid lag)
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const dayBeforeYesterday = new Date(today);
  dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 2);
  const todayStr = today.toISOString().split("T")[0];
  const yesterdayStr = yesterday.toISOString().split("T")[0];
  const dayBeforeYesterdayStr = dayBeforeYesterday.toISOString().split("T")[0];

  const followsRes = await fetch(
    `${baseUrl}?metric=follows_and_unfollows&metric_type=total_value&period=day&breakdown=follow_type&since=${dayBeforeYesterdayStr}&until=${yesterdayStr}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const followsRaw = await followsRes.json();

  let newFollows = 0;
  let unfollows = 0;
  const followsParsed = IgFollowsBreakdownSchema.safeParse(followsRaw);
  if (followsParsed.success) {
    const results = followsParsed.data.data[0].total_value.breakdowns[0].results;
    for (const result of results) {
      if (result.dimension_values[0] === "FOLLOWER") {
        newFollows = result.value;
      } else if (result.dimension_values[0] === "NON_FOLLOWER") {
        unfollows = result.value;
      }
    }
  }

  // Update username if changed
  if (profileData.username) {
    await supabaseAdmin
      .from("ConnectedAccount")
      .update({ username: profileData.username, updatedAt: new Date().toISOString() })
      .eq("id", id);
  }

  // Upsert today's metrics (followers, reach, engagement, etc.)
  const { error: todayError } = await supabaseAdmin
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

  if (todayError) {
    throw new Error(todayError.message);
  }

  // Upsert day-before-yesterday's follows/unfollows (matches the data date)
  const { error: followsError } = await supabaseAdmin
    .from("PlatformMetrics")
    .upsert(
      {
        connectedAccountId: id,
        date: dayBeforeYesterdayStr,
        newFollows,
        unfollows,
        createdAt: new Date().toISOString(),
      },
      { onConflict: "connectedAccountId,date" }
    );

  if (followsError) {
    throw new Error(followsError.message);
  }

  // Upsert yesterday's profile visits, link clicks, and daily engagement (24h lag)
  const { error: yesterdayMetricsError } = await supabaseAdmin
    .from("PlatformMetrics")
    .upsert(
      {
        connectedAccountId: id,
        date: yesterdayStr,
        profileVisits: profileVisitsValue,
        linkClicks: linkClicksValue,
        likes: dailyLikes,
        comments: dailyComments,
        shares: dailyShares,
        saves: dailySaves,
        createdAt: new Date().toISOString(),
      },
      { onConflict: "connectedAccountId,date" }
    );

  if (yesterdayMetricsError) {
    throw new Error(yesterdayMetricsError.message);
  }

  return { ...metrics, newFollows, unfollows, profileVisits: profileVisitsValue, linkClicks: linkClicksValue };
}
