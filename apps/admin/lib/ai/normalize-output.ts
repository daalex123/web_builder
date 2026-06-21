import {
  createSectionId,
  normalizePageSections,
  type PageSection,
} from "@cms/shared/layouts";
import type { ContentDoc, PageLayout, Seo } from "@cms/shared";
import type { AiPageDraft } from "./types";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64) || "new-page";
}

function ensureSectionIds(section: PageSection): PageSection {
  const id = section.id?.trim() || createSectionId();

  if (section.type === "columns") {
    return {
      ...section,
      id,
      columns: section.columns.map((col) => ({
        ...col,
        id: col.id?.trim() || createSectionId(),
        widgets: col.widgets?.map((w) => ensureSectionIds(w as PageSection) as typeof w),
      })),
    };
  }

  return { ...section, id };
}

export function normalizeAiPageDraft(
  raw: Record<string, unknown>,
  hints?: { title?: string; slug?: string; layout?: string },
): AiPageDraft {
  const title =
    (typeof raw.title === "string" && raw.title.trim()) ||
    hints?.title?.trim() ||
    "Untitled Page";
  const slug = slugify(
    (typeof raw.slug === "string" && raw.slug) || hints?.slug || title,
  );
  const layout = (
    typeof raw.layout === "string" ? raw.layout : hints?.layout || "landing"
  ) as PageLayout;

  const sections = Array.isArray(raw.sections)
    ? normalizePageSections(
        raw.sections.map((s) => ensureSectionIds(s as PageSection)),
      ) ?? []
    : [];

  const content: ContentDoc =
    raw.content &&
    typeof raw.content === "object" &&
    (raw.content as ContentDoc).type === "doc"
      ? (raw.content as ContentDoc)
      : { type: "doc", content: [] };

  let seo: Seo | undefined;
  if (raw.seo && typeof raw.seo === "object") {
    const s = raw.seo as Record<string, unknown>;
    seo = {
      metaTitle:
        typeof s.metaTitle === "string" ? s.metaTitle : title,
      metaDescription:
        typeof s.metaDescription === "string" ? s.metaDescription : undefined,
      canonicalUrl:
        typeof s.canonicalUrl === "string" ? s.canonicalUrl : undefined,
      ogImage: typeof s.ogImage === "string" ? s.ogImage : undefined,
      noIndex: typeof s.noIndex === "boolean" ? s.noIndex : undefined,
    };
  }

  return { title, slug, layout, sections, content, seo };
}

export function extractJsonFromModelText(text: string): Record<string, unknown> {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced?.[1]?.trim() ?? trimmed;

  try {
    return JSON.parse(candidate) as Record<string, unknown>;
  } catch {
    const start = candidate.indexOf("{");
    const end = candidate.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(candidate.slice(start, end + 1)) as Record<string, unknown>;
    }
    throw new Error("AI response was not valid JSON");
  }
}
