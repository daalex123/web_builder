import type { Metadata } from "next";
import type { Page, Product, Seo, SiteSettings } from "./schemas";
import { isEcommerceEnabled } from "./ecommerce";

/** Absolute site origin for metadata, sitemap, and JSON-LD. */
export function resolveSiteUrl(url: string | undefined): string {
  const trimmed = url?.trim();
  if (trimmed) {
    try {
      const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
      return new URL(withProtocol).origin;
    } catch {
      // invalid value in site settings — fall through
    }
  }

  const fromEnv =
    typeof process !== "undefined"
      ? (
          process.env.NEXT_PUBLIC_WEB_URL?.trim() ||
          process.env.NEXT_PUBLIC_SITE_URL?.trim()
        )
      : undefined;
  if (fromEnv) {
    try {
      const withProtocol = /^https?:\/\//i.test(fromEnv) ? fromEnv : `https://${fromEnv}`;
      return new URL(withProtocol).origin;
    } catch {
      // ignore invalid env
    }
  }

  return "http://localhost:3000";
}

export function resolveMetadataBase(siteUrl: string | undefined): URL {
  return new URL(`${resolveSiteUrl(siteUrl)}/`);
}

function siteBase(site: SiteSettings): string {
  return resolveSiteUrl(site.url);
}

function pickSeo(
  itemSeo: Seo | undefined,
  site: SiteSettings,
  fallbackTitle: string,
  fallbackDescription?: string,
): Required<Pick<Seo, "metaTitle" | "metaDescription">> & Seo {
  const defaultSeo = site.defaultSeo ?? {};
  return {
    metaTitle: itemSeo?.metaTitle ?? defaultSeo.metaTitle ?? fallbackTitle,
    metaDescription:
      itemSeo?.metaDescription ??
      defaultSeo.metaDescription ??
      fallbackDescription ??
      site.description,
    canonicalUrl: itemSeo?.canonicalUrl ?? defaultSeo.canonicalUrl,
    ogImage: itemSeo?.ogImage ?? defaultSeo.ogImage,
    noIndex: itemSeo?.noIndex ?? defaultSeo.noIndex,
  };
}

export function buildPageMetadata(
  site: SiteSettings,
  page: Page,
): Metadata {
  const seo = pickSeo(page.seo, site, page.title);
  const base = siteBase(site);
  const url = seo.canonicalUrl ?? `${base}/${page.slug === "home" ? "" : page.slug}`;

  return {
    title: seo.metaTitle,
    description: seo.metaDescription,
    alternates: { canonical: url },
    robots: seo.noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      title: seo.metaTitle,
      description: seo.metaDescription,
      url,
      siteName: site.name,
      type: "website",
      images: seo.ogImage ? [{ url: seo.ogImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: seo.metaTitle,
      description: seo.metaDescription,
      images: seo.ogImage ? [seo.ogImage] : undefined,
    },
  };
}

export function buildWebsiteJsonLd(site: SiteSettings) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    description: site.description,
    url: siteBase(site),
  };
}

export function buildWebPageJsonLd(
  site: SiteSettings,
  title: string,
  url: string,
  description?: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description: description ?? site.description,
    url,
    isPartOf: {
      "@type": "WebSite",
      name: site.name,
      url: siteBase(site),
    },
  };
}

export function buildSitemapEntries(
  site: SiteSettings,
  pages: Page[],
  products?: Product[],
) {
  const base = siteBase(site);
  const entries: Array<{
    url: string;
    lastModified: Date;
    changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
    priority: number;
  }> = [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];

  for (const page of pages) {
    if (page.template === "home" || page.slug === "home") continue;
    entries.push({
      url: `${base}/${page.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  if (isEcommerceEnabled(site) && products?.length) {
    entries.push({
      url: `${base}/shop`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    });
    for (const product of products) {
      if (product.status !== "published") continue;
      entries.push({
        url: `${base}/shop/${product.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }
  }

  return entries;
}

export function buildProductMetadata(site: SiteSettings, product: Product): Metadata {
  const seo = pickSeo(
    product.seo,
    site,
    product.name,
    product.shortDescription ?? product.description,
  );
  const base = siteBase(site);
  const url = seo.canonicalUrl ?? `${base}/shop/${product.slug}/`;

  return {
    title: seo.metaTitle,
    description: seo.metaDescription,
    alternates: { canonical: url },
    robots: seo.noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      title: seo.metaTitle,
      description: seo.metaDescription,
      url,
      siteName: site.name,
      type: "website",
      images: seo.ogImage ? [{ url: seo.ogImage }] : product.image ? [{ url: product.image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: seo.metaTitle,
      description: seo.metaDescription,
      images: seo.ogImage ? [seo.ogImage] : product.image ? [product.image] : undefined,
    },
  };
}

export function buildProductJsonLd(site: SiteSettings, product: Product) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription ?? product.description ?? site.description,
    image: [product.image, ...product.gallery],
    url: `${siteBase(site)}/shop/${product.slug}/`,
    offers: {
      "@type": "Offer",
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      price: product.sale && product.salePrice ? product.salePrice : product.price,
      priceCurrency: "USD",
    },
  };
}

export function buildRobotsTxt(siteUrl: string) {
  return `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`;
}
