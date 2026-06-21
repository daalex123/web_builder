import { NextResponse } from "next/server";
import { createPage, listPages } from "@cms/db";
import { syncPreviewContent } from "@/lib/preview-sync";

export async function GET() {
  const pages = await listPages();
  return NextResponse.json(pages);
}

export async function POST(request: Request) {
  const body = await request.json();
  const page = await createPage(body);
  await syncPreviewContent();
  return NextResponse.json(page, { status: 201 });
}
