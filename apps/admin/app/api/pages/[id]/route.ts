import { NextResponse } from "next/server";
import { deletePage, getPageById, updatePage } from "@cms/db";
import { syncPreviewContent } from "@/lib/preview-sync";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const page = await getPageById(id);
  if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(page);
}

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json();
  const page = await updatePage(id, body);
  await syncPreviewContent();
  return NextResponse.json(page);
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  await deletePage(id);
  await syncPreviewContent();
  return NextResponse.json({ ok: true });
}
