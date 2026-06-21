import { NextResponse } from "next/server";
import { createPageTemplate, listPageTemplates } from "@cms/db";

export async function GET() {
  const templates = await listPageTemplates();
  return NextResponse.json(templates);
}

export async function POST(request: Request) {
  const body = await request.json();
  const template = await createPageTemplate(body);
  return NextResponse.json(template, { status: 201 });
}
