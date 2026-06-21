import { buildSitemapEntries, loadContent } from "@cms/shared";
import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const content = loadContent();
  return buildSitemapEntries(content.site, content.pages, content.products);
}
