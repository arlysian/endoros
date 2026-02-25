import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

const RESERVED_USERNAMES = ["example"];

export async function GET(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const userName = searchParams.get("userName");

  if (!userName) {
    return NextResponse.json({ error: "Username required" }, { status: 400 });
  }

  // Block reserved usernames
  if (RESERVED_USERNAMES.includes(userName.toLowerCase())) {
    return NextResponse.json({ available: false, taken: true });
  }

  try {
    // Check if username exists for a different user
    const { data, error } = await supabaseAdmin
      .from("User")
      .select("id")
      .eq("userName", userName)
      .neq("id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows returned (username available)
      console.error("Error checking username:", error);
      return NextResponse.json({ error: "Failed to check username" }, { status: 500 });
    }

    const isTaken = !!data;

    return NextResponse.json({ available: !isTaken, taken: isTaken });
  } catch (error) {
    console.error("Check username error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
