import { PAGE_LAYOUTS } from "@cms/shared/layouts";
import { SAMPLE_PAGE_TEMPLATES } from "@cms/shared/sample-templates";
import type { ReferenceContext } from "./types";

const EXAMPLE = SAMPLE_PAGE_TEMPLATES.find((t) => t.id === "services-landing");

export function buildSystemPrompt(): string {
  const layouts = PAGE_LAYOUTS.map((l) => `${l.id}: ${l.description}`).join("\n");

  return `You are an expert web page designer for a CMS. Generate page structure as JSON only.

Available layouts:
${layouts}

Widget section types (each needs unique "id" like "sec_hero_1"):
- hero: title, subtitle?, image?, ctaLabel?, ctaHref?
- text: heading?, body
- image: src, alt?, caption?
- cta: title, body, buttonLabel, buttonHref
- features: items[{title, body}] (2-6 items)
- gallery: images[{src, alt?}] (3-6 images)
- slider: slides[{image, eyebrow?, mainText?, subText?, primaryButton?, secondaryButton?, align?, valign?}], effect?, autoplay?, interval?, height?
- testimonials: heading?, items[{quote, author, role?}]
- stats: items[{value, label}]
- video: url (YouTube), caption?, poster?
- spacer: height? (8-240)
- divider: variant? ("line"|"dots")
- faq: heading?, items[{question, answer}]
- featured-products: heading?, productSlugs[], columns? (2|3|4)
- category-products: title, subtitle, ctaLabel, ctaHref, productSlugs[]
- product-slider: heading?, productSlugs[], autoplay?, interval?, showArrows?, showDots?
- columns: columns[{id, title?, body?, widgets?[]}] (1-3 columns), widths?

Rules:
- Return ONLY valid JSON matching the output schema. No markdown fences or commentary.
- Use realistic, professional copy tailored to the user's request.
- Prefer 4-8 sections for marketing pages; fewer for simple pages.
- For images without a provided asset, use "/uploads/placeholder.jpg".
- Slugs must be lowercase kebab-case (e.g. "about-us").
- content is always { "type": "doc", "content": [] } unless extra prose is needed below widgets.
- seo.metaTitle and seo.metaDescription should be compelling and under 160 chars for description.
- Match layout to page purpose (landing for marketing, contact for contact, gallery for portfolios).

Example output shape:
${JSON.stringify(
    EXAMPLE
      ? {
          title: EXAMPLE.title,
          slug: EXAMPLE.slug,
          layout: EXAMPLE.layout,
          seo: {
            metaTitle: EXAMPLE.title,
            metaDescription: EXAMPLE.description,
          },
          sections: EXAMPLE.sections,
          content: EXAMPLE.content,
        }
      : { title: "Example", slug: "example", layout: "landing", sections: [], content: { type: "doc", content: [] } },
    null,
    2,
  )}`;
}

export function buildUserPrompt(input: {
  prompt: string;
  layoutHint?: string;
  titleHint?: string;
  reference?: ReferenceContext;
}): string {
  const parts = [
    `Create a page based on this request:\n${input.prompt.trim()}`,
  ];

  if (input.titleHint?.trim()) {
    parts.push(`Preferred title: ${input.titleHint.trim()}`);
  }

  if (input.layoutHint?.trim()) {
    parts.push(`Preferred layout: ${input.layoutHint.trim()}`);
  }

  if (input.reference) {
    parts.push("Reference website context (use for structure, tone, and content inspiration — do not copy verbatim):");
    if (input.reference.url) parts.push(`URL: ${input.reference.url}`);
    if (input.reference.pageTitle) parts.push(`Page title: ${input.reference.pageTitle}`);
    if (input.reference.description) parts.push(`Meta description: ${input.reference.description}`);
    if (input.reference.excerpt) {
      parts.push(`Visible text excerpt:\n${input.reference.excerpt}`);
    }
  }

  return parts.join("\n\n");
}
