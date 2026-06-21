import fs from "fs";
import path from "path";
import type {
  ContentDoc,
  Homepage,
  Menus,
  Page,
  PageLayout,
  PageSection,
  Product,
  Seo,
  SiteContent,
  SiteSettings,
} from "@cms/shared";
import {
  defaultSection,
  isEcommerceEnabled,
  normalizePageSections,
  resolveHomepageProducts,
  resolvePageSectionProducts,
} from "@cms/shared";
import { prisma } from "./client";

function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function serializeSeoForDb(seo: Seo | string | null | undefined): string | null | undefined {
  if (seo === undefined) return undefined;
  if (seo === null) return null;
  if (typeof seo === "string") {
    try {
      return JSON.stringify(JSON.parse(seo));
    } catch {
      return null;
    }
  }
  return JSON.stringify(seo);
}

function parseSeoField(value: string | null | undefined): Seo | undefined {
  if (!value) return undefined;
  try {
    let parsed: unknown = JSON.parse(value);
    if (typeof parsed === "string") {
      parsed = JSON.parse(parsed);
    }
    if (parsed && typeof parsed === "object") {
      return parsed as Seo;
    }
  } catch {
    return undefined;
  }
  return undefined;
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  const row = await prisma.siteSettings.findUnique({ where: { id: "default" } });
  return row ? parseJson<SiteSettings>(row.data, null as unknown as SiteSettings) : null;
}

export async function upsertSiteSettings(data: SiteSettings) {
  return prisma.siteSettings.upsert({
    where: { id: "default" },
    create: { id: "default", data: JSON.stringify(data) },
    update: { data: JSON.stringify(data) },
  });
}

export async function getHomepage(): Promise<Homepage | null> {
  const row = await prisma.homepage.findUnique({ where: { id: "default" } });
  return row ? parseJson<Homepage>(row.data, null as unknown as Homepage) : null;
}

export async function upsertHomepage(data: Homepage) {
  return prisma.homepage.upsert({
    where: { id: "default" },
    create: { id: "default", data: JSON.stringify(data) },
    update: { data: JSON.stringify(data) },
  });
}

export async function getMenus(): Promise<Menus> {
  const rows = await prisma.menu.findMany();
  const header = rows.find((r) => r.location === "header");
  const footer = rows.find((r) => r.location === "footer");
  return {
    header: parseJson(header?.items, []),
    footer: parseJson(footer?.items, []),
  };
}

export async function upsertMenu(location: "header" | "footer", items: Menus["header"]) {
  return prisma.menu.upsert({
    where: { location },
    create: { location, items: JSON.stringify(items) },
    update: { items: JSON.stringify(items) },
  });
}

export async function listPages(status?: string) {
  return prisma.page.findMany({
    where: status ? { status } : undefined,
    orderBy: { updatedAt: "desc" },
  });
}

export async function getPageById(id: string) {
  return prisma.page.findUnique({ where: { id } });
}

export async function getPageBySlug(slug: string) {
  return prisma.page.findUnique({ where: { slug } });
}

export async function createPage(data: {
  slug: string;
  title: string;
  template?: string;
  layout?: string;
  sections?: PageSection[];
  content: ContentDoc;
  seo?: Seo;
  status?: string;
}) {
  return prisma.page.create({
    data: {
      slug: data.slug,
      title: data.title,
      template: data.template ?? "page",
      layout: data.layout ?? "standard",
      sections: data.sections ? JSON.stringify(data.sections) : null,
      content: JSON.stringify(data.content),
      seo: data.seo ? JSON.stringify(data.seo) : null,
      status: data.status ?? "draft",
    },
  });
}

export async function updatePage(
  id: string,
  data: Partial<{
    slug: string;
    title: string;
    template: string;
    layout: string;
    sections: PageSection[] | null;
    content: ContentDoc;
    seo: Seo | null;
    status: string;
  }>,
) {
  return prisma.page.update({
    where: { id },
    data: {
      slug: data.slug,
      title: data.title,
      template: data.template,
      layout: data.layout,
      sections:
        data.sections === null
          ? null
          : data.sections
            ? JSON.stringify(data.sections)
            : undefined,
      content: data.content ? JSON.stringify(data.content) : undefined,
      seo: data.seo === null ? null : data.seo ? JSON.stringify(data.seo) : undefined,
      status: data.status,
    },
  });
}

export async function deletePage(id: string) {
  return prisma.page.delete({ where: { id } });
}

export async function getHomeBuilderPage() {
  return prisma.page.findFirst({
    where: { template: "home" },
    orderBy: { updatedAt: "desc" },
  });
}

export async function demoteOtherHomePages(keepId: string) {
  await prisma.page.updateMany({
    where: { template: "home", NOT: { id: keepId } },
    data: { template: "page" },
  });
}

export async function ensureHomeBuilderPage() {
  const existing = await getHomeBuilderPage();
  if (existing) return existing;

  const sections = normalizePageSections([
    defaultSection("slider"),
    defaultSection("features"),
  ]);

  return createPage({
    slug: "home",
    title: "Home",
    template: "home",
    layout: "homepage",
    sections: sections ?? [],
    content: { type: "doc", content: [] },
    status: "draft",
    seo: {
      metaTitle: "Home",
      metaDescription: "",
    },
  });
}

