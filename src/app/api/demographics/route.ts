import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: account } = await supabaseAdmin
    .from("ConnectedAccount")
    .select("id")
    .eq("userId", userId)
    .eq("platform", "INSTAGRAM")
    .single();

  if (!account) {
    return NextResponse.json({ demographics: [] });
  }

  const { data: demographics, error } = await supabaseAdmin
    .from("AudienceDemographics")
    .select("type, label, value")
    .eq("connectedAccountId", account.id);

  if (error) {
    console.error("Error fetching demographics:", error);
    return NextResponse.json({ demographics: [] });
  }

  return NextResponse.json({ demographics: demographics || [] });
}
