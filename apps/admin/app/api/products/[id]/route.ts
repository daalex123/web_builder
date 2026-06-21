import { NextResponse } from "next/server";
import { deleteProduct, getProductById, updateProduct } from "@cms/db";
import { syncPreviewContent } from "@/lib/preview-sync";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json();
  const product = await updateProduct(id, body);
  await syncPreviewContent();
  return NextResponse.json(product);
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  await deleteProduct(id);
  await syncPreviewContent();
  return NextResponse.json({ ok: true });
}
