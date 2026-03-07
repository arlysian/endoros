import { auth, clerkClient } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: user, error } = await supabaseAdmin
    .from("User")
    .select(`
      id,
      firstName,
      lastName,
      userName,
      category,
      email,
      bio,
      website,
      location,
      profileImageUrl,
      coverImageUrl,
      isMediaKitPublic,
      audienceSummary,
      onboardingCompleted,
      emailCta
    `)
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}

export async function DELETE() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const clerk = await clerkClient();
    await clerk.users.deleteUser(userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Only allow updating specific fields
    const allowedFields = [
      "firstName",
      "lastName",
      "userName",
      "category",
      "email",
      "bio",
      "website",
      "location",
      "engagement",
      "avgViews",
      "isMediaKitPublic",
      "audienceSummary",
      "onboardingCompleted",
      "phone",
      "emailCta",
    ];

    const updates: Record<string, string | number | boolean | null> = {};
    for (const field of allowedFields) {
      if (field in body) {
        updates[field] = body[field] ?? null;
      }
    }

    if (typeof updates.userName === "string" && /\s/.test(updates.userName)) {
      return NextResponse.json(
        { error: "Username cannot contain spaces" },
        { status: 400 }
      );
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("User")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating user:", error);
      return NextResponse.json(
        { error: "Failed to update user" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("PATCH error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
