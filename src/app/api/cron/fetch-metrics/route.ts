import { supabaseAdmin } from "@/lib/supabase";
import { fetchInstagramMetrics } from "@/lib/fetch-instagram-metrics";
import { fetchTikTokMetrics } from "@/lib/fetch-tiktok-metrics";
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

    // Filter to only accounts with valid credentials (TypeScript narrowing)
    const validAccounts = accounts.filter(
      (acc): acc is { id: string; instagramBusinessId: string; accessToken: string } =>
        acc.instagramBusinessId !== null && acc.accessToken !== null
    );

    const instagramResults = [];

    for (const account of validAccounts) {
      try {
        const metrics = await fetchInstagramMetrics(account);
        instagramResults.push({ accountId: account.id, success: true, metrics });
      } catch (err) {
        console.error(`Error processing Instagram account ${account.id}:`, err);
        instagramResults.push({ accountId: account.id, success: false, error: String(err) });
      }
    }

    // Get all TikTok accounts
    const { data: tiktokAccounts, error: tiktokError } = await supabaseAdmin
      .from("ConnectedAccount")
      .select("id, platformUserId, accessToken")
      .eq("platform", "TIKTOK")
      .not("accessToken", "is", null);

    if (tiktokError) {
      console.error("Error fetching TikTok accounts:", tiktokError);
    }

    const tiktokResults = [];

    if (tiktokAccounts) {
      const validTiktokAccounts = tiktokAccounts.filter(
        (acc): acc is { id: string; platformUserId: string; accessToken: string } =>
          acc.platformUserId !== null && acc.accessToken !== null
      );

      for (const account of validTiktokAccounts) {
        try {
          const metrics = await fetchTikTokMetrics(account);
          tiktokResults.push({ accountId: account.id, success: true, metrics });
        } catch (err) {
          console.error(`Error processing TikTok account ${account.id}:`, err);
          tiktokResults.push({ accountId: account.id, success: false, error: String(err) });
        }
      }
    }

    return NextResponse.json({
      instagram: { processed: validAccounts.length, results: instagramResults },
      tiktok: { processed: tiktokResults.length, results: tiktokResults },
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
