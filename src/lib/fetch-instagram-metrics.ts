import { supabaseAdmin } from "@/lib/supabase";

interface Account {
  id: string;
  instagramBusinessId: string;
  accessToken: string;
}

// Backfill last 30 days of follows/unfollows on initial connect
export async function backfillFollowerHistory(account: Account) {
  const { id, instagramBusinessId, accessToken: token } = account;

  // Generate last 30 days
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

  // Batch API request for all 30 days
  const batchRequests = days.map((d) => ({
    method: "GET",
    relative_url: `${instagramBusinessId}/insights?metric=follows_and_unfollows&metric_type=total_value&period=day&breakdown=follow_type&since=${d.date}&until=${d.nextDate}`,
  }));

  const batchRes = await fetch(
    `https://graph.facebook.com/v24.0/?access_token=${token}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ batch: batchRequests }),
    }
  );
  const batchData = await batchRes.json();

  // Process each day's response
  const rows: { connectedAccountId: string; date: string; newFollows?: number; unfollows?: number; createdAt: string }[] = [];

  for (let i = 0; i < batchData.length; i++) {
    const response = batchData[i];
    let newFollows = 0;
    let unfollows = 0;

    if (response.code === 200) {
      const body = JSON.parse(response.body);
      const results = body.data?.[0]?.total_value?.breakdowns?.[0]?.results;

      if (results) {
        for (const result of results) {
          if (result.dimension_values[0] === "FOLLOWER") {
            newFollows = result.value;
          } else if (result.dimension_values[0] === "NON_FOLLOWER") {
            unfollows = result.value;
          }
        }
      }
    }

    // Always create row, even if 0/0
    rows.push({
      connectedAccountId: id,
      date: days[i].date,
      newFollows,
      unfollows,
      createdAt: new Date().toISOString(),
    });
  }

  // Upsert all rows
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

export async function fetchInstagramMetrics(account: Account) {
  const { id, instagramBusinessId, accessToken: token } = account;

  // 1. Fetch profile (followers, username)
  const profileResponse = await fetch(
    `https://graph.facebook.com/v24.0/${instagramBusinessId}?fields=followers_count,username&access_token=${token}`
  );
  const profileData = await profileResponse.json();

  if (profileData.error) {
    throw new Error(profileData.error.message);
  }

  const baseUrl = `https://graph.facebook.com/v24.0/${instagramBusinessId}/insights`;

  const metrics: Record<string, number> = {
    followers: profileData.followers_count ?? 0,
  };

  // Reach
  const reachRes = await fetch(`${baseUrl}?metric=reach&period=days_28&access_token=${token}`);
  const reachData = await reachRes.json();
  if (reachData.data?.[0]?.values?.[0]?.value) {
    metrics.reach = reachData.data[0].values[0].value;
  }

  // Fetch recent media for engagement metrics
  const mediaRes = await fetch(
    `https://graph.facebook.com/v24.0/${instagramBusinessId}/media?fields=id,like_count,comments_count&limit=30&access_token=${token}`
  );
  const mediaData = await mediaRes.json();

  if (mediaData.data?.length > 0) {
    let totalLikes = 0;
    let totalComments = 0;

    for (const media of mediaData.data) {
      totalLikes += media.like_count || 0;
      totalComments += media.comments_count || 0;
    }

    const totalEngagements = totalLikes + totalComments;
    metrics.likes = totalLikes;
    metrics.comments = totalComments;

    // Batch request for views, shares, and saves
    const batchRequests = mediaData.data.flatMap((media: { id: string }) => [
      { method: "GET", relative_url: `${media.id}/insights?metric=views` },
      { method: "GET", relative_url: `${media.id}/insights?metric=shares` },
      { method: "GET", relative_url: `${media.id}/insights?metric=saved` },
    ]);

    const batchRes = await fetch(
      `https://graph.facebook.com/v24.0/?access_token=${token}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batch: batchRequests }),
      }
    );
    const batchData = await batchRes.json();

    let totalViews = 0;
    let totalShares = 0;
    let totalSaves = 0;

    for (const response of batchData) {
      if (response.code === 200) {
        const body = JSON.parse(response.body);
        if (body.data?.[0]?.values?.[0]?.value) {
          const metricName = body.data[0].name;
          const value = body.data[0].values[0].value;
          if (metricName === "views") totalViews += value;
          else if (metricName === "shares") totalShares += value;
          else if (metricName === "saved") totalSaves += value;
        }
      }
    }

    metrics.shares = totalShares;
    metrics.saves = totalSaves;

    const postCount = mediaData.data.length;

    // Engagement Rate
    if (metrics.followers > 0) {
      const engagementRate = (totalEngagements / (postCount * metrics.followers)) * 100;
      metrics.engagementRate = Math.round(engagementRate * 100) / 100;
    }

    // Avg Views per post
    metrics.avgViews = Math.round(totalViews / postCount);
  }

  // Profile views (last 7 days)
  const now = Math.floor(Date.now() / 1000);
  const sevenDaysAgo = now - 7 * 24 * 60 * 60;
  const profileViewsRes = await fetch(`${baseUrl}?metric=profile_views&period=day&metric_type=total_value&since=${sevenDaysAgo}&until=${now}&access_token=${token}`);
  const profileViewsData = await profileViewsRes.json();
  if (profileViewsData.data?.[0]?.total_value?.value !== undefined) {
    metrics.profileVisits = profileViewsData.data[0].total_value.value;
  }

  // Website clicks
  const websiteClicksRes = await fetch(`${baseUrl}?metric=website_clicks&metric_type=total_value&period=day&access_token=${token}`);
  const websiteClicksData = await websiteClicksRes.json();
  if (websiteClicksData.data?.[0]?.total_value?.value) {
    metrics.linkClicks = websiteClicksData.data[0].total_value.value;
  }

  // Accounts engaged
  const engagedRes = await fetch(`${baseUrl}?metric=accounts_engaged&metric_type=total_value&period=day&access_token=${token}`);
  const engagedData = await engagedRes.json();
  if (engagedData.data?.[0]?.total_value?.value) {
    metrics.accountsEngaged = engagedData.data[0].total_value.value;
  }

  // Total interactions
  const interactionsRes = await fetch(`${baseUrl}?metric=total_interactions&metric_type=total_value&period=day&access_token=${token}`);
  const interactionsData = await interactionsRes.json();
  if (interactionsData.data?.[0]?.total_value?.value) {
    metrics.totalInteractions = interactionsData.data[0].total_value.value;
  }

  // Follows and unfollows (yesterday's data - API needs since/until as dates)
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const todayStr = today.toISOString().split("T")[0];
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  const followsRes = await fetch(
    `${baseUrl}?metric=follows_and_unfollows&metric_type=total_value&period=day&breakdown=follow_type&since=${yesterdayStr}&until=${todayStr}&access_token=${token}`
  );
  const followsData = await followsRes.json();

  if (followsData.data?.[0]?.total_value?.breakdowns?.[0]?.results) {
    const results = followsData.data[0].total_value.breakdowns[0].results;
    for (const result of results) {
      if (result.dimension_values[0] === "FOLLOWER") {
        metrics.newFollows = result.value;
      } else if (result.dimension_values[0] === "NON_FOLLOWER") {
        metrics.unfollows = result.value;
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

  // Upsert into PlatformMetrics

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
