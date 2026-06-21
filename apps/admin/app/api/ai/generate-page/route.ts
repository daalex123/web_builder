import { NextResponse } from "next/server";
import { createPage, getPageBySlug } from "@cms/db";
import { generateAiPageDraft } from "@/lib/ai/generate";
import {
  fetchReferenceContext,
  fileToDataUrl,
  isSupportedReferenceImage,
} from "@/lib/ai/reference";
import { syncPreviewContent } from "@/lib/preview-sync";

async function uniqueSlug(base: string): Promise<string> {
  let slug = base;
  let counter = 2;
  while (await getPageBySlug(slug)) {
    slug = `${base}-${counter}`;
    counter += 1;
  }
  return slug;
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const prompt = String(form.get("prompt") ?? "").trim();
    const titleHint = String(form.get("title") ?? "").trim() || undefined;
    const slugHint = String(form.get("slug") ?? "").trim() || undefined;
    const layoutHint = String(form.get("layout") ?? "").trim() || undefined;
    const referenceUrl = String(form.get("referenceUrl") ?? "").trim() || undefined;
    const referenceImage = form.get("referenceImage");

    if (!prompt) {
      return NextResponse.json({ error: "Describe the page you want to create." }, { status: 400 });
    }

    if (prompt.length > 8_000) {
      return NextResponse.json({ error: "Prompt is too long (max 8000 characters)." }, { status: 400 });
    }

    let reference;
    if (referenceUrl) {
      reference = await fetchReferenceContext(referenceUrl);
    }

    let referenceImageDataUrl: string | undefined;
    if (referenceImage instanceof File && referenceImage.size > 0) {
      if (!isSupportedReferenceImage(referenceImage)) {
        return NextResponse.json(
          { error: "Reference image must be PNG, JPEG, WebP, or GIF." },
          { status: 400 },
        );
      }
      if (referenceImage.size > 8 * 1024 * 1024) {
        return NextResponse.json(
          { error: "Reference image must be under 8 MB." },
          { status: 400 },
        );
      }
      referenceImageDataUrl = await fileToDataUrl(referenceImage);
    }

    const draft = await generateAiPageDraft({
      prompt,
      titleHint,
      layoutHint,
      reference,
      referenceImageDataUrl,
    });

    const slug = await uniqueSlug(slugHint ?? draft.slug);

    const page = await createPage({
      title: titleHint ?? draft.title,
      slug,
      layout: draft.layout,
      sections: draft.sections,
      content: draft.content,
      seo: draft.seo,
      status: "draft",
    });

    await syncPreviewContent();

    return NextResponse.json(page, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI page generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
