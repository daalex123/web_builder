import { NextResponse } from "next/server";
import { deletePageTemplate, getPageTemplateById, updatePageTemplate } from "@cms/db";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const template = await getPageTemplateById(id);
  if (!template) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(template);
}

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json();
  const template = await updatePageTemplate(id, body);
  return NextResponse.json(template);
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  await deletePageTemplate(id);
  return NextResponse.json({ ok: true });
}
