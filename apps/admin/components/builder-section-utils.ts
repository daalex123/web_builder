import { arrayMove } from "@dnd-kit/sortable";
import type { PageSection } from "@cms/shared/layouts";
import type { NestedSection, NestedSectionType } from "@cms/shared/nested-sections";
import { defaultSection } from "@cms/shared/layouts";
import type { SectionStyles } from "@cms/shared/section-styles";

export type SectionLocation =
  | { depth: "root"; section: PageSection }
  | { depth: "nested"; parentId: string; columnIndex: number; section: NestedSection };

export function findSectionLocation(sections: PageSection[], id: string): SectionLocation | null {
  for (const section of sections) {
    if (section.id === id) return { depth: "root", section };
    if (section.type === "columns") {
      for (let columnIndex = 0; columnIndex < section.columns.length; columnIndex++) {
        const cell = section.columns[columnIndex];
        const nested = cell.widgets?.find((w) => w.id === id);
        if (nested) return { depth: "nested", parentId: section.id, columnIndex, section: nested };
      }
    }
  }
  return null;
}

export function findSectionById(sections: PageSection[], id: string): PageSection | NestedSection | null {
  return findSectionLocation(sections, id)?.section ?? null;
}

export function updateSectionById(
  sections: PageSection[],
  id: string,
  updater: (section: PageSection) => PageSection,
): PageSection[] {
  return sections.map((section) => (section.id === id ? updater(section) : section));
}

export function updateSectionInTree(
  sections: PageSection[],
  id: string,
  updater: (section: PageSection | NestedSection) => PageSection | NestedSection,
): PageSection[] {
  const location = findSectionLocation(sections, id);
  if (!location) return sections;

  if (location.depth === "root") {
    return updateSectionById(sections, id, (section) => updater(section) as PageSection);
  }

  return sections.map((section) => {
    if (section.id !== location.parentId || section.type !== "columns") return section;
    const columns = section.columns.map((cell, index) => {
      if (index !== location.columnIndex) return cell;
      return {
        ...cell,
        widgets: (cell.widgets ?? []).map((widget) =>
          widget.id === id ? (updater(widget) as NestedSection) : widget,
        ),
      };
    });
    return { ...section, columns };
  });
}

export function removeSectionById(sections: PageSection[], id: string): PageSection[] {
  const filtered = sections.filter((section) => section.id !== id);
  if (filtered.length !== sections.length) return filtered;
  return removeNestedSection(sections, id);
}

function removeNestedSection(sections: PageSection[], id: string): PageSection[] {
  return sections.map((section) => {
    if (section.type !== "columns") return section;
    const columns = section.columns.map((cell) => ({
      ...cell,
      widgets: (cell.widgets ?? []).filter((widget) => widget.id !== id),
    }));
    return { ...section, columns };
  });
}

export function moveSectionById(sections: PageSection[], activeId: string, overId: string): PageSection[] {
  const oldIndex = sections.findIndex((s) => s.id === activeId);
  const newIndex = sections.findIndex((s) => s.id === overId);
  if (oldIndex < 0 || newIndex < 0) return sections;
  return arrayMove(sections, oldIndex, newIndex);
}

export function addNestedWidgetToColumn(
  sections: PageSection[],
  columnsSectionId: string,
  columnIndex: number,
  type: NestedSectionType,
): { sections: PageSection[]; widgetId: string } {
  const widget = defaultSection(type) as NestedSection;
  let widgetId = widget.id;

  const next = sections.map((section) => {
    if (section.id !== columnsSectionId || section.type !== "columns") return section;
    const columns = section.columns.map((cell, index) => {
      if (index !== columnIndex) return cell;
      return { ...cell, widgets: [...(cell.widgets ?? []), widget] };
    });
    return { ...section, columns };
  });

  return { sections: next, widgetId };
}

export function updateSectionStyles(
  section: PageSection | NestedSection,
  patch: Partial<SectionStyles>,
): PageSection | NestedSection {
  return {
    ...section,
    styles: { ...(section.styles ?? {}), ...patch },
  };
}

export function reorderColumns(section: PageSection, activeIndex: number, overIndex: number): PageSection {
  if (section.type !== "columns") return section;

  const columns = arrayMove(section.columns, activeIndex, overIndex);
  const widths =
    section.widths && section.widths.length === section.columns.length
      ? arrayMove(section.widths, activeIndex, overIndex)
      : section.widths;

  return { ...section, columns, widths };
}

export function removeColumnAtIndex(
  section: Extract<PageSection, { type: "columns" }>,
  index: number,
): Extract<PageSection, { type: "columns" }> {
  if (section.columns.length <= 1 || index < 0 || index >= section.columns.length) {
    return section;
  }

  const columns = section.columns.filter((_, i) => i !== index);
  const rawWidths =
    section.widths && section.widths.length === section.columns.length
      ? section.widths.filter((_, i) => i !== index)
      : new Array(columns.length).fill(100 / columns.length);
  const total = rawWidths.reduce((sum, n) => sum + n, 0) || 1;
  const widths = rawWidths.map((n) => Number(((n / total) * 100).toFixed(2)));

  return { ...section, columns, widths };
}

export function getSectionLabel(section: PageSection | NestedSection): string {
  switch (section.type) {
    case "hero":
      return section.title || "Hero";
    case "text":
      return section.heading || "Text";
    case "image":
      return "Image";
    case "columns":
      return `Columns (${section.columns.length})`;
    case "cta":
      return section.title || "CTA";
    case "features":
      return `Features (${section.items.length})`;
    case "gallery":
      return `Gallery (${section.images.length})`;
    case "slider":
      return `Slider (${section.slides.length})`;
    case "testimonials":
      return section.heading || `Testimonials (${section.items.length})`;
    case "stats":
      return `Stats (${section.items.length})`;
    case "video":
      return "Video";
    case "spacer":
      return "Spacer";
    case "divider":
      return "Divider";
    case "faq":
      return section.heading || `FAQ (${section.items.length})`;
    case "featured-products":
      return section.heading || `Featured (${section.productSlugs.length})`;
    case "category-products":
      return section.title || `Category (${section.productSlugs.length})`;
    case "product-slider":
      return section.heading || `Product slider (${section.productSlugs.length})`;
  }
}

export type LayerItem = { id: string; label: string; depth: number; parentId?: string };

export function flattenSectionLayers(sections: PageSection[]): LayerItem[] {
  const layers: LayerItem[] = [];

  for (const section of sections) {
    layers.push({ id: section.id, label: getSectionLabel(section), depth: 0 });
    if (section.type === "columns") {
      section.columns.forEach((cell, columnIndex) => {
        for (const widget of cell.widgets ?? []) {
          layers.push({
            id: widget.id,
            label: `↳ Col ${columnIndex + 1}: ${getSectionLabel(widget)}`,
            depth: 1,
            parentId: section.id,
          });
        }
      });
    }
  }

  return layers;
}
