import type { ContentDoc, PageLayout, PageSection, Seo } from "@cms/shared";

export type AiPageDraft = {
  title: string;
  slug: string;
  layout: PageLayout;
  sections: PageSection[];
  content: ContentDoc;
  seo?: Seo;
};

export type ReferenceContext = {
  url?: string;
  pageTitle?: string;
  description?: string;
  excerpt?: string;
};
