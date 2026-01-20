import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";
import { NextResponse } from "next/server";

export const revalidate = 60; // Cache for 1 minute

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get the user's TikTok connected account
  const { data: account, error: accountError } = await supabaseAdmin
    .from("ConnectedAccount")
    .select("id")
    .eq("userId", userId)
    .eq("platform", "TIKTOK")
    .single();

  if (accountError || !account) {
    return NextResponse.json({ error: "No TikTok account connected" }, { status: 404 });
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

  return NextResponse.json(
    { metrics },
    { headers: { "Cache-Control": "private, max-age=60" } }
  );
}
