import { supabaseAdmin } from "@/lib/supabase";
import { fetchInstagramMetrics } from "@/lib/fetch-instagram-metrics";
import { NextResponse } from "next/server";

// Vercel Cron or manual trigger
// Add to vercel.json: { "crons": [{ "path": "/api/cron/fetch-metrics", "schedule": "0 3 * * *" }] }

export async function GET(request: Request) {
  // Optional: Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get all connected Instagram accounts
    const { data: accounts, error: accountsError } = await supabaseAdmin
      .from("ConnectedAccount")
      .select("id, instagramBusinessId, accessToken")
      .eq("platform", "INSTAGRAM")
      .not("instagramBusinessId", "is", null)
      .not("accessToken", "is", null);

    if (accountsError) {
      console.error("Error fetching accounts:", accountsError);
      return NextResponse.json({ error: "Failed to fetch accounts" }, { status: 500 });
    }

    if (!accounts || accounts.length === 0) {
      return NextResponse.json({ message: "No accounts to process" });
    }

    // Filter to only accounts with valid credentials (TypeScript narrowing)
    const validAccounts = accounts.filter(
      (acc): acc is { id: string; instagramBusinessId: string; accessToken: string } =>
        acc.instagramBusinessId !== null && acc.accessToken !== null
    );

    const results = [];

    for (const account of validAccounts) {
      try {
        const metrics = await fetchInstagramMetrics(account);
        results.push({ accountId: account.id, success: true, metrics });
      } catch (err) {
        console.error(`Error processing account ${account.id}:`, err);
        results.push({ accountId: account.id, success: false, error: String(err) });
      }
    }

    return NextResponse.json({
      processed: validAccounts.length,
      results,
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
