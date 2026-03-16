import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

const MAX_PINNED_POSTS = 6;

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("PinnedPost")
    .select("*")
    .eq("userId", userId)
    .order("displayOrder", { ascending: true });

  if (error) {
    console.error("Error fetching pinned posts:", error);
    return NextResponse.json({ error: "Failed to fetch pinned posts" }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { igMediaId } = await request.json();

    if (!igMediaId) {
      return NextResponse.json({ error: "igMediaId is required" }, { status: 400 });
    }

    // Get connected Instagram account
    const { data: account } = await supabaseAdmin
      .from("ConnectedAccount")
      .select("id, instagramBusinessId, accessToken")
      .eq("userId", userId)
      .eq("platform", "INSTAGRAM")
      .single();

    if (!account?.accessToken) {
      return NextResponse.json({ error: "No Instagram account connected" }, { status: 404 });
    }

    // Check pin limit
    const { count } = await supabaseAdmin
      .from("PinnedPost")
      .select("id", { count: "exact", head: true })
      .eq("userId", userId);

    if ((count || 0) >= MAX_PINNED_POSTS) {
      return NextResponse.json(
        { error: `Maximum ${MAX_PINNED_POSTS} pinned posts allowed` },
        { status: 400 }
      );
    }

    // Check if already pinned
    const { data: existing } = await supabaseAdmin
      .from("PinnedPost")
      .select("id")
      .eq("userId", userId)
      .eq("igMediaId", igMediaId)
      .single();

    if (existing) {
      return NextResponse.json({ error: "Post already pinned" }, { status: 409 });
    }

    // Fetch post details from Instagram
    const mediaRes = await fetch(
      `https://graph.facebook.com/v24.0/${igMediaId}?fields=id,caption,media_type,media_url,thumbnail_url,permalink,like_count,comments_count`,
      { headers: { Authorization: `Bearer ${account.accessToken}` } }
    );
    const mediaData = await mediaRes.json();

    if (mediaData.error) {
      console.error("Instagram media fetch error:", mediaData.error);
      return NextResponse.json({ error: "Failed to fetch post from Instagram" }, { status: 500 });
    }

    // Determine which URL to download (thumbnail for video, media_url for images)
    const imageSource =
      mediaData.media_type === "VIDEO"
        ? mediaData.thumbnail_url
        : mediaData.media_url;

    if (!imageSource) {
      return NextResponse.json({ error: "No image available for this post" }, { status: 400 });
    }

    // Download image from Instagram CDN
    const imageRes = await fetch(imageSource);
    if (!imageRes.ok) {
      return NextResponse.json({ error: "Failed to download image" }, { status: 500 });
    }

    const imageBuffer = new Uint8Array(await imageRes.arrayBuffer());
    const contentType = imageRes.headers.get("content-type") || "image/jpeg";
    const ext = contentType.includes("png") ? "png" : "jpg";
    const storagePath = `${userId}/${igMediaId}.${ext}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabaseAdmin.storage
      .from("portfolio")
      .upload(storagePath, imageBuffer, {
        contentType,
        upsert: true,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json({ error: "Failed to store image" }, { status: 500 });
    }

    // Get permanent public URL
    const { data: urlData } = supabaseAdmin.storage
      .from("portfolio")
      .getPublicUrl(storagePath);

    // Get next display order
    const { data: maxOrderRow } = await supabaseAdmin
      .from("PinnedPost")
      .select("displayOrder")
      .eq("userId", userId)
      .order("displayOrder", { ascending: false })
      .limit(1)
      .single();

    const nextOrder = (maxOrderRow?.displayOrder ?? -1) + 1;

    // Insert pinned post
    const { data, error } = await supabaseAdmin
      .from("PinnedPost")
      .insert({
        userId,
        connectedAccountId: account.id,
        igMediaId: mediaData.id,
        mediaType: mediaData.media_type,
        imageUrl: urlData.publicUrl,
        permalink: mediaData.permalink,
        caption: mediaData.caption || null,
        likeCount: mediaData.like_count || 0,
        commentsCount: mediaData.comments_count || 0,
        displayOrder: nextOrder,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating pinned post:", error);
      return NextResponse.json({ error: "Failed to pin post" }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("POST pinned post error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Pinned post ID is required" }, { status: 400 });
    }

    // Verify ownership and get image path
    const { data: post } = await supabaseAdmin
      .from("PinnedPost")
      .select("userId, imageUrl")
      .eq("id", id)
      .single();

    if (!post || post.userId !== userId) {
      return NextResponse.json({ error: "Pinned post not found" }, { status: 404 });
    }

    // Delete from storage
    const match = post.imageUrl.match(/portfolio\/(.+)$/);
    if (match) {
      await supabaseAdmin.storage.from("portfolio").remove([match[1]]);
    }

    // Delete from database
    const { error } = await supabaseAdmin
      .from("PinnedPost")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting pinned post:", error);
      return NextResponse.json({ error: "Failed to unpin post" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE pinned post error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { reorder } = await request.json();

    if (!reorder || !Array.isArray(reorder)) {
      return NextResponse.json({ error: "reorder array is required" }, { status: 400 });
    }

    // Update display order for each post
    for (const item of reorder) {
      const { error } = await supabaseAdmin
        .from("PinnedPost")
        .update({ displayOrder: item.displayOrder, updatedAt: new Date().toISOString() })
        .eq("id", item.id)
        .eq("userId", userId);

      if (error) {
        console.error("Error reordering pinned post:", error);
        return NextResponse.json({ error: "Failed to reorder" }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH pinned post error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
