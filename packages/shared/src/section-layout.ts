import type { PageLayout, PageSection } from "./layouts";

export const SHOWCASE_SECTION_TYPES = ["hero", "slider", "video"] as const;

export function isShowcaseSection(section: PageSection): boolean {
  return (SHOWCASE_SECTION_TYPES as readonly string[]).includes(section.type);
}

/** Whether a section should span the full viewport width for the current page layout. */
export function shouldFullBleed(section: PageSection, layout: PageLayout): boolean {
  if (section.styles?.width === "full") return true;
  if (section.styles?.width === "contained") return false;

  if (layout === "homepage" || layout === "full-width") {
    return isShowcaseSection(section);
  }

  return false;
}

export function findFirstShowcaseSection(sections: PageSection[]): PageSection | undefined {
  return sections.find(isShowcaseSection);
}
