import { supabaseAdmin } from "@/lib/supabase";
import { NextResponse } from "next/server";

// Vercel Cron or manual trigger
// Add to vercel.json: { "crons": [{ "path": "/api/cron/fetch-metrics", "schedule": "0 3 * * *" }] }

export async function GET(request: Request) {
  // Optional: Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get all connected Instagram accounts
    const { data: accounts, error: accountsError } = await supabaseAdmin
      .from("ConnectedAccount")
      .select("id, instagramBusinessId, accessToken")
      .eq("platform", "INSTAGRAM")
      .not("instagramBusinessId", "is", null)
      .not("accessToken", "is", null);

    if (accountsError) {
      console.error("Error fetching accounts:", accountsError);
      return NextResponse.json({ error: "Failed to fetch accounts" }, { status: 500 });
    }

    if (!accounts || accounts.length === 0) {
      return NextResponse.json({ message: "No accounts to process" });
    }

    const results = [];

    for (const account of accounts) {
      try {
        // 1. Fetch profile (followers, username) - real-time data
        const profileResponse = await fetch(
          `https://graph.facebook.com/v24.0/${account.instagramBusinessId}?fields=followers_count,username,profile_picture_url&access_token=${account.accessToken}`
        );
        const profileData = await profileResponse.json();

        if (profileData.error) {
          console.error(`Error fetching profile for ${account.id}:`, profileData.error);
          results.push({ accountId: account.id, success: false, error: profileData.error.message });
          continue;
        }

        // 2. Fetch each metric separately
        const baseUrl = `https://graph.facebook.com/v24.0/${account.instagramBusinessId}/insights`;
        const token = account.accessToken;

        const metrics: Record<string, number> = {
          followers: profileData.followers_count ?? 0,
        };

        // Reach
        const reachRes = await fetch(`${baseUrl}?metric=reach&metric_type=total_value&period=day&access_token=${token}`);
        const reachData = await reachRes.json();
        if (reachData.data?.[0]?.total_value?.value) {
          metrics.reach = reachData.data[0].total_value.value;
        }

        // Profile views
        const profileViewsRes = await fetch(`${baseUrl}?metric=profile_views&metric_type=total_value&period=day&access_token=${token}`);
        const profileViewsData = await profileViewsRes.json();
        if (profileViewsData.data?.[0]?.total_value?.value) {
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

        // Update username on ConnectedAccount if changed
        if (profileData.username) {
          await supabaseAdmin
            .from("ConnectedAccount")
            .update({ username: profileData.username, updatedAt: new Date().toISOString() })
            .eq("id", account.id);
        }

        // Upsert into PlatformMetrics
        const today = new Date().toISOString().split("T")[0];

        const { error: upsertError } = await supabaseAdmin
          .from("PlatformMetrics")
          .upsert(
            {
              connectedAccountId: account.id,
              date: today,
              ...metrics,
              createdAt: new Date().toISOString(),
            },
            { onConflict: "connectedAccountId,date" }
          );

        if (upsertError) {
          console.error(`Error upserting metrics for ${account.id}:`, upsertError);
          results.push({ accountId: account.id, success: false, error: upsertError.message });
          continue;
        }

        results.push({ accountId: account.id, success: true, metrics });
      } catch (err) {
        console.error(`Error processing account ${account.id}:`, err);
        results.push({ accountId: account.id, success: false, error: String(err) });
      }
    }

    return NextResponse.json({
      processed: accounts.length,
      results,
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