export async function setHomepageSource(source: "builder" | "structured") {
  const settings = await getSiteSettings();
  if (!settings) return null;
  await upsertSiteSettings({ ...settings, homepageSource: source });
  return { ...settings, homepageSource: source };
}

export async function setPageAsHome(pageId: string) {
  const page = await prisma.page.findUnique({ where: { id: pageId } });
  if (!page) return null;

  await demoteOtherHomePages(pageId);
  const updated = await updatePage(pageId, {
    template: "home",
    slug: page.slug === "home" ? "home" : page.slug,
    status: "published",
  });
  await setHomepageSource("builder");
  return updated;
}

export async function listMedia() {
  return prisma.media.findMany({ orderBy: { createdAt: "desc" } });
}

export async function createMedia(data: {
  filename: string;
  url: string;
  alt?: string;
  mimeType: string;
  size?: number;
}) {
  return prisma.media.create({ data });
}

export async function deleteMedia(id: string) {
  return prisma.media.delete({ where: { id } });
}

export async function getMediaById(id: string) {
  return prisma.media.findUnique({ where: { id } });
}

export async function updateMedia(
  id: string,
  data: Partial<{ alt: string; filename: string }>,
) {
  return prisma.media.update({ where: { id }, data });
}

export async function duplicatePage(id: string) {
  const page = await prisma.page.findUnique({ where: { id } });
  if (!page) return null;

  const baseSlug = `${page.slug}-copy`;
  let slug = baseSlug;
  let counter = 1;
  while (await prisma.page.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  return prisma.page.create({
    data: {
      slug,
      title: `${page.title} (Copy)`,
      template: page.template,
      layout: page.layout,
      sections: page.sections,
      content: page.content,
      seo: page.seo,
      status: "draft",
    },
  });
}

export function dbPageToExport(page: {
  slug: string;
  title: string;
  template: string;
  layout?: string;
  sections?: string | null;
  content: string;
  seo: string | null;
}): Page {
  return {
    slug: page.slug,
    title: page.title,
    template: page.template as Page["template"],
    layout: (page.layout ?? "standard") as PageLayout,
    sections: normalizePageSections(parseJson(page.sections ?? null, undefined)),
    content: parseJson(page.content, { type: "doc", content: [] }),
    seo: parseJson(page.seo, undefined),
  };
}

export async function buildPublishedContent(): Promise<SiteContent | null> {
  return buildContentForExport({ includeDrafts: false });
}

/** Dev preview: includes draft pages so saves are visible without publishing. */
export async function buildPreviewContent(): Promise<SiteContent | null> {
  return buildContentForExport({ includeDrafts: true });
}

async function buildContentForExport(options: {
  includeDrafts: boolean;
}): Promise<SiteContent | null> {
  const site = await getSiteSettings();
  if (!site) return null;

  const menus = await getMenus();
  const rawHomepage = await getHomepage();
  const pages = await prisma.page.findMany(
    options.includeDrafts ? undefined : { where: { status: "published" } },
  );

  const ecommerceEnabled = isEcommerceEnabled(site);
  let products: Product[] | undefined;
  let homepage = rawHomepage ?? undefined;

  if (ecommerceEnabled) {
    const productRows = await prisma.product.findMany(
      options.includeDrafts ? undefined : { where: { status: "published" } },
    );
    products = productRows.map(dbProductToExport);
    if (homepage) {
      homepage = resolveHomepageProducts(homepage, products);
    }
  }

  return {
    site,
    menus,
    homepage,
    pages: pages.map((page) => {
      const exported = dbPageToExport(page);
      if (ecommerceEnabled && exported.sections?.length) {
        return {
          ...exported,
          sections: resolvePageSectionProducts(exported.sections, products ?? []),
        };
      }
      return exported;
    }),
    products,
  };
}

function writeContentToDisk(contentDir: string, content: SiteContent) {
  fs.mkdirSync(path.join(contentDir, "pages"), { recursive: true });

  fs.writeFileSync(
    path.join(contentDir, "site.json"),
    JSON.stringify(content.site, null, 2),
  );
  fs.writeFileSync(
    path.join(contentDir, "menus.json"),
    JSON.stringify(content.menus, null, 2),
  );

  if (content.homepage) {
    fs.writeFileSync(
      path.join(contentDir, "homepage.json"),
      JSON.stringify(content.homepage, null, 2),
    );
  }

  const productsPath = path.join(contentDir, "products.json");
  if (content.products?.length) {
    fs.writeFileSync(productsPath, JSON.stringify(content.products, null, 2));
  } else if (fs.existsSync(productsPath)) {
    fs.unlinkSync(productsPath);
  }

  const existingPages = fs.existsSync(path.join(contentDir, "pages"))
    ? fs.readdirSync(path.join(contentDir, "pages"))
    : [];
  for (const file of existingPages) {
    if (file.endsWith(".json")) {
      fs.unlinkSync(path.join(contentDir, "pages", file));
    }
  }

  for (const page of content.pages) {
    fs.writeFileSync(
      path.join(contentDir, "pages", `${page.slug}.json`),
      JSON.stringify(page, null, 2),
    );
  }

  const postsDir = path.join(contentDir, "posts");
  if (fs.existsSync(postsDir)) {
    fs.rmSync(postsDir, { recursive: true, force: true });
  }

  return content;
}

export async function exportContentToDisk(contentDir: string) {
  const content = await buildPublishedContent();
  if (!content) {
    throw new Error("Site settings not configured");
  }
  return writeContentToDisk(contentDir, content);
}

export async function exportPreviewContentToDisk(contentDir: string) {
  const content = await buildPreviewContent();
  if (!content) {
    throw new Error("Site settings not configured");
  }
  return writeContentToDisk(contentDir, content);
}

export async function listPageTemplates() {
  return prisma.pageTemplate.findMany({ orderBy: { updatedAt: "desc" } });
}

export async function getPageTemplateById(id: string) {
  return prisma.pageTemplate.findUnique({ where: { id } });
}

export async function createPageTemplate(data: {
  name: string;
  description?: string;
  layout?: string;
  content: ContentDoc;
  sections?: PageSection[];
}) {
  return prisma.pageTemplate.create({
    data: {
      name: data.name,
      description: data.description,
      layout: data.layout ?? "standard",
      content: JSON.stringify(data.content),
      sections: data.sections ? JSON.stringify(data.sections) : null,
    },
  });
}

export async function updatePageTemplate(
  id: string,
  data: Partial<{
    name: string;
    description: string | null;
    layout: string;
    content: ContentDoc;
    sections: PageSection[] | null;
  }>,
) {
  return prisma.pageTemplate.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      layout: data.layout,
      content: data.content ? JSON.stringify(data.content) : undefined,
      sections:
        data.sections === null
          ? null
          : data.sections
            ? JSON.stringify(data.sections)
            : undefined,
    },
  });
}

