import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data } = await supabaseAdmin
    .from("ConnectedAccount")
    .select("platform")
    .eq("userId", userId);

  const platforms = (data || []).map((row) => row.platform);

  return NextResponse.json({
    instagram: platforms.includes("INSTAGRAM"),
    tiktok: platforms.includes("TIKTOK"),
    youtube: platforms.includes("YOUTUBE"),
    facebook: platforms.includes("FACEBOOK"),
  });
}
