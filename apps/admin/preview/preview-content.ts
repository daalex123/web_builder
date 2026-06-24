import { buildPreviewContent, isSupabaseConfigured } from "@cms/db";
import {
  loadContent as loadBaseContent,
  productToCard,
  type MenuItem,
  type ProductCard,
  type SiteContent,
} from "@cms/shared";
import { webPath } from "@/lib/paths";

function prefixMenuItems(items: MenuItem[]): MenuItem[] {
  return items.map((item) => ({
    ...item,
    href: item.href ? webPath(item.href) : item.href,
    children: item.children ? prefixMenuItems(item.children) : item.children,
  }));
}

function withPrefixedPaths(content: SiteContent): SiteContent {
  return {
    ...content,
    menus: {
      header: prefixMenuItems(content.menus.header),
      footer: prefixMenuItems(content.menus.footer),
    },
  };
}

/** Use Supabase for preview when configured (required on Vercel). */
export function shouldUseDatabasePreview(): boolean {
  if (process.env.PREVIEW_SOURCE === "disk") return false;
  if (process.env.PREVIEW_SOURCE === "database") return true;
  return isSupabaseConfigured();
}

/** Load preview content from JSON on disk (local dev fallback). */
export function loadPreviewContent(contentDir?: string): SiteContent {
  const content = loadBaseContent(contentDir);
  return withPrefixedPaths(content);
}

/** Load preview content — Supabase on Vercel/production, disk when Supabase is not configured. */
export async function loadPreviewContentAsync(contentDir?: string): Promise<SiteContent> {
  if (shouldUseDatabasePreview()) {
    const content = await buildPreviewContent();
    if (!content) {
      throw new Error("Site content not found in Supabase");
    }
    return withPrefixedPaths(content);
  }
  return loadPreviewContent(contentDir);
}

export function prefixProductCard(card: ProductCard): ProductCard {
  return {
    ...card,
    href: card.href ? webPath(card.href) : card.href,
  };
}

export { productToCard };
