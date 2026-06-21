import type { Homepage, Product, ProductCard, SiteSettings } from "./schemas";
import type { NestedSection } from "./nested-sections";
import type { PageSection } from "./layouts";

export function isEcommerceEnabled(site: SiteSettings): boolean {
  return site.modules?.ecommerce?.enabled === true;
}

export function productToCard(product: Product): ProductCard {
  return {
    name: product.name,
    price: product.price,
    priceFrom: product.priceFrom,
    image: product.image,
    href: `/shop/${product.slug}/`,
    inStock: product.inStock,
    sale: product.sale,
    salePrice: product.salePrice,
  };
}

function resolveSlugsToCards(slugs: string[], products: Product[]): ProductCard[] {
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  return slugs
    .map((slug) => bySlug.get(slug))
    .filter((p): p is Product => p !== undefined && p.status === "published")
    .map(productToCard);
}

export function resolveHomepageProducts(
  homepage: Homepage,
  products: Product[],
): Homepage {
  const published = products.filter((p) => p.status === "published");
  const bestSellers =
    homepage.bestSellerSlugs?.length
      ? resolveSlugsToCards(homepage.bestSellerSlugs, published)
      : homepage.bestSellers;

  const categorySections = homepage.categorySections.map((section) => ({
    ...section,
    products: section.productSlugs?.length
      ? resolveSlugsToCards(section.productSlugs, published)
      : section.products,
  }));

  const { bestSellerSlugs: _bs, ...rest } = homepage;
  return {
    ...rest,
    bestSellers,
    categorySections: categorySections.map(({ productSlugs: _ps, ...section }) => section),
  };
}

const PRODUCT_WIDGET_TYPES = new Set([
  "featured-products",
  "category-products",
  "product-slider",
]);

function resolveProductWidget<T extends { type: string; productSlugs?: string[] }>(
  section: T,
  catalog: Product[],
): T {
  if (!PRODUCT_WIDGET_TYPES.has(section.type)) return section;
  const slugs = section.productSlugs ?? [];
  const products = slugs.length ? resolveSlugsToCards(slugs, catalog) : [];
  return { ...section, products };
}

function resolveNestedSection(section: NestedSection, catalog: Product[]): NestedSection {
  return resolveProductWidget(section, catalog);
}

export function resolvePageSectionProducts(
  sections: PageSection[],
  catalog: Product[],
): PageSection[] {
  const published = catalog.filter((p) => p.status === "published");

  return sections.map((section) => {
    if (section.type === "columns") {
      return {
        ...section,
        columns: section.columns.map((col) => ({
          ...col,
          widgets: (col.widgets ?? []).map((w) => resolveNestedSection(w, published)),
        })),
      };
    }
    return resolveProductWidget(section, published);
  });
}
