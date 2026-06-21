import fs from "fs";
import path from "path";
import { Readable } from "stream";
import { NextResponse } from "next/server";
import { getUploadDir } from "@/lib/utils";

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await params;
  const uploadDir = path.resolve(getUploadDir());
  const filePath = path.resolve(uploadDir, ...segments);

  if (!filePath.startsWith(uploadDir + path.sep)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME[ext] ?? "application/octet-stream";
  const stream = Readable.toWeb(fs.createReadStream(filePath)) as ReadableStream;

  return new NextResponse(stream, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
