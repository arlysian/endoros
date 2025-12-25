import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as "pfp" | "hero" | null;

    if (!file || !type) {
      return NextResponse.json(
        { error: "File and type are required" },
        { status: 400 }
      );
    }

    if (!["pfp", "hero"].includes(type)) {
      return NextResponse.json(
        { error: "Type must be 'pfp' or 'hero'" },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "File must be JPEG, PNG, or WebP" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 }
      );
    }

    // Get current user to find existing image path
    const { data: currentUser } = await supabaseAdmin
      .from("User")
      .select("profileImageUrl, coverImageUrl")
      .eq("id", userId)
      .single();

    const columnName = type === "pfp" ? "profileImageUrl" : "coverImageUrl";
    const oldUrl = currentUser?.[columnName];

    // Delete old image if exists
    if (oldUrl) {
      const oldPath = extractPathFromUrl(oldUrl, type);
      if (oldPath) {
        await supabaseAdmin.storage.from(type).remove([oldPath]);
      }
    }

    // Upload new image
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const { error: uploadError } = await supabaseAdmin.storage
      .from(type)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload image" },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from(type)
      .getPublicUrl(fileName);

    const publicUrl = urlData.publicUrl;

    // Update user record
    const { error: updateError } = await supabaseAdmin
      .from("User")
      .update({ [columnName]: publicUrl })
      .eq("id", userId);

    if (updateError) {
      console.error("Update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update user" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error("Image upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { type } = await request.json();

    if (!type || !["pfp", "hero"].includes(type)) {
      return NextResponse.json(
        { error: "Type must be 'pfp' or 'hero'" },
        { status: 400 }
      );
    }

    const columnName = type === "pfp" ? "profileImageUrl" : "coverImageUrl";

    // Get current URL
    const { data: currentUser } = await supabaseAdmin
      .from("User")
      .select("profileImageUrl, coverImageUrl")
      .eq("id", userId)
      .single();

    const currentUrl = currentUser?.[columnName as keyof typeof currentUser];

    if (currentUrl) {
      const path = extractPathFromUrl(currentUrl, type);
      if (path) {
        await supabaseAdmin.storage.from(type).remove([path]);
      }
    }

    // Clear URL in database
    const { error: updateError } = await supabaseAdmin
      .from("User")
      .update({ [columnName]: null })
      .eq("id", userId);

    if (updateError) {
      console.error("Update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update user" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Image delete error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function extractPathFromUrl(url: string, bucket: string): string | null {
  try {
    const match = url.match(new RegExp(`${bucket}/(.+)$`));
    return match ? match[1] : null;
  } catch {
    return null;
  }
}
