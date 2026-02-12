import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const days = parseInt(request.nextUrl.searchParams.get("days") || "7");
  const validDays = [1, 7, 14, 30].includes(days) ? days : 7;

  // Get connected account
  const { data: account } = await supabaseAdmin
    .from("ConnectedAccount")
    .select("id")
    .eq("userId", userId)
    .eq("platform", "INSTAGRAM")
    .single();

  if (!account) {
    return NextResponse.json({ history: [] });
  }

  // Get last N days of metrics (Meta API has ~48h delay)
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 2);
  const cutoffDate = cutoff.toISOString().split("T")[0];

  const { data: metrics, error } = await supabaseAdmin
    .from("PlatformMetrics")
    .select("date, followers, newFollows, unfollows, profileVisits, linkClicks, likes, comments, shares, saves")
    .eq("connectedAccountId", account.id)
    .lte("date", cutoffDate)
    .order("date", { ascending: false })
    .limit(validDays);

  if (error) {
    console.error("History fetch error:", error);
    return NextResponse.json({ history: [] });
  }

  // Reverse to get chronological order (oldest first)
  const history = (metrics || []).reverse().map((row) => ({
    date: row.date,
    followers: row.followers || 0,
    newFollows: row.newFollows || 0,
    unfollows: row.unfollows || 0,
    profileVisits: row.profileVisits || 0,
    linkClicks: row.linkClicks || 0,
    likes: row.likes || 0,
    comments: row.comments || 0,
    shares: row.shares || 0,
    saves: row.saves || 0,
  }));

  // Calculate totals
  const totalNewFollows = history.reduce((sum, row) => sum + row.newFollows, 0);
  const totalUnfollows = history.reduce((sum, row) => sum + row.unfollows, 0);
  const totalProfileVisits = history.reduce((sum, row) => sum + row.profileVisits, 0);
  const totalLinkClicks = history.reduce((sum, row) => sum + row.linkClicks, 0);
  const totalLikes = history.reduce((sum, row) => sum + row.likes, 0);
  const totalComments = history.reduce((sum, row) => sum + row.comments, 0);
  const totalShares = history.reduce((sum, row) => sum + row.shares, 0);
  const totalSaves = history.reduce((sum, row) => sum + row.saves, 0);

  // Net growth from actual follower count change (more accurate)
  const firstWithFollowers = history.find((row) => row.followers > 0);
  const lastWithFollowers = [...history].reverse().find((row) => row.followers > 0);
  const netGrowth = (firstWithFollowers && lastWithFollowers && firstWithFollowers !== lastWithFollowers)
    ? lastWithFollowers.followers - firstWithFollowers.followers
    : totalNewFollows - totalUnfollows;

  return NextResponse.json({
    history,
    summary: {
      totalNewFollows,
      totalUnfollows,
      netGrowth,
      totalProfileVisits,
      totalLinkClicks,
      totalLikes,
      totalComments,
      totalShares,
      totalSaves,
    },
  });
}
