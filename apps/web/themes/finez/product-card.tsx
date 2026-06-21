import Link from "next/link";
import type { ProductCard as ProductCardType } from "@cms/shared";

export function ProductCard({ product }: { product: ProductCardType }) {
  const card = (
    <>
      <div className="relative overflow-hidden bg-neutral-100">
        {product.sale ? (
          <span className="absolute left-3 top-3 z-10 bg-neutral-900 px-2 py-1 text-[10px] font-semibold tracking-wider text-white">
            SALE
          </span>
        ) : null}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image}
          alt={product.name}
          className="aspect-square w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 bottom-0 translate-y-full bg-white/95 p-3 transition group-hover:translate-y-0">
          {product.href ? (
            <span className="block w-full border border-neutral-900 py-2 text-center text-xs font-semibold tracking-wider text-neutral-900">
              VIEW PRODUCT
            </span>
          ) : (
            <button
              type="button"
              className="w-full border border-neutral-900 py-2 text-xs font-semibold tracking-wider text-neutral-900"
            >
              QUICK VIEW
            </button>
          )}
        </div>
      </div>
      <h3 className="mt-3 text-sm font-medium text-neutral-900">{product.name}</h3>
      <div className="mt-1 text-sm text-neutral-600">
        {product.priceFrom ? <span>From: {product.priceFrom}</span> : null}
        {product.price ? (
          <span className={product.sale ? "text-red-700" : ""}>{product.price}</span>
        ) : null}
        {product.sale && product.salePrice ? (
          <span className="ml-2 text-neutral-400 line-through">{product.salePrice}</span>
        ) : null}
      </div>
      <p className="mt-1 text-xs text-green-700">
        {product.inStock ? "In stock" : "Out of stock"}
      </p>
    </>
  );

  if (product.href) {
    return (
      <Link href={product.href} className="group block">
        {card}
      </Link>
    );
  }

  return <article className="group">{card}</article>;
}
