import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

export async function POST(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { mood, message } = await request.json();

  if (!mood || typeof mood !== "string") {
    return NextResponse.json({ error: "Mood is required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("Feedback")
    .insert({
      userId,
      mood,
      message: message?.trim() || null,
    });

  if (error) {
    console.error("Failed to save feedback:", error);
    return NextResponse.json({ error: "Failed to save feedback" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
