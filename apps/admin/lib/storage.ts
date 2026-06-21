import fs from "fs";
import path from "path";
import { del, put } from "@vercel/blob";
import { getUploadDir } from "./utils";

export function useBlobStorage(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function assertUploadStorageAvailable() {
  if (process.env.VERCEL && !process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error(
      "Media uploads on Vercel require Blob storage. Connect Vercel Blob in Project → Storage, then redeploy.",
    );
  }
}

export async function saveUpload(params: {
  buffer: Buffer;
  filename: string;
  subdir: string;
  mimeType: string;
}): Promise<{ url: string }> {
  assertUploadStorageAvailable();
  const { buffer, filename, subdir, mimeType } = params;
  const key = `uploads/${subdir}/${filename}`;

  if (useBlobStorage()) {
    const blob = await put(key, buffer, {
      access: "public",
      contentType: mimeType,
      addRandomSuffix: false,
    });
    return { url: blob.url };
  }

  const targetDir = path.join(getUploadDir(), subdir);
  fs.mkdirSync(targetDir, { recursive: true });
  fs.writeFileSync(path.join(targetDir, filename), buffer);
  return { url: `/uploads/${subdir}/${filename}` };
}

export async function deleteUpload(url: string): Promise<void> {
  if (url.startsWith("http")) {
    if (useBlobStorage()) {
      await del(url);
    }
    return;
  }

  const filePath = path.join(getUploadDir(), url.replace(/^\/uploads\//, ""));
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}
