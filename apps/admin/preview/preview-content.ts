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

export function prefixProductCard(card: ProductCard): ProductCard {
  return {
    ...card,
    href: card.href ? webPath(card.href) : card.href,
  };
}

export function loadPreviewContent(contentDir?: string): SiteContent {
  const content = loadBaseContent(contentDir);
  return {
    ...content,
    menus: {
      header: prefixMenuItems(content.menus.header),
      footer: prefixMenuItems(content.menus.footer),
    },
  };
}

export { productToCard };
