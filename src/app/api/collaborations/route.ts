import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("Collaboration")
    .select("*")
    .eq("userId", userId)
    .order("date", { ascending: false });

  if (error) {
    console.error("Error fetching collaborations:", error);
    return NextResponse.json({ error: "Failed to fetch collaborations" }, { status: 500 });
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
    const { brand, campaign, date, type } = body;

    if (!brand) {
      return NextResponse.json({ error: "Brand is required" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("Collaboration")
      .insert({
        userId,
        brand,
        campaign: campaign || null,
        date: date || null,
        type: type || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating collaboration:", error);
      return NextResponse.json({ error: "Failed to create collaboration" }, { status: 500 });
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
      return NextResponse.json({ error: "Collaboration ID is required" }, { status: 400 });
    }

    const { data: collaboration } = await supabaseAdmin
      .from("Collaboration")
      .select("userId")
      .eq("id", id)
      .single();

    if (!collaboration || collaboration.userId !== userId) {
      return NextResponse.json({ error: "Collaboration not found" }, { status: 404 });
    }

    const { error } = await supabaseAdmin
      .from("Collaboration")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting collaboration:", error);
      return NextResponse.json({ error: "Failed to delete collaboration" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