export async function deletePageTemplate(id: string) {
  return prisma.pageTemplate.delete({ where: { id } });
}

export async function listProducts(status?: string) {
  return prisma.product.findMany({
    where: status ? { status } : undefined,
    orderBy: { updatedAt: "desc" },
  });
}

export async function getProductById(id: string) {
  return prisma.product.findUnique({ where: { id } });
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({ where: { slug } });
}

export function dbProductToExport(product: {
  slug: string;
  name: string;
  description: string | null;
  shortDescription: string | null;
  price: string | null;
  priceFrom: string | null;
  sale: boolean;
  salePrice: string | null;
  image: string;
  gallery: string;
  category: string | null;
  inStock: boolean;
  seo: string | null;
  status: string;
}): Product {
  return {
    slug: product.slug,
    name: product.name,
    description: product.description ?? undefined,
    shortDescription: product.shortDescription ?? undefined,
    price: product.price ?? undefined,
    priceFrom: product.priceFrom ?? undefined,
    sale: product.sale,
    salePrice: product.salePrice ?? undefined,
    image: product.image,
    gallery: parseJson<string[]>(product.gallery, []),
    category: product.category ?? undefined,
    inStock: product.inStock,
    seo: parseSeoField(product.seo),
    status: product.status as Product["status"],
  };
}

export async function createProduct(data: {
  slug: string;
  name: string;
  description?: string;
  shortDescription?: string;
  price?: string;
  priceFrom?: string;
  sale?: boolean;
  salePrice?: string;
  image: string;
  gallery?: string[];
  category?: string;
  inStock?: boolean;
  seo?: Seo | string;
  status?: string;
}) {
  return prisma.product.create({
    data: {
      slug: data.slug,
      name: data.name,
      description: data.description,
      shortDescription: data.shortDescription,
      price: data.price,
      priceFrom: data.priceFrom,
      sale: data.sale ?? false,
      salePrice: data.salePrice,
      image: data.image,
      gallery: JSON.stringify(data.gallery ?? []),
      category: data.category,
      inStock: data.inStock ?? true,
      seo: serializeSeoForDb(data.seo),
      status: data.status ?? "draft",
    },
  });
}

export async function updateProduct(
  id: string,
  data: Partial<{
    slug: string;
    name: string;
    description: string | null;
    shortDescription: string | null;
    price: string | null;
    priceFrom: string | null;
    sale: boolean;
    salePrice: string | null;
    image: string;
    gallery: string[];
    category: string | null;
    inStock: boolean;
    seo: Seo | string | null;
    status: string;
  }>,
) {
  return prisma.product.update({
    where: { id },
    data: {
      slug: data.slug,
      name: data.name,
      description: data.description,
      shortDescription: data.shortDescription,
      price: data.price,
      priceFrom: data.priceFrom,
      sale: data.sale,
      salePrice: data.salePrice,
      image: data.image,
      gallery: data.gallery ? JSON.stringify(data.gallery) : undefined,
      category: data.category,
      inStock: data.inStock,
      seo: serializeSeoForDb(data.seo),
      status: data.status,
    },
  });
}

export async function deleteProduct(id: string) {
  return prisma.product.delete({ where: { id } });
}
