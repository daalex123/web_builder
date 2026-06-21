import { NextResponse } from "next/server";
import { createMedia, listMedia } from "@cms/db";
import { saveUpload } from "@/lib/storage";
import {
  getUploadSubdir,
  isAllowedMimeType,
  MAX_UPLOAD_BYTES,
} from "@/lib/upload";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.toLowerCase() ?? "";
  const type = searchParams.get("type") ?? "all";

  let media = await listMedia();

  if (query) {
    media = media.filter(
      (m) =>
        m.filename.toLowerCase().includes(query) ||
        (m.alt?.toLowerCase().includes(query) ?? false),
    );
  }

  if (type === "image") {
    media = media.filter((m) => m.mimeType.startsWith("image/"));
  } else if (type === "document") {
    media = media.filter((m) => !m.mimeType.startsWith("image/"));
  }

  return NextResponse.json(media);
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const files = formData.getAll("file").filter((f): f is File => f instanceof File);

  if (files.length === 0) {
    return NextResponse.json({ error: "No files provided" }, { status: 400 });
  }

  const subdir = getUploadSubdir();
  const results = [];
  const errors: string[] = [];

  for (const file of files) {
    if (!isAllowedMimeType(file.type)) {
      errors.push(`${file.name}: file type not allowed`);
      continue;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      errors.push(`${file.name}: exceeds 10 MB limit`);
      continue;
    }

    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const filename = `${Date.now()}-${safeName}`;
      const buffer = Buffer.from(await file.arrayBuffer());
      const { url } = await saveUpload({
        buffer,
        filename,
        subdir,
        mimeType: file.type,
      });

      const alt = (formData.get(`alt_${file.name}`) as string) || "";
      const media = await createMedia({
        filename: file.name,
        url,
        alt,
        mimeType: file.type,
        size: file.size,
      });
      results.push(media);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed";
      errors.push(`${file.name}: ${message}`);
    }
  }

  return NextResponse.json(
    { uploaded: results, errors },
    { status: errors.length && !results.length ? 400 : 201 },
  );
}
