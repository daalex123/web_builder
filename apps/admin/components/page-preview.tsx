"use client";

import type { ContentDoc, PageLayout, PageSection } from "@cms/shared/schemas";
import { PageLayoutRenderer } from "@cms/shared/page-layouts";
import { getMediaUrl } from "@/lib/utils";

function resolveSectionMedia(sections: PageSection[]): PageSection[] {
  return sections.map((section) => {
    switch (section.type) {
      case "hero":
        return section.image ? { ...section, image: getMediaUrl(section.image) } : section;
      case "image":
        return { ...section, src: getMediaUrl(section.src) };
      case "gallery":
        return {
          ...section,
          images: section.images.map((img) => ({
            ...img,
            src: getMediaUrl(img.src),
          })),
        };
      default:
        return section;
    }
  });
}

export function PagePreview({
  title,
  content,
  sections,
  layout,
}: {
  title: string;
  content: ContentDoc;
  sections: PageSection[];
  layout: PageLayout;
}) {
  const resolvedSections = resolveSectionMedia(sections);

  return (
    <div className="page-preview-root min-h-[480px] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 bg-gray-50 px-4 py-2">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Live preview</p>
      </div>
      <div className="max-h-[calc(100vh-220px)] overflow-y-auto">
        <PageLayoutRenderer
          title={title || "Untitled page"}
          content={content}
          sections={resolvedSections}
          layout={layout}
        />
      </div>
    </div>
  );
}
