import type { ReactNode } from "react";
import type { ContentDoc } from "../schemas";
import type { PageLayout, PageSection } from "../layouts";
import { RenderContent } from "../render-content";
import { RenderSections } from "../render-sections";
import { getBlockSections } from "./utils";
import { StandardLayout } from "./standard";
import { FullWidthLayout } from "./full-width";
import { SidebarLayout } from "./sidebar";
import { LandingLayout } from "./landing";
import { ContactLayout } from "./contact";
import { GalleryLayout } from "./gallery";
import { SplitHeroLayout } from "./split-hero";
import { HomepageLayout } from "./homepage";

export type LayoutShellProps = {
  title: string;
  body: ReactNode;
  blocks: ReactNode;
  sections: PageSection[];
  suppressTitle?: boolean;
};

export type PageLayoutProps = {
  title: string;
  content: ContentDoc;
  sections?: PageSection[];
  layout: PageLayout;
  suppressTitle?: boolean;
};

export function PageLayoutRenderer({
  title,
  content,
  sections = [],
  layout,
  suppressTitle = false,
}: PageLayoutProps) {
  const body = <RenderContent doc={content} />;
  const blockSections = getBlockSections(layout, sections);
  const blocks = blockSections.length ? (
    <RenderSections sections={blockSections} layout={layout} />
  ) : null;
  const props = { title, body, blocks, sections, suppressTitle };

  switch (layout) {
    case "full-width":
      return <FullWidthLayout {...props} />;
    case "sidebar":
      return <SidebarLayout {...props} />;
    case "landing":
      return <LandingLayout {...props} />;
    case "contact":
      return <ContactLayout {...props} />;
    case "gallery":
      return <GalleryLayout {...props} />;
    case "split-hero":
      return <SplitHeroLayout {...props} />;
    case "homepage":
      return <HomepageLayout {...props} />;
    case "standard":
    default:
      return <StandardLayout {...props} />;
  }
}
