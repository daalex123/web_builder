import { contentDocSchema, seoSchema } from "@cms/shared";
import {
  normalizePageSections,
  pageLayoutSchema,
  pageSectionSchema,
} from "@cms/shared/layouts";
import type { AiPageDraft } from "./types";

export function validateAiPageDraft(draft: AiPageDraft): AiPageDraft {
  const layout = pageLayoutSchema.parse(draft.layout);
  const sections = pageSectionSchema.array().parse(normalizePageSections(draft.sections) ?? []);
  const content = contentDocSchema.parse(draft.content);
  const seo = draft.seo ? seoSchema.parse(draft.seo) : undefined;
  const title = typeof draft.title === "string" && draft.title.trim() ? draft.title.trim() : "Untitled Page";
  const slug = typeof draft.slug === "string" && draft.slug.trim() ? draft.slug.trim() : "new-page";

  return { title, slug, layout, sections, content, seo };
}
