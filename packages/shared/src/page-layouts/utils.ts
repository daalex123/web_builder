import type { PageLayout, PageSection } from "../layouts";
import { findFirstShowcaseSection, isShowcaseSection } from "../section-layout";

/** Sections already rendered by the layout shell should not repeat in the blocks area. */
export function getBlockSections(layout: PageLayout, sections: PageSection[]): PageSection[] {
  const skipFirstOfType = (type: PageSection["type"]) => {
    let skipped = false;
    return sections.filter((section) => {
      if (section.type === type && !skipped) {
        skipped = true;
        return false;
      }
      return true;
    });
  };

  const skipFirstShowcase = (items: PageSection[]) => {
    let skipped = false;
    return items.filter((section) => {
      if (!skipped && isShowcaseSection(section)) {
        skipped = true;
        return false;
      }
      return true;
    });
  };

  switch (layout) {
    case "landing":
    case "contact":
    case "split-hero":
      return skipFirstShowcase(sections);
    case "gallery":
      return skipFirstOfType("gallery");
    default:
      return sections;
  }
}

export { findFirstShowcaseSection };
