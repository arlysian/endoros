import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get connected Instagram account
    const { data: account } = await supabaseAdmin
      .from("ConnectedAccount")
      .select("instagramBusinessId, accessToken, tokenExpiresAt")
      .eq("userId", userId)
      .eq("platform", "INSTAGRAM")
      .single();

    if (!account?.instagramBusinessId || !account?.accessToken) {
      return NextResponse.json(
        { error: "No Instagram account connected" },
        { status: 404 }
      );
    }

    // Check token expiry
    if (account.tokenExpiresAt && new Date(account.tokenExpiresAt) < new Date()) {
      return NextResponse.json(
        { error: "Instagram token expired. Please reconnect your account." },
        { status: 401 }
      );
    }

    // Get pagination cursor
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "25"), 50);
    const after = searchParams.get("after");

    // Fetch recent media from Instagram Graph API
    let url = `https://graph.facebook.com/v24.0/${account.instagramBusinessId}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count&limit=${limit}&access_token=${account.accessToken}`;
    if (after) {
      url += `&after=${after}`;
    }

    const mediaRes = await fetch(url);
    const mediaData = await mediaRes.json();

    if (mediaData.error) {
      console.error("Instagram media fetch error:", mediaData.error);
      return NextResponse.json(
        { error: "Failed to fetch Instagram media" },
        { status: 500 }
      );
    }

    // Get already-pinned media IDs
    const { data: pinnedPosts } = await supabaseAdmin
      .from("PinnedPost")
      .select("igMediaId")
      .eq("userId", userId);

    const pinnedIds = (pinnedPosts || []).map((p: { igMediaId: string }) => p.igMediaId);

    return NextResponse.json({
      media: mediaData.data || [],
      paging: mediaData.paging || null,
      pinnedIds,
    });
  } catch (error) {
    console.error("Instagram media error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
