import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("CreatorRate")
    .select("*")
    .eq("userId", userId)
    .order("platform", { ascending: true });

  if (error) {
    console.error("Error fetching rates:", error);
    return NextResponse.json({ error: "Failed to fetch rates" }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { platform, contentType, price, currency } = body;

    if (!platform || !contentType || price == null) {
      return NextResponse.json(
        { error: "platform, contentType, and price are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("CreatorRate")
      .insert({
        userId,
        platform,
        contentType,
        price,
        currency: currency || "USD",
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating rate:", error);
      return NextResponse.json({ error: "Failed to create rate" }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Rate ID is required" }, { status: 400 });
    }

    const { data: rate } = await supabaseAdmin
      .from("CreatorRate")
      .select("userId")
      .eq("id", id)
      .single();

    if (!rate || rate.userId !== userId) {
      return NextResponse.json({ error: "Rate not found" }, { status: 404 });
    }

    const { error } = await supabaseAdmin
      .from("CreatorRate")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting rate:", error);
      return NextResponse.json({ error: "Failed to delete rate" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
