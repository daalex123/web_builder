import fs from "fs";
import path from "path";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/server";
import { getUploadDir } from "@/lib/utils";
import { getUploadSubdir } from "@/lib/upload";

export const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET ?? "media";

export function storagePathFromUrl(url: string): string | null {
  const publicMarker = `/object/public/${STORAGE_BUCKET}/`;
  const idx = url.indexOf(publicMarker);
  if (idx >= 0) return decodeURIComponent(url.slice(idx + publicMarker.length));

  const signedMarker = `/object/sign/${STORAGE_BUCKET}/`;
  const signedIdx = url.indexOf(signedMarker);
  if (signedIdx >= 0) {
    const rest = url.slice(signedIdx + signedMarker.length);
    return decodeURIComponent(rest.split("?")[0] ?? "");
  }

  return null;
}

export function getStoragePublicUrl(storagePath: string): string {
  const { data } = getSupabaseAdmin().storage.from(STORAGE_BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

function safeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9.-]/g, "_");
}

export type UploadedMediaFile = {
  storagePath: string;
  publicUrl: string;
};

export async function uploadMediaFile(
  file: File,
  subdir = getUploadSubdir(),
): Promise<UploadedMediaFile> {
  if (isSupabaseConfigured()) {
    const filename = `${Date.now()}-${safeFilename(file.name)}`;
    const storagePath = `${subdir}/${filename}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error } = await getSupabaseAdmin()
      .storage.from(STORAGE_BUCKET)
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      throw new Error(`Supabase upload failed: ${error.message}`);
    }

    return { storagePath, publicUrl: getStoragePublicUrl(storagePath) };
  }

  if (process.env.VERCEL === "1") {
    throw new Error(
      "Supabase storage is required on Vercel. Set SUPABASE_SERVICE_ROLE_KEY and related env vars.",
    );
  }

  const uploadDir = getUploadDir();
  const targetDir = path.join(uploadDir, subdir);
  fs.mkdirSync(targetDir, { recursive: true });

  const filename = `${Date.now()}-${safeFilename(file.name)}`;
  const filePath = path.join(targetDir, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(filePath, buffer);

  const storagePath = `${subdir}/${filename}`;
  return { storagePath, publicUrl: `/uploads/${storagePath}` };
}

export async function deleteMediaFile(url: string): Promise<void> {
  if (isSupabaseConfigured()) {
    const storagePath = storagePathFromUrl(url);
    if (!storagePath) return;

    const { error } = await getSupabaseAdmin()
      .storage.from(STORAGE_BUCKET)
      .remove([storagePath]);

    if (error) {
      throw new Error(`Supabase delete failed: ${error.message}`);
    }
    return;
  }

  if (!url.startsWith("/uploads/")) return;
  const filePath = path.join(getUploadDir(), url.replace(/^\/uploads\//, ""));
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}
