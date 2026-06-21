import {
  buildCmsAssistantSystemPrompt,
  type CmsAssistantSiteContext,
} from "@cms/shared/cms-assistant";
import { isAssistantEnabled } from "@cms/shared/assistant";
import { isEcommerceEnabled } from "@cms/shared/ecommerce";
import { getSiteSettings, listPages, listProducts, prisma } from "@cms/db";

export async function loadCmsAssistantContext(
  currentAdminPath?: string,
): Promise<CmsAssistantSiteContext> {
  const [site, pages, products, mediaCount] = await Promise.all([
    getSiteSettings(),
    listPages(),
    listProducts(),
    prisma.media.count(),
  ]);

  const publishedPages = pages.filter((p) => p.status === "published");
  const draftPages = pages.filter((p) => p.status === "draft");
  const publishedProducts = products.filter((p) => p.status === "published");

  return {
    siteName: site?.name ?? "My Site",
    siteDescription: site?.description,
    ecommerceEnabled: site ? isEcommerceEnabled(site) : false,
    homepageSource: site?.homepageSource,
    theme: site?.theme,
    pageCount: pages.length,
    publishedPageCount: publishedPages.length,
    draftPageCount: draftPages.length,
    pages: pages.map((p) => ({
      title: p.title,
      slug: p.slug,
      status: p.status,
      layout: p.layout ?? undefined,
    })),
    productCount: products.length,
    publishedProductCount: publishedProducts.length,
    mediaCount,
    salesAssistantEnabled: site ? isAssistantEnabled(site) : false,
    currentAdminPath,
  };
}

export async function buildCmsAssistantPrompt(
  currentAdminPath?: string,
): Promise<string> {
  const site = await getSiteSettings();
  const context = await loadCmsAssistantContext(currentAdminPath);
  return buildCmsAssistantSystemPrompt(site, context);
}
