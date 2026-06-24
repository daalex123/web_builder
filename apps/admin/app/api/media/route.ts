import { NextResponse } from "next/server";
import { createMedia, listMedia } from "@cms/db";
import { uploadMediaFile } from "@/lib/media-storage";
import {
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
      const { publicUrl } = await uploadMediaFile(file);
      const alt = (formData.get(`alt_${file.name}`) as string) || "";

      const media = await createMedia({
        filename: file.name,
        url: publicUrl,
        alt,
        mimeType: file.type,
        size: file.size,
      });
      results.push(media);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      errors.push(`${file.name}: ${message}`);
    }
  }

  return NextResponse.json(
    { uploaded: results, errors },
    { status: errors.length && !results.length ? 400 : 201 },
  );
}
