import { NextResponse } from "next/server";
import { duplicatePage } from "@cms/db";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
  const { id } = await params;
  const page = await duplicatePage(id);
  if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(page, { status: 201 });
}
