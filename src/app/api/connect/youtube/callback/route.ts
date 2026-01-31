import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

export async function GET(request: Request) {
  const { userId } = await auth();
  const url = new URL(request.url);
  const cookieStore = await cookies();

  if (!userId) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error) {
    console.error("YouTube OAuth error:", error);
    return NextResponse.redirect(
      new URL(`/social-platforms?error=${encodeURIComponent(error)}`, request.url)
    );
  }

  if (!code) {
    console.error("No code received from Google");
    return NextResponse.redirect(
      new URL("/social-platforms?error=No+authorization+code+received", request.url)
    );
  }

  const codeVerifier = cookieStore.get("youtube_code_verifier")?.value;
  if (!codeVerifier) {
    console.error("No code verifier found in cookie");
    return NextResponse.redirect(
      new URL("/social-platforms?error=Session+expired.+Please+try+again.", request.url)
    );
  }

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    console.error("Google credentials not configured");
    return NextResponse.redirect(
      new URL("/social-platforms?error=YouTube+configuration+error", request.url)
    );
  }

  try {
    const redirectUri = `${url.origin}/api/connect/youtube/callback`;

    // Exchange authorization code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
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
    const expiresIn = tokenData.expires_in || 3600;

    // Fetch YouTube channel info
    const channelResponse = await fetch(
      "https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const channelData = await channelResponse.json();

    if (!channelData.items || channelData.items.length === 0) {
      console.error("No YouTube channel found:", channelData);
      return NextResponse.redirect(
        new URL("/social-platforms?error=No+YouTube+channel+found", request.url)
      );
    }

    const channel = channelData.items[0];
    const channelId = channel.id;
    const channelTitle = channel.snippet?.title;
    const stats = channel.statistics;

    // Calculate token expiry
    const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000);

    // Upsert ConnectedAccount
    const { data: connectedAccount, error: dbError } = await supabaseAdmin
      .from("ConnectedAccount")
      .upsert(
        {
          userId,
          platform: "YOUTUBE",
          platformUserId: channelId,
          username: channelTitle,
          accessToken,
          refreshToken,
          tokenExpiresAt: tokenExpiresAt.toISOString(),
          isPrimary: true,
          scopes: [
            "https://www.googleapis.com/auth/youtube.readonly",
            "https://www.googleapis.com/auth/yt-analytics.readonly",
          ],
        },
        {
          onConflict: "userId,platform,platformUserId",
        }
      )
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.redirect(
        new URL("/social-platforms?error=Failed+to+save+account", request.url)
      );
    }

    // Save initial subscriber count if not hidden
    if (stats && !stats.hiddenSubscriberCount) {
      const todayStr = new Date().toISOString().split("T")[0];
      const { error: metricsError } = await supabaseAdmin
        .from("PlatformMetrics")
        .upsert(
          {
            connectedAccountId: connectedAccount.id,
            date: todayStr,
            followers: parseInt(stats.subscriberCount, 10) || 0,
            videoCount: parseInt(stats.videoCount, 10) || 0,
            createdAt: new Date().toISOString(),
          },
          { onConflict: "connectedAccountId,date" }
        );
      if (metricsError) {
        console.error("Failed to save initial YouTube metrics:", metricsError);
      }
    }

    // Redirect back to social platforms page with success and clear the cookie
    const response = NextResponse.redirect(new URL("/social-platforms?connected=youtube", request.url));
    response.cookies.delete("youtube_code_verifier");
    return response;
  } catch (err) {
    console.error("YouTube callback error:", err);
    return NextResponse.redirect(
      new URL("/social-platforms?error=Connection+failed", request.url)
    );
  }
}
