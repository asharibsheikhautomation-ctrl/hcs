import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const DEFAULT_STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "media";

function sanitizePathSegment(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 64);
}

function resolveExtension(file: File) {
  const fromName = file.name.split(".").pop()?.toLowerCase();

  if (fromName && /^[a-z0-9]+$/.test(fromName)) {
    return fromName;
  }

  const typeMap: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/svg+xml": "svg",
    "image/avif": "avif",
  };

  return typeMap[file.type] ?? "jpg";
}

export interface UploadAdminImageOptions {
  file: File;
  folder: "categories" | "products" | "deals";
  slugSource: string;
}

export async function uploadAdminImage({
  file,
  folder,
  slugSource,
}: UploadAdminImageOptions) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please upload an image file.");
  }

  const supabase = createSupabaseAdminClient();
  const extension = resolveExtension(file);
  const path = `${folder}/${Date.now()}-${crypto.randomUUID()}-${sanitizePathSegment(
    slugSource || file.name,
  )}.${extension}`;

  const { error } = await supabase.storage.from(DEFAULT_STORAGE_BUCKET).upload(path, file, {
    cacheControl: "3600",
    contentType: file.type || `image/${extension}`,
    upsert: false,
  });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage
    .from(DEFAULT_STORAGE_BUCKET)
    .getPublicUrl(path);

  return data.publicUrl;
}
