import { NextResponse } from "next/server";
import { createPage, getPageTemplateById } from "@cms/db";
import { getSampleTemplate } from "@cms/shared";

export async function POST(request: Request) {
  const body = await request.json();
  const { source, sourceId, title, slug, status } = body as {
    source: "sample" | "saved";
    sourceId: string;
    title?: string;
    slug?: string;
    status?: string;
  };

  if (source === "sample") {
    const sample = getSampleTemplate(sourceId);
    if (!sample) return NextResponse.json({ error: "Sample not found" }, { status: 404 });

    const page = await createPage({
      title: title ?? sample.title,
      slug: slug ?? sample.slug,
      layout: sample.layout,
      sections: sample.sections,
      content: sample.content,
      status: status ?? "draft",
    });
    return NextResponse.json(page, { status: 201 });
  }

  const saved = await getPageTemplateById(sourceId);
  if (!saved) return NextResponse.json({ error: "Template not found" }, { status: 404 });

  const page = await createPage({
    title: title ?? saved.name,
    slug: slug ?? saved.name.toLowerCase().replace(/\s+/g, "-"),
    layout: saved.layout,
    sections: saved.sections ? JSON.parse(saved.sections) : undefined,
    content: JSON.parse(saved.content),
    status: status ?? "draft",
  });
  return NextResponse.json(page, { status: 201 });
}
