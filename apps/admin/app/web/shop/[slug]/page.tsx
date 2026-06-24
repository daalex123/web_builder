import {
  buildProductJsonLd,
  buildProductMetadata,
  getProductBySlug,
  isEcommerceEnabled,
} from "@cms/shared";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { loadPreviewContent } from "@preview/preview-content";
import { ProductImageGallery } from "@preview/components/shop/product-image-gallery";
import { getThemeComponents, ThemeShell } from "@preview/themes/index";
import { webPath } from "@/lib/paths";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const content = loadPreviewContent();
  if (!isEcommerceEnabled(content.site)) return {};
  const product = getProductBySlug(content, slug);
  if (!product) return {};
  return buildProductMetadata(content.site, product);
}

export default async function WebProductPage({ params }: Props) {
  const { slug } = await params;
  const content = loadPreviewContent();

  if (!isEcommerceEnabled(content.site)) {
    notFound();
  }

  const product = getProductBySlug(content, slug);
  if (!product || product.status !== "published") {
    notFound();
  }

  const { JsonLd } = getThemeComponents(content.site.theme);

  return (
    <>
      <JsonLd data={buildProductJsonLd(content.site, product)} />
      <ThemeShell
        site={content.site}
        menu={content.menus.header}
        footerMenu={content.menus.footer}
      >
        <div className="mx-auto max-w-7xl px-6 py-12">
          <Link
            href={webPath("/shop/")}
            className="text-sm text-neutral-600 transition hover:text-neutral-900"
          >
            ← Back to Shop
          </Link>

          <div className="mt-8 grid gap-12 lg:grid-cols-2">
            <ProductImageGallery
              image={product.image}
              gallery={product.gallery}
              alt={product.name}
            />

            <div>
              {product.category ? (
                <p className="text-xs font-semibold tracking-[0.15em] text-neutral-500">
                  {product.category}
                </p>
              ) : null}
              <h1 className="mt-2 text-3xl font-light text-neutral-900">{product.name}</h1>
              {product.shortDescription ? (
                <p className="mt-3 text-neutral-600">{product.shortDescription}</p>
              ) : null}

              <div className="mt-6 text-lg text-neutral-800">
                {product.priceFrom ? <span>From: {product.priceFrom} </span> : null}
                {product.price ? (
                  <span className={product.sale ? "text-red-700" : ""}>{product.price}</span>
                ) : null}
                {product.sale && product.salePrice ? (
                  <span className="ml-2 text-neutral-400 line-through">{product.salePrice}</span>
                ) : null}
              </div>

              <p
                className={`mt-2 text-sm ${product.inStock ? "text-green-700" : "text-red-700"}`}
              >
                {product.inStock ? "In stock" : "Out of stock"}
              </p>

              {product.description ? (
                <div className="mt-8 border-t border-neutral-200 pt-8">
                  <h2 className="text-sm font-semibold tracking-[0.15em] text-neutral-900">
                    Description
                  </h2>
                  <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-neutral-600">
                    {product.description}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </ThemeShell>
    </>
  );
}
