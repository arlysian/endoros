import { supabaseAdmin } from "@/lib/supabase";
import { NextResponse } from "next/server";

const TIKTOK_CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY;
const TIKTOK_CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET;

export const maxDuration = 60;

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!TIKTOK_CLIENT_KEY || !TIKTOK_CLIENT_SECRET) {
    return NextResponse.json({ error: "TikTok credentials not configured" }, { status: 500 });
  }

  try {
    // Get all TikTok accounts with refresh tokens
    const { data: accounts, error: accountsError } = await supabaseAdmin
      .from("ConnectedAccount")
      .select("id, userId, platformUserId, refreshToken, tokenExpiresAt")
      .eq("platform", "TIKTOK")
      .not("refreshToken", "is", null);

    if (accountsError) {
      console.error("Error fetching TikTok accounts:", accountsError);
      return NextResponse.json({ error: "Failed to fetch accounts" }, { status: 500 });
    }

    if (!accounts || accounts.length === 0) {
      return NextResponse.json({ message: "No TikTok accounts to refresh" });
    }

    const results = [];

    for (const account of accounts) {
      if (!account.refreshToken) continue;

      try {
        // Refresh the token
        const tokenResponse = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            client_key: TIKTOK_CLIENT_KEY,
            client_secret: TIKTOK_CLIENT_SECRET,
            grant_type: "refresh_token",
            refresh_token: account.refreshToken,
          }),
        });

        const tokenData = await tokenResponse.json();

        if (tokenData.error || !tokenData.access_token) {
          console.error(`Token refresh error for account ${account.id}:`, tokenData);
          results.push({
            accountId: account.id,
            success: false,
            error: tokenData.error_description || tokenData.error || "Unknown error",
          });
          continue;
        }

        const accessToken = tokenData.access_token;
        // TikTok may return a new refresh token or keep the same one
        const refreshToken = tokenData.refresh_token || account.refreshToken;
        const expiresIn = tokenData.expires_in || 86400;
        const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000);

        // Update the account with new tokens
        const { error: updateError } = await supabaseAdmin
          .from("ConnectedAccount")
          .update({
            accessToken,
            refreshToken,
            tokenExpiresAt: tokenExpiresAt.toISOString(),
            updatedAt: new Date().toISOString(),
          })
          .eq("id", account.id);

        if (updateError) {
          console.error(`Database update error for account ${account.id}:`, updateError);
          results.push({ accountId: account.id, success: false, error: "Database update failed" });
          continue;
        }

        results.push({
          accountId: account.id,
          success: true,
          refreshTokenChanged: refreshToken !== account.refreshToken,
        });
      } catch (err) {
        console.error(`Error refreshing account ${account.id}:`, err);
        results.push({ accountId: account.id, success: false, error: String(err) });
      }
    }

    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    return NextResponse.json({
      processed: accounts.length,
      successful,
      failed,
      results,
    });
  } catch (error) {
    console.error("TikTok token refresh cron error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
