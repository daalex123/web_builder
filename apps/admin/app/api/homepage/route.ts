import { NextResponse } from "next/server";
import { getHomepage, upsertHomepage } from "@cms/db";
import { syncPreviewContent } from "@/lib/preview-sync";

export async function GET() {
  const homepage = await getHomepage();
  return NextResponse.json(homepage);
}

export async function PUT(request: Request) {
  const body = await request.json();
  await upsertHomepage(body);
  await syncPreviewContent();
  return NextResponse.json(body);
}
