import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("Achievement")
    .select("*")
    .eq("userId", userId)
    .order("date", { ascending: false });

  if (error) {
    console.error("Error fetching achievements:", error);
    return NextResponse.json({ error: "Failed to fetch achievements" }, { status: 500 });
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
    const { title, description, date, category } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("Achievement")
      .insert({
        userId,
        title,
        description: description || null,
        date: date || null,
        category: category || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating achievement:", error);
      return NextResponse.json({ error: "Failed to create achievement" }, { status: 500 });
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
      return NextResponse.json({ error: "Achievement ID is required" }, { status: 400 });
    }

    // Verify ownership before deleting
    const { data: achievement } = await supabaseAdmin
      .from("Achievement")
      .select("userId")
      .eq("id", id)
      .single();

    if (!achievement || achievement.userId !== userId) {
      return NextResponse.json({ error: "Achievement not found" }, { status: 404 });
    }

    const { error } = await supabaseAdmin
      .from("Achievement")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting achievement:", error);
      return NextResponse.json({ error: "Failed to delete achievement" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
