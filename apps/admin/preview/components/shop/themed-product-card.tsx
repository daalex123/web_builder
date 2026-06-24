import type { ProductCard as ProductCardType } from "@cms/shared";
import { isFurnitureTheme } from "@cms/shared";
import { ProductCard as FinezProductCard } from "@preview/themes/finez/product-card";
import { ProductCard as FurnitureProductCard } from "@preview/themes/furniture/product-card";

export function ThemedProductCard({
  product,
  theme,
}: {
  product: ProductCardType;
  theme: string;
}) {
  if (theme === "finez") {
    return <FinezProductCard product={product} />;
  }
  if (isFurnitureTheme(theme)) {
    return <FurnitureProductCard product={product} />;
  }
  return <FinezProductCard product={product} />;
}
