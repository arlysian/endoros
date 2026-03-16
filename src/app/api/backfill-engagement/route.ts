import { supabaseAdmin } from "@/lib/supabase";
import { backfillEngagement } from "@/lib/fetch-instagram-metrics";
import { NextResponse } from "next/server";

export const maxDuration = 300;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: accounts, error } = await supabaseAdmin
    .from("ConnectedAccount")
    .select("id, instagramBusinessId, accessToken")
    .eq("platform", "INSTAGRAM")
    .not("instagramBusinessId", "is", null)
    .not("accessToken", "is", null);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const results = [];
  for (const acc of accounts ?? []) {
    if (!acc.instagramBusinessId || !acc.accessToken) continue;
    try {
      await backfillEngagement({
        id: acc.id,
        instagramBusinessId: acc.instagramBusinessId,
        accessToken: acc.accessToken,
      });
      results.push({ id: acc.id, success: true });
    } catch (err) {
      console.error(`Backfill failed for ${acc.id}:`, err);
      results.push({ id: acc.id, success: false, error: String(err) });
    }
  }

  return NextResponse.json({ processed: results.length, results });
}
