import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const days = parseInt(request.nextUrl.searchParams.get("days") || "7");
  const validDays = [7, 30].includes(days) ? days : 7;

  const { data: account } = await supabaseAdmin
    .from("ConnectedAccount")
    .select("id")
    .eq("userId", userId)
    .eq("platform", "YOUTUBE")
    .single();

  if (!account) {
    return NextResponse.json({ history: [] });
  }

  const { data: metrics, error } = await supabaseAdmin
    .from("PlatformMetrics")
    .select("date, followers")
    .eq("connectedAccountId", account.id)
    .order("date", { ascending: false })
    .limit(validDays);

  if (error) {
    console.error("YouTube history fetch error:", error);
    return NextResponse.json({ history: [] });
  }

  const history = (metrics || []).reverse().map((row) => ({
    date: row.date,
    followers: row.followers || 0,
  }));

  const firstWithFollowers = history.find((row) => row.followers > 0);
  const lastWithFollowers = [...history].reverse().find((row) => row.followers > 0);
  const netGrowth = (firstWithFollowers && lastWithFollowers && firstWithFollowers !== lastWithFollowers)
    ? lastWithFollowers.followers - firstWithFollowers.followers
    : 0;

  return NextResponse.json({
    history,
    summary: {
      netGrowth,
    },
  });
}
