import { NextResponse } from "next/server";
import {
  ensureHomeBuilderPage,
  getSiteSettings,
  setHomepageSource,
  updatePage,
} from "@cms/db";
import type { ContentDoc, PageSection, Seo } from "@cms/shared";
import { syncPreviewContent } from "@/lib/preview-sync";

export async function GET() {
  const [page, settings] = await Promise.all([ensureHomeBuilderPage(), getSiteSettings()]);
  return NextResponse.json({ page, settings });
}

export async function PUT(request: Request) {
  const body = await request.json();
  const page = await ensureHomeBuilderPage();

  const updated = await updatePage(page.id, {
    title: body.title ?? page.title,
    slug: "home",
    template: "home",
    layout: body.layout ?? page.layout,
    sections: (body.sections as PageSection[] | undefined) ?? undefined,
    content: (body.content as ContentDoc | undefined) ?? undefined,
    seo: (body.seo as Seo | undefined) ?? undefined,
    status: body.status ?? page.status,
  });

  const settings = await setHomepageSource("builder");

  await syncPreviewContent();
  return NextResponse.json({ page: updated, settings });
}
