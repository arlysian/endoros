import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";
import { fetchTikTokMetrics } from "@/lib/fetch-tiktok-metrics";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const TIKTOK_CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY;
const TIKTOK_CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET;

export async function GET(request: Request) {
  const { userId } = await auth();
  const url = new URL(request.url);
  const cookieStore = await cookies();

  if (!userId) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Get the authorization code from the callback
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  const errorDescription = url.searchParams.get("error_description");

  if (error) {
    console.error("TikTok OAuth error:", error, errorDescription);
    return NextResponse.redirect(
      new URL(`/social-platforms?error=${encodeURIComponent(errorDescription || error)}`, request.url)
    );
  }

  if (!code) {
    console.error("No code received from TikTok");
    return NextResponse.redirect(
      new URL("/social-platforms?error=No+authorization+code+received", request.url)
    );
  }

  // Get code verifier from cookie (set during authorization)
  const codeVerifier = cookieStore.get("tiktok_code_verifier")?.value;
  if (!codeVerifier) {
    console.error("No code verifier found in cookie");
    return NextResponse.redirect(
      new URL("/social-platforms?error=Session+expired.+Please+try+again.", request.url)
    );
  }

  if (!TIKTOK_CLIENT_KEY || !TIKTOK_CLIENT_SECRET) {
    console.error("TikTok credentials not configured");
    return NextResponse.redirect(
      new URL("/social-platforms?error=TikTok+configuration+error", request.url)
    );
  }

  try {
    const redirectUri = `${url.origin}/api/connect/tiktok/callback`;

    // Exchange authorization code for access token (with PKCE code_verifier)
    const tokenResponse = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_key: TIKTOK_CLIENT_KEY,
        client_secret: TIKTOK_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error || !tokenData.access_token) {
      console.error("Token exchange error:", tokenData);
      return NextResponse.redirect(
        new URL(`/social-platforms?error=${encodeURIComponent(tokenData.error_description || "Failed to get access token")}`, request.url)
      );
    }

    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;
    const expiresIn = tokenData.expires_in || 86400; // Default to 24 hours
    const openId = tokenData.open_id;

    // Fetch user info from TikTok
    const userResponse = await fetch(
      "https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,avatar_url,profile_deep_link,follower_count,following_count,likes_count,video_count",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const userData = await userResponse.json();

    if (userData.error?.code !== "ok" && userData.error) {
      console.error("User info error:", userData);
      return NextResponse.redirect(
        new URL(`/social-platforms?error=${encodeURIComponent(userData.error?.message || "Failed to fetch user info")}`, request.url)
      );
    }

    const userInfo = userData.data?.user;
    if (!userInfo) {
      console.error("No user data received:", userData);
      return NextResponse.redirect(
        new URL("/social-platforms?error=Failed+to+fetch+user+info", request.url)
      );
    }

    // Calculate token expiry
    const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000);

    // Upsert ConnectedAccount
    const { error: dbError } = await supabaseAdmin
      .from("ConnectedAccount")
      .upsert(
        {
          userId,
          platform: "TIKTOK",
          platformUserId: openId,
          username: userInfo.display_name,
          profileLink: userInfo.profile_deep_link,
          accessToken,
          refreshToken,
          tokenExpiresAt: tokenExpiresAt.toISOString(),
          isPrimary: true,
          scopes: ["user.info.basic", "user.info.profile", "user.info.stats", "video.list"],
        },
        {
          onConflict: "userId,platform,platformUserId",
        }
      );

    if (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.redirect(
        new URL("/social-platforms?error=Failed+to+save+account", request.url)
      );
    }

    // Fetch account to get ID for metrics fetch
    const { data: account } = await supabaseAdmin
      .from("ConnectedAccount")
      .select("id")
      .eq("userId", userId)
      .eq("platform", "TIKTOK")
      .single();

    // Fetch metrics immediately (don't wait for cron)
    if (account) {
      fetchTikTokMetrics({
        id: account.id,
        platformUserId: openId,
        accessToken,
      }).catch((err) => console.error("Initial TikTok metrics fetch failed:", err));
    }

    // Redirect back to social platforms page with success and clear the cookie
    const response = NextResponse.redirect(new URL("/social-platforms?connected=tiktok", request.url));
    response.cookies.delete("tiktok_code_verifier");
    return response;
  } catch (err) {
    console.error("TikTok callback error:", err);
    return NextResponse.redirect(
      new URL("/social-platforms?error=Connection+failed", request.url)
    );
  }
}
