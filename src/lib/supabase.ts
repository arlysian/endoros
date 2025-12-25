import { createClient } from "@supabase/supabase-js";

// Client for browser (uses publishable key)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

// Admin client for server-side (uses secret key)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

// Storage helpers
export async function uploadImage(
  bucket: "pfp" | "hero",
  userId: string,
  file: File
) {
  const fileExt = file.name.split(".").pop();
  const fileName = `${userId}/${Date.now()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, { upsert: true });

  if (error) throw error;
  return data.path;
}

export function getImageUrl(bucket: "pfp" | "hero", path: string) {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteImage(bucket: "pfp" | "hero", path: string) {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw error;
}
