import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("ConnectedAccount")
    .select("username")
    .eq("userId", userId)
    .eq("platform", "TIKTOK")
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
    .eq("platform", "TIKTOK");

  if (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: "Failed to disconnect" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
