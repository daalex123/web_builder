import { NextResponse } from "next/server";
import { setPageAsHome } from "@cms/db";
import { syncPreviewContent } from "@/lib/preview-sync";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
  const { id } = await params;
  const page = await setPageAsHome(id);
  if (!page) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }
  await syncPreviewContent();
  return NextResponse.json({ ok: true, page });
}
