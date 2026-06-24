import { NextResponse } from "next/server";
import {
  getPublishZipStats,
  readPublishZip,
} from "@/lib/publish-export";

export async function GET() {
  const stats = getPublishZipStats();
  if (!stats) {
    return NextResponse.json(
      { error: "No published site archive found. Build the site first." },
      { status: 404 },
    );
  }

  const stream = readPublishZip();

  return new NextResponse(stream as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": 'attachment; filename="site.zip"',
      "Content-Length": String(stats.size),
      "Cache-Control": "no-store",
    },
  });
}

export async function HEAD() {
  const stats = getPublishZipStats();
  if (!stats) {
    return new NextResponse(null, { status: 404 });
  }

  return new NextResponse(null, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Length": String(stats.size),
      "Content-Disposition": 'attachment; filename="site.zip"',
    },
  });
}
