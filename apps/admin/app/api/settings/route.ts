import { NextResponse } from "next/server";
import { getSiteSettings, upsertSiteSettings } from "@cms/db";
import { syncPreviewContent } from "@/lib/preview-sync";

export async function GET() {
  const settings = await getSiteSettings();
  return NextResponse.json(settings);
}

export async function PUT(request: Request) {
  const body = await request.json();
  await upsertSiteSettings(body);
  await syncPreviewContent();
  return NextResponse.json(body);
}
