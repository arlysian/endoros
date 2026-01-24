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

  if (!Array.isArray(batchData)) {
    console.error("Batch API error in backfillFollowerHistory:", batchData);
    return 0;
  }

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

// Backfill last 30 days of profile visits on initial connect
export async function backfillProfileVisits(account: Account) {
  const { id, instagramBusinessId, accessToken: token } = account;

  // Generate last 30 days
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

  const baseUrl = `https://graph.facebook.com/v24.0/${instagramBusinessId}/insights`;

  // Batch API request for all 30 days
  const batchRequests = days.map((d) => ({
    method: "GET",
    relative_url: `${instagramBusinessId}/insights?metric=profile_views&period=day&metric_type=total_value&since=${d.since}&until=${d.until}`,
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

  if (!Array.isArray(batchData)) {
    console.error("Batch API error in backfillProfileVisits:", batchData);
    return 0;
  }

  // Process each day's response
  const rows: { connectedAccountId: string; date: string; profileVisits?: number; createdAt: string }[] = [];

  for (let i = 0; i < batchData.length; i++) {
    const response = batchData[i];
    let profileVisits = 0;

    if (response.code === 200) {
      const body = JSON.parse(response.body);
      if (body.data?.[0]?.total_value?.value !== undefined) {
        profileVisits = body.data[0].total_value.value;
      }
    }

    rows.push({
      connectedAccountId: id,
      date: days[i].date,
      profileVisits,
      createdAt: new Date().toISOString(),
    });
  }

  // Upsert all rows
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

  // Generate last 30 days
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

  // Batch API request for all 30 days
  const batchRequests = days.map((d) => ({
    method: "GET",
    relative_url: `${instagramBusinessId}/insights?metric=website_clicks&period=day&metric_type=total_value&since=${d.since}&until=${d.until}`,
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

  if (!Array.isArray(batchData)) {
    console.error("Batch API error in backfillLinkClicks:", batchData);
    return 0;
  }

  // Process each day's response
  const rows: { connectedAccountId: string; date: string; linkClicks?: number; createdAt: string }[] = [];

  for (let i = 0; i < batchData.length; i++) {
    const response = batchData[i];
    let linkClicks = 0;

    if (response.code === 200) {
      const body = JSON.parse(response.body);
      if (body.data?.[0]?.total_value?.value !== undefined) {
        linkClicks = body.data[0].total_value.value;
      }
    }

    rows.push({
      connectedAccountId: id,
      date: days[i].date,
      linkClicks,
      createdAt: new Date().toISOString(),
    });
  }

  // Upsert all rows
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

  // Generate last 30 days (with 24h lag, so day 2-31 ago)
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

  // Batch API requests - 4 metrics per day, so 4 requests per day
  // Meta batch limit is 50, so we need to split into multiple batches
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

  // Split into batches of 50
  const batchSize = 50;
  const batches: typeof allBatchRequests[] = [];
  for (let i = 0; i < allBatchRequests.length; i += batchSize) {
    batches.push(allBatchRequests.slice(i, i + batchSize));
  }

  // Execute all batches
  const allResponses: { code: number; body: string }[] = [];
  for (const batch of batches) {
    const batchRes = await fetch(
      `https://graph.facebook.com/v24.0/?access_token=${token}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batch }),
      }
    );
    const batchData = await batchRes.json();
    if (Array.isArray(batchData)) {
      allResponses.push(...batchData);
    } else {
      console.error("Batch API error:", batchData);
    }
  }

  // Process responses - 4 responses per day
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

    // Likes
    if (allResponses[baseIndex]?.code === 200) {
      const body = JSON.parse(allResponses[baseIndex].body);
      if (body.data?.[0]?.total_value?.value !== undefined) {
        likes = body.data[0].total_value.value;
      }
    }

    // Comments
    if (allResponses[baseIndex + 1]?.code === 200) {
      const body = JSON.parse(allResponses[baseIndex + 1].body);
      if (body.data?.[0]?.total_value?.value !== undefined) {
        comments = body.data[0].total_value.value;
      }
    }

    // Shares
    if (allResponses[baseIndex + 2]?.code === 200) {
      const body = JSON.parse(allResponses[baseIndex + 2].body);
      if (body.data?.[0]?.total_value?.value !== undefined) {
        shares = body.data[0].total_value.value;
      }
    }

    // Saves
    if (allResponses[baseIndex + 3]?.code === 200) {
      const body = JSON.parse(allResponses[baseIndex + 3].body);
      if (body.data?.[0]?.total_value?.value !== undefined) {
        saves = body.data[0].total_value.value;
      }
    }

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

  // Upsert all rows
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
    `https://graph.facebook.com/v24.0/${instagramBusinessId}/media?fields=id,like_count,comments_count&limit=500&access_token=${token}`
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
    metrics.total_likes = totalLikes;
    metrics.total_comments = totalComments;

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

    if (!Array.isArray(batchData)) {
      console.error("Batch API error in fetchInstagramMetrics:", batchData);
    } else {
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
    }

    metrics.total_shares = totalShares;
    metrics.total_saves = totalSaves;

    const postCount = mediaData.data.length;

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
  const profileViewsRes = await fetch(`${baseUrl}?metric=profile_views&period=day&metric_type=total_value&since=${profileViewsSince}&until=${profileViewsUntil}&access_token=${token}`);
  const profileViewsData = await profileViewsRes.json();
  let profileVisitsValue = 0;
  if (profileViewsData.data?.[0]?.total_value?.value !== undefined) {
    profileVisitsValue = profileViewsData.data[0].total_value.value;
  }

  // Website clicks (yesterday, 24h lag - reuse same date range as profile views)
  const websiteClicksRes = await fetch(`${baseUrl}?metric=website_clicks&period=day&metric_type=total_value&since=${profileViewsSince}&until=${profileViewsUntil}&access_token=${token}`);
  const websiteClicksData = await websiteClicksRes.json();
  let linkClicksValue = 0;
  if (websiteClicksData.data?.[0]?.total_value?.value !== undefined) {
    linkClicksValue = websiteClicksData.data[0].total_value.value;
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
    `${baseUrl}?metric=follows_and_unfollows&metric_type=total_value&period=day&breakdown=follow_type&since=${dayBeforeYesterdayStr}&until=${yesterdayStr}&access_token=${token}`
  );
  const followsData = await followsRes.json();

  let newFollows = 0;
  let unfollows = 0;
  if (followsData.data?.[0]?.total_value?.breakdowns?.[0]?.results) {
    const results = followsData.data[0].total_value.breakdowns[0].results;
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

  // Upsert yesterday's profile visits and link clicks (24h lag)
  const { error: yesterdayMetricsError } = await supabaseAdmin
    .from("PlatformMetrics")
    .upsert(
      {
        connectedAccountId: id,
        date: yesterdayStr,
        profileVisits: profileVisitsValue,
        linkClicks: linkClicksValue,
        createdAt: new Date().toISOString(),
      },
      { onConflict: "connectedAccountId,date" }
    );

  if (yesterdayMetricsError) {
    throw new Error(yesterdayMetricsError.message);
  }

  return { ...metrics, newFollows, unfollows, profileVisits: profileVisitsValue, linkClicks: linkClicksValue };
}
