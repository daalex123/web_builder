"use client";

import { useEffect, useState } from "react";
import { WidgetProductCardView } from "@cms/shared/widgets/product-card";
import { productToCard } from "@cms/shared/ecommerce";
import type { Product } from "@cms/shared/schemas";

type ApiProduct = {
  slug: string;
  name: string;
  image: string;
  price?: string | null;
  priceFrom?: string | null;
  sale?: boolean;
  salePrice?: string | null;
  inStock?: boolean;
  status: string;
};

let cachedProducts: ApiProduct[] | null = null;

function usePublishedProducts() {
  const [products, setProducts] = useState<ApiProduct[]>(cachedProducts ?? []);

  useEffect(() => {
    if (cachedProducts) return;
    fetch("/api/products?status=published")
      .then((r) => r.json())
      .then((data) => {
        cachedProducts = data;
        setProducts(data);
      });
  }, []);

  return products;
}

export function ProductWidgetPreview({ slugs }: { slugs: string[] }) {
  const catalog = usePublishedProducts();
  const items = slugs
    .map((slug) => catalog.find((p) => p.slug === slug))
    .filter((p): p is ApiProduct => p !== undefined)
    .map((p) => productToCard(p as Product));

  if (!slugs.length) {
    return (
      <p className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
        Select products in the panel →
      </p>
    );
  }

  if (!items.length) {
    return (
      <p className="text-sm text-gray-500">
        {slugs.length} product{slugs.length === 1 ? "" : "s"} selected (publish products to preview)
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((product) => (
        <WidgetProductCardView key={product.name + product.image} product={product} />
      ))}
    </div>
  );
}
