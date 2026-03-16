import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";
import { fetchFacebookMetrics } from "@/lib/fetch-facebook-metrics";
import { NextRequest, NextResponse } from "next/server";

const FACEBOOK_APP_ID = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("ConnectedAccount")
    .select("username")
    .eq("userId", userId)
    .eq("platform", "FACEBOOK")
    .single();

  if (error || !data) {
    return NextResponse.json({ account: null });
  }

  return NextResponse.json({ account: data });
}

export async function DELETE() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabaseAdmin
    .from("ConnectedAccount")
    .delete()
    .eq("userId", userId)
    .eq("platform", "FACEBOOK");

  if (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: "Failed to disconnect" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { accessToken: shortLivedToken } = await request.json();

    if (!shortLivedToken) {
      return NextResponse.json({ error: "Access token required" }, { status: 400 });
    }

    // 1. Exchange short-lived token for long-lived token
    const tokenExchangeUrl = `https://graph.facebook.com/v24.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${FACEBOOK_APP_ID}&client_secret=${FACEBOOK_APP_SECRET}&fb_exchange_token=${shortLivedToken}`;
    const tokenResponse = await fetch(tokenExchangeUrl);
    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error("Token exchange error:", tokenData.error);
      return NextResponse.json({ error: "Failed to exchange token" }, { status: 400 });
    }

    const longLivedToken = tokenData.access_token;
    const expiresIn = tokenData.expires_in || 60 * 24 * 60 * 60;

    // 2. Get Facebook Pages the user manages
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v24.0/me/accounts?fields=id,name,access_token,fan_count,picture`,
      { headers: { Authorization: `Bearer ${longLivedToken}` } }
    );
    const pagesData = await pagesResponse.json();

    if (pagesData.error || !pagesData.data?.length) {
      console.error("Pages error:", pagesData.error || "No pages found");
      return NextResponse.json({ error: "No Facebook Pages found. You need at least one published Facebook Page." }, { status: 400 });
    }

    // Use the first page (or primary page)
    const page = pagesData.data[0];

    // 3. Calculate token expiry
    const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000);

    // 4. Upsert ConnectedAccount
    const { data, error } = await supabaseAdmin
      .from("ConnectedAccount")
      .upsert(
        {
          userId,
          platform: "FACEBOOK",
          platformUserId: page.id,
          username: page.name,
          accessToken: longLivedToken,
          pageAccessToken: page.access_token,
          tokenExpiresAt: tokenExpiresAt.toISOString(),
          isPrimary: true,
          pageId: page.id,
          scopes: ["pages_show_list", "pages_read_engagement", "read_insights"],
        },
        {
          onConflict: "userId,platform,platformUserId",
        }
      )
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json({ error: "Failed to save account" }, { status: 500 });
    }

    // Fetch initial metrics (follower count)
    try {
      await fetchFacebookMetrics({
        id: data.id,
        pageId: page.id,
        pageAccessToken: page.access_token,
      });
    } catch (metricsErr) {
      console.error("Failed to fetch initial Facebook metrics:", metricsErr);
    }

    return NextResponse.json({
      success: true,
      account: {
        username: page.name,
      },
    });
  } catch (error) {
    console.error("Connect Facebook error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
