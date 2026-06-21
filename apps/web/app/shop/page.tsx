import {
  isEcommerceEnabled,
  loadContent,
  productToCard,
  type Product,
} from "@cms/shared";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ThemedProductCard } from "@/components/shop/themed-product-card";
import { getThemeComponents, ThemeShell } from "@/themes/index";

export function generateMetadata(): Metadata {
  const content = loadContent();
  if (!isEcommerceEnabled(content.site)) return {};
  return {
    title: `Shop | ${content.site.name}`,
    description: `Browse products at ${content.site.name}`,
  };
}

function groupByCategory(products: Product[]) {
  const groups = new Map<string, Product[]>();
  for (const product of products) {
    const key = product.category ?? "All Products";
    const list = groups.get(key) ?? [];
    list.push(product);
    groups.set(key, list);
  }
  return groups;
}

export default function ShopPage() {
  const content = loadContent();

  if (!isEcommerceEnabled(content.site)) {
    notFound();
  }

  const published = (content.products ?? []).filter((p) => p.status === "published");
  if (!published.length) {
    return (
      <ThemeShell
        site={content.site}
        menu={content.menus.header}
        footerMenu={content.menus.footer}
      >
        <div className="mx-auto max-w-7xl px-6 py-16 text-center">
          <h1 className="text-3xl font-light text-neutral-900">Shop</h1>
          <p className="mt-4 text-neutral-600">No products available yet.</p>
        </div>
      </ThemeShell>
    );
  }

  const categories = groupByCategory(published);
  const { JsonLd } = getThemeComponents(content.site.theme);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: `Shop | ${content.site.name}`,
          url: `${content.site.url}/shop/`,
        }}
      />
      <ThemeShell
        site={content.site}
        menu={content.menus.header}
        footerMenu={content.menus.footer}
      >
        <div className="mx-auto max-w-7xl px-6 py-16">
          <h1 className="text-center text-3xl font-light tracking-wide text-neutral-900">Shop</h1>
          <p className="mt-3 text-center text-sm text-neutral-600">
            Browse our product catalog
          </p>

          {Array.from(categories.entries()).map(([category, products]) => (
            <section key={category} className="mt-16">
              <h2 className="text-xl font-light text-neutral-900">{category}</h2>
              <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
                {products.map((product) => (
                  <ThemedProductCard
                    key={product.slug}
                    product={productToCard(product)}
                    theme={content.site.theme}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </ThemeShell>
    </>
  );
}
