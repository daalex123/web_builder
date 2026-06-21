import { loadContent, resolveSiteUrl } from "@cms/shared";
import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const { site } = loadContent();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${resolveSiteUrl(site.url)}/sitemap.xml`,
  };
}
