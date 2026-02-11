import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";
import { fetchInstagramMetrics, fetchAudienceDemographics, backfillFollowerHistory, backfillProfileVisits, backfillLinkClicks, backfillEngagement } from "@/lib/fetch-instagram-metrics";
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
    .eq("platform", "INSTAGRAM")
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
    .eq("platform", "INSTAGRAM");

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

    console.log("Short-lived token:", shortLivedToken);

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

    console.log("Long-lived token:", longLivedToken);
    console.log("Expires in:", expiresIn, "seconds");

    // 2. Get Facebook Pages the user manages
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v24.0/me/accounts?access_token=${longLivedToken}`
    );
    const pagesData = await pagesResponse.json();

    console.log("Pages response:", JSON.stringify(pagesData, null, 2));

    if (pagesData.error || !pagesData.data?.length) {
      console.error("Pages error:", pagesData.error || "No pages found", pagesData);
      return NextResponse.json({ error: "No Facebook Pages found. You need a Facebook Page connected to an Instagram Business account." }, { status: 400 });
    }

    // 3. Find Instagram Business Account across ALL pages
    let igAccountId: string | null = null;
    let selectedPage: { id: string; access_token: string } | null = null;

    for (const page of pagesData.data) {
      const igAccountResponse = await fetch(
        `https://graph.facebook.com/v24.0/${page.id}?fields=instagram_business_account&access_token=${longLivedToken}`
      );
      const igAccountData = await igAccountResponse.json();

      if (igAccountData.instagram_business_account?.id) {
        igAccountId = igAccountData.instagram_business_account.id;
        selectedPage = page;
        break;
      }
    }

    if (!igAccountId || !selectedPage) {
      console.error("No IG business account found on any page");
      return NextResponse.json({ error: "No Instagram Business account linked to any of your Facebook Pages." }, { status: 400 });
    }

    // 4. Get Instagram account details
    const igDetailsResponse = await fetch(
      `https://graph.facebook.com/v24.0/${igAccountId}?fields=id,username,followers_count,profile_picture_url&access_token=${longLivedToken}`
    );
    const igDetails = await igDetailsResponse.json();

    if (igDetails.error) {
      console.error("IG details error:", igDetails.error);
      return NextResponse.json({ error: "Failed to fetch Instagram account details" }, { status: 400 });
    }

    // 5. Calculate token expiry
    const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000);

    // 6. Upsert ConnectedAccount
    const { data, error } = await supabaseAdmin
      .from("ConnectedAccount")
      .upsert(
        {
          userId,
          platform: "INSTAGRAM",
          platformUserId: igAccountId,
          username: igDetails.username,
          accessToken: longLivedToken,
          tokenExpiresAt: tokenExpiresAt.toISOString(),
          isPrimary: true,
          pageId: selectedPage.id,
          instagramBusinessId: igAccountId,
          scopes: ["instagram_basic", "pages_read_engagement", "instagram_manage_insights", "pages_show_list", "business_management"],
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

    const accountData = {
      id: data.id,
      instagramBusinessId: igAccountId,
      accessToken: longLivedToken,
    };

    // Fetch metrics and backfill history
    try {
      await Promise.all([
        fetchInstagramMetrics(accountData),
        fetchAudienceDemographics(accountData),
        backfillFollowerHistory(accountData),
        backfillProfileVisits(accountData),
        backfillLinkClicks(accountData),
        backfillEngagement(accountData),
      ]);
    } catch (err) {
      console.error("Initial metrics/backfill error:", err);
    }

    return NextResponse.json({
      success: true,
      account: {
        username: igDetails.username,
      },
    });
  } catch (error) {
    console.error("Connect Instagram error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
