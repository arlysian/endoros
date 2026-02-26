import { supabaseAdmin } from "@/lib/supabase";
import { fetchInstagramMetrics, fetchAudienceDemographics } from "@/lib/fetch-instagram-metrics";
import { fetchTikTokMetrics } from "@/lib/fetch-tiktok-metrics";
import { fetchYouTubeMetrics } from "@/lib/fetch-youtube-metrics";
import { fetchFacebookMetrics } from "@/lib/fetch-facebook-metrics";
import { NextResponse } from "next/server";

// Vercel Cron or manual trigger
// Add to vercel.json: { "crons": [{ "path": "/api/cron/fetch-metrics", "schedule": "0 3 * * *" }] }

export const maxDuration = 60;

export async function GET(request: Request) {
  // Optional: Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch all platform accounts in parallel
    const [instagramQuery, tiktokQuery, youtubeQuery, facebookQuery] = await Promise.all([
      supabaseAdmin
        .from("ConnectedAccount")
        .select("id, instagramBusinessId, accessToken")
        .eq("platform", "INSTAGRAM")
        .not("instagramBusinessId", "is", null)
        .not("accessToken", "is", null),
      supabaseAdmin
        .from("ConnectedAccount")
        .select("id, platformUserId, accessToken")
        .eq("platform", "TIKTOK")
        .not("accessToken", "is", null),
      supabaseAdmin
        .from("ConnectedAccount")
        .select("id, platformUserId, accessToken, refreshToken")
        .eq("platform", "YOUTUBE")
        .not("accessToken", "is", null),
      supabaseAdmin
        .from("ConnectedAccount")
        .select("id, pageId, pageAccessToken")
        .eq("platform", "FACEBOOK")
        .not("pageAccessToken", "is", null),
    ]);

    if (instagramQuery.error) console.error("Error fetching Instagram accounts:", instagramQuery.error);
    if (tiktokQuery.error) console.error("Error fetching TikTok accounts:", tiktokQuery.error);
    if (youtubeQuery.error) console.error("Error fetching YouTube accounts:", youtubeQuery.error);
    if (facebookQuery.error) console.error("Error fetching Facebook accounts:", facebookQuery.error);

    // Filter to valid accounts
    const validInstagram = (instagramQuery.data ?? []).filter(
      (acc): acc is { id: string; instagramBusinessId: string; accessToken: string } =>
        acc.instagramBusinessId !== null && acc.accessToken !== null
    );

    const validTiktok = (tiktokQuery.data ?? []).filter(
      (acc): acc is { id: string; platformUserId: string; accessToken: string } =>
        acc.platformUserId !== null && acc.accessToken !== null
    );

    const validYoutube = (youtubeQuery.data ?? []).filter(
      (acc): acc is { id: string; platformUserId: string; accessToken: string; refreshToken: string | null } =>
        acc.platformUserId !== null && acc.accessToken !== null
    );

    const validFacebook = (facebookQuery.data ?? []).filter(
      (acc): acc is { id: string; pageId: string; pageAccessToken: string } =>
        acc.pageId !== null && acc.pageAccessToken !== null
    );

    // Process ALL accounts across ALL platforms in parallel
    const instagramPromises = validInstagram.map(async (account) => {
      try {
        const [metrics] = await Promise.all([
          fetchInstagramMetrics(account),
          fetchAudienceDemographics(account),
        ]);
        return { accountId: account.id, success: true as const, metrics };
      } catch (err) {
        console.error(`Error processing Instagram account ${account.id}:`, err);
        return { accountId: account.id, success: false as const, error: String(err) };
      }
    });

    const tiktokPromises = validTiktok.map(async (account) => {
      try {
        const metrics = await fetchTikTokMetrics(account);
        return { accountId: account.id, success: true as const, metrics };
      } catch (err) {
        console.error(`Error processing TikTok account ${account.id}:`, err);
        return { accountId: account.id, success: false as const, error: String(err) };
      }
    });

    const youtubePromises = validYoutube.map(async (account) => {
      try {
        const metrics = await fetchYouTubeMetrics(account);
        return { accountId: account.id, success: true as const, metrics };
      } catch (err) {
        console.error(`Error processing YouTube account ${account.id}:`, err);
        return { accountId: account.id, success: false as const, error: String(err) };
      }
    });

    const facebookPromises = validFacebook.map(async (account) => {
      try {
        const metrics = await fetchFacebookMetrics(account);
        return { accountId: account.id, success: true as const, metrics };
      } catch (err) {
        console.error(`Error processing Facebook account ${account.id}:`, err);
        return { accountId: account.id, success: false as const, error: String(err) };
      }
    });

    const [instagramResults, tiktokResults, youtubeResults, facebookResults] = await Promise.all([
      Promise.all(instagramPromises),
      Promise.all(tiktokPromises),
      Promise.all(youtubePromises),
      Promise.all(facebookPromises),
    ]);

    return NextResponse.json({
      instagram: { processed: validInstagram.length, results: instagramResults },
      tiktok: { processed: validTiktok.length, results: tiktokResults },
      youtube: { processed: validYoutube.length, results: youtubeResults },
      facebook: { processed: validFacebook.length, results: facebookResults },
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
