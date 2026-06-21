import { NextResponse } from "next/server";
import { SAMPLE_PAGE_TEMPLATES } from "@cms/shared";

export async function GET() {
  return NextResponse.json(SAMPLE_PAGE_TEMPLATES);
}
