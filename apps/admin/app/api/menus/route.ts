import { NextResponse } from "next/server";
import { getMenus, upsertMenu } from "@cms/db";
import { syncPreviewContent } from "@/lib/preview-sync";

export async function GET() {
  const menus = await getMenus();
  return NextResponse.json(menus);
}

export async function PUT(request: Request) {
  const body = await request.json();
  if (body.header) await upsertMenu("header", body.header);
  if (body.footer) await upsertMenu("footer", body.footer);
  const menus = await getMenus();
  await syncPreviewContent();
  return NextResponse.json(menus);
}
