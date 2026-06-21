import Link from "next/link";
import type { ProductCard } from "@cms/shared/schemas";

function formatPrice(product: ProductCard): string {
  if (product.sale && product.salePrice) {
    const regular = product.price ?? product.priceFrom;
    return regular ? `${product.salePrice} (was ${regular})` : product.salePrice;
  }
  if (product.priceFrom && !product.price) return `From ${product.priceFrom}`;
  return product.price ?? "";
}

export function AssistantProductCard({ product }: { product: ProductCard }) {
  const href = product.href ?? "#";
  const price = formatPrice(product);

  return (
    <Link
      href={href}
      className="flex gap-3 overflow-hidden rounded-xl border border-neutral-200 bg-white p-2 transition hover:border-neutral-300 hover:shadow-sm"
    >
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="min-w-0 flex-1 py-0.5">
        <p className="truncate text-sm font-medium text-neutral-900">{product.name}</p>
        {price ? <p className="mt-0.5 text-xs text-neutral-600">{price}</p> : null}
        <p className="mt-1 text-[11px] font-medium text-neutral-500">View product →</p>
      </div>
    </Link>
  );
}
