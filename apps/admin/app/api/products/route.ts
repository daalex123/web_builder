import { NextResponse } from "next/server";
import { createProduct, listProducts } from "@cms/db";
import { syncPreviewContent } from "@/lib/preview-sync";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") ?? undefined;
  const products = await listProducts(status);
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  const body = await request.json();
  const product = await createProduct(body);
  await syncPreviewContent();
  return NextResponse.json(product, { status: 201 });
}
