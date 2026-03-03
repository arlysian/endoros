import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";
import { NextResponse } from "next/server";

export const revalidate = 60; // Cache for 1 minute

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get the user's Instagram connected account
  const { data: account, error: accountError } = await supabaseAdmin
    .from("ConnectedAccount")
    .select("id")
    .eq("userId", userId)
    .eq("platform", "INSTAGRAM")
    .single();

  if (accountError || !account) {
    return NextResponse.json({ error: "No Instagram account connected" }, { status: 404 });
  }

  // Get the latest metrics for this account
  const { data: metrics, error: metricsError } = await supabaseAdmin
    .from("PlatformMetrics")
    .select("*")
    .eq("connectedAccountId", account.id)
    .order("date", { ascending: false })
    .limit(1)
    .single();

  if (metricsError || !metrics) {
    return NextResponse.json(
      { metrics: null, message: "No metrics data yet. Metrics will be available after the next sync." },
      { headers: { "Cache-Control": "private, max-age=60" } }
    );
  }

  // Calculate 30-day engagement rate from daily aggregates
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 32);
  const { data: last30 } = await supabaseAdmin
    .from("PlatformMetrics")
    .select("likes, comments, shares, saves")
    .eq("connectedAccountId", account.id)
    .gte("date", thirtyDaysAgo.toISOString().split("T")[0])
    .order("date", { ascending: false })
    .limit(30);

  if (last30 && last30.length > 0 && metrics.followers && metrics.followers > 0) {
    const totalEngagement = last30.reduce(
      (sum, row) => sum + (row.likes || 0) + (row.comments || 0) + (row.shares || 0) + (row.saves || 0),
      0
    );
    metrics.engagementRate = Math.round((totalEngagement / (last30.length * metrics.followers)) * 10000) / 100;
  }

  return NextResponse.json(
    { metrics },
    { headers: { "Cache-Control": "private, max-age=60" } }
  );
}
