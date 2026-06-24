import { randomUUID } from "crypto";
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
import { getSupabase } from "./supabase";
import type { DbPage, DbProduct, DbPublishLog } from "./types";

function now(): string {
  return new Date().toISOString();
}

function throwOnError(error: { message: string } | null): void {
  if (error) throw new Error(error.message);
}

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
  const { data, error } = await getSupabase()
    .from("SiteSettings")
    .select("data")
    .eq("id", "default")
    .maybeSingle();
  throwOnError(error);
  return data ? parseJson<SiteSettings>(data.data, null as unknown as SiteSettings) : null;
}

export async function upsertSiteSettings(data: SiteSettings) {
  const row = { id: "default", data: JSON.stringify(data), updatedAt: now() };
  const { data: result, error } = await getSupabase()
    .from("SiteSettings")
    .upsert(row, { onConflict: "id" })
    .select()
    .single();
  throwOnError(error);
  return result;
}

export async function getHomepage(): Promise<Homepage | null> {
  const { data, error } = await getSupabase()
    .from("Homepage")
    .select("data")
    .eq("id", "default")
    .maybeSingle();
  throwOnError(error);
  return data ? parseJson<Homepage>(data.data, null as unknown as Homepage) : null;
}

export async function upsertHomepage(data: Homepage) {
  const row = { id: "default", data: JSON.stringify(data), updatedAt: now() };
  const { data: result, error } = await getSupabase()
    .from("Homepage")
    .upsert(row, { onConflict: "id" })
    .select()
    .single();
  throwOnError(error);
  return result;
}

export async function getMenus(): Promise<Menus> {
  const { data, error } = await getSupabase().from("Menu").select("location, items");
  throwOnError(error);
  const rows = data ?? [];
  const header = rows.find((r) => r.location === "header");
  const footer = rows.find((r) => r.location === "footer");
  return {
    header: parseJson(header?.items, []),
    footer: parseJson(footer?.items, []),
  };
}

export async function upsertMenu(location: "header" | "footer", items: Menus["header"]) {
  const { data: existing, error: findError } = await getSupabase()
    .from("Menu")
    .select("id")
    .eq("location", location)
    .maybeSingle();
  throwOnError(findError);

  const payload = {
    location,
    items: JSON.stringify(items),
    updatedAt: now(),
  };

  if (existing?.id) {
    const { data, error } = await getSupabase()
      .from("Menu")
      .update(payload)
      .eq("id", existing.id)
      .select()
      .single();
    throwOnError(error);
    return data;
  }

  const { data, error } = await getSupabase()
    .from("Menu")
    .insert({ id: randomUUID(), ...payload })
    .select()
    .single();
  throwOnError(error);
  return data;
}

export async function listPages(status?: string): Promise<DbPage[]> {
  let query = getSupabase().from("Page").select("*").order("updatedAt", { ascending: false });
  if (status) query = query.eq("status", status);
  const { data, error } = await query;
  throwOnError(error);
  return (data ?? []) as DbPage[];
}

export async function getPageById(id: string) {
  const { data, error } = await getSupabase().from("Page").select("*").eq("id", id).maybeSingle();
  throwOnError(error);
  return data as DbPage | null;
}

export async function getPageBySlug(slug: string) {
  const { data, error } = await getSupabase()
    .from("Page")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  throwOnError(error);
  return data as DbPage | null;
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
  const timestamp = now();
  const row = {
    id: randomUUID(),
    slug: data.slug,
    title: data.title,
    template: data.template ?? "page",
    layout: data.layout ?? "standard",
    sections: data.sections ? JSON.stringify(data.sections) : null,
    content: JSON.stringify(data.content),
    seo: data.seo ? JSON.stringify(data.seo) : null,
    status: data.status ?? "draft",
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  const { data: result, error } = await getSupabase().from("Page").insert(row).select().single();
  throwOnError(error);
  return result as DbPage;
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
  const patch: Record<string, unknown> = { updatedAt: now() };
  if (data.slug !== undefined) patch.slug = data.slug;
  if (data.title !== undefined) patch.title = data.title;
  if (data.template !== undefined) patch.template = data.template;
  if (data.layout !== undefined) patch.layout = data.layout;
  if (data.sections === null) patch.sections = null;
  else if (data.sections) patch.sections = JSON.stringify(data.sections);
  if (data.content) patch.content = JSON.stringify(data.content);
  if (data.seo === null) patch.seo = null;
  else if (data.seo) patch.seo = JSON.stringify(data.seo);
  if (data.status !== undefined) patch.status = data.status;

  const { data: result, error } = await getSupabase()
    .from("Page")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  throwOnError(error);
  return result as DbPage;
}

export async function deletePage(id: string) {
  const { data, error } = await getSupabase().from("Page").delete().eq("id", id).select().single();
  throwOnError(error);
  return data as DbPage;
}

export async function getHomeBuilderPage() {
  const { data, error } = await getSupabase()
    .from("Page")
    .select("*")
    .eq("template", "home")
    .order("updatedAt", { ascending: false })
    .limit(1)
    .maybeSingle();
  throwOnError(error);
  return data as DbPage | null;
}

export async function demoteOtherHomePages(keepId: string) {
  const { error } = await getSupabase()
    .from("Page")
    .update({ template: "page", updatedAt: now() })
    .eq("template", "home")
    .neq("id", keepId);
  throwOnError(error);
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
  const page = await getPageById(pageId);
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
  const { data, error } = await getSupabase()
    .from("Media")
    .select("*")
    .order("createdAt", { ascending: false });
  throwOnError(error);
  return data ?? [];
}

export async function countMedia(): Promise<number> {
  const { count, error } = await getSupabase()
    .from("Media")
    .select("*", { count: "exact", head: true });
  throwOnError(error);
  return count ?? 0;
}

export async function createMedia(data: {
  filename: string;
  url: string;
  alt?: string;
  mimeType: string;
  size?: number;
}) {
  const row = {
    id: randomUUID(),
    filename: data.filename,
    url: data.url,
    alt: data.alt ?? null,
    mimeType: data.mimeType,
    size: data.size ?? null,
    createdAt: now(),
  };
  const { data: result, error } = await getSupabase().from("Media").insert(row).select().single();
  throwOnError(error);
  return result;
}

export async function deleteMedia(id: string) {
  const { data, error } = await getSupabase().from("Media").delete().eq("id", id).select().single();
  throwOnError(error);
  return data;
}

export async function getMediaById(id: string) {
  const { data, error } = await getSupabase().from("Media").select("*").eq("id", id).maybeSingle();
  throwOnError(error);
  return data;
}

export async function updateMedia(
  id: string,
  data: Partial<{ alt: string; filename: string }>,
) {
  const patch: Record<string, string> = {};
  if (data.alt !== undefined) patch.alt = data.alt;
  if (data.filename !== undefined) patch.filename = data.filename;
  const { data: result, error } = await getSupabase()
    .from("Media")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  throwOnError(error);
  return result;
}

export async function duplicatePage(id: string) {
  const page = await getPageById(id);
  if (!page) return null;

  const baseSlug = `${page.slug}-copy`;
  let slug = baseSlug;
  let counter = 1;
  while (await getPageBySlug(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  const timestamp = now();
  const row = {
    id: randomUUID(),
    slug,
    title: `${page.title} (Copy)`,
    template: page.template,
    layout: page.layout,
    sections: page.sections,
    content: page.content,
    seo: page.seo,
    status: "draft",
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  const { data, error } = await getSupabase().from("Page").insert(row).select().single();
  throwOnError(error);
  return data as DbPage;
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
  const pages = await listPages(options.includeDrafts ? undefined : "published");

  const ecommerceEnabled = isEcommerceEnabled(site);
  let products: Product[] | undefined;
  let homepage = rawHomepage ?? undefined;

  if (ecommerceEnabled) {
    const productRows = await listProducts(options.includeDrafts ? undefined : "published");
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
  const { data, error } = await getSupabase()
    .from("PageTemplate")
    .select("*")
    .order("updatedAt", { ascending: false });
  throwOnError(error);
  return data ?? [];
}

export async function getPageTemplateById(id: string) {
  const { data, error } = await getSupabase()
    .from("PageTemplate")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  throwOnError(error);
  return data;
}

export async function createPageTemplate(data: {
  name: string;
  description?: string;
  layout?: string;
  content: ContentDoc;
  sections?: PageSection[];
}) {
  const timestamp = now();
  const row = {
    id: randomUUID(),
    name: data.name,
    description: data.description ?? null,
    layout: data.layout ?? "standard",
    content: JSON.stringify(data.content),
    sections: data.sections ? JSON.stringify(data.sections) : null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  const { data: result, error } = await getSupabase()
    .from("PageTemplate")
    .insert(row)
    .select()
    .single();
  throwOnError(error);
  return result;
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
  const patch: Record<string, unknown> = { updatedAt: now() };
  if (data.name !== undefined) patch.name = data.name;
  if (data.description !== undefined) patch.description = data.description;
  if (data.layout !== undefined) patch.layout = data.layout;
  if (data.content) patch.content = JSON.stringify(data.content);
  if (data.sections === null) patch.sections = null;
  else if (data.sections) patch.sections = JSON.stringify(data.sections);

  const { data: result, error } = await getSupabase()
    .from("PageTemplate")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  throwOnError(error);
  return result;
}

export async function deletePageTemplate(id: string) {
  const { data, error } = await getSupabase()
    .from("PageTemplate")
    .delete()
    .eq("id", id)
    .select()
    .single();
  throwOnError(error);
  return data;
}

export async function listProducts(status?: string) {
  let query = getSupabase().from("Product").select("*").order("updatedAt", { ascending: false });
  if (status) query = query.eq("status", status);
  const { data, error } = await query;
  throwOnError(error);
  return (data ?? []) as DbProduct[];
}

export async function getProductById(id: string) {
  const { data, error } = await getSupabase()
    .from("Product")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  throwOnError(error);
  return data as DbProduct | null;
}

export async function getProductBySlug(slug: string) {
  const { data, error } = await getSupabase()
    .from("Product")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  throwOnError(error);
  return data as DbProduct | null;
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
  const timestamp = now();
  const row = {
    id: randomUUID(),
    slug: data.slug,
    name: data.name,
    description: data.description ?? null,
    shortDescription: data.shortDescription ?? null,
    price: data.price ?? null,
    priceFrom: data.priceFrom ?? null,
    sale: data.sale ?? false,
    salePrice: data.salePrice ?? null,
    image: data.image,
    gallery: JSON.stringify(data.gallery ?? []),
    category: data.category ?? null,
    inStock: data.inStock ?? true,
    seo: serializeSeoForDb(data.seo) ?? null,
    status: data.status ?? "draft",
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  const { data: result, error } = await getSupabase().from("Product").insert(row).select().single();
  throwOnError(error);
  return result as DbProduct;
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
  const patch: Record<string, unknown> = { updatedAt: now() };
  if (data.slug !== undefined) patch.slug = data.slug;
  if (data.name !== undefined) patch.name = data.name;
  if (data.description !== undefined) patch.description = data.description;
  if (data.shortDescription !== undefined) patch.shortDescription = data.shortDescription;
  if (data.price !== undefined) patch.price = data.price;
  if (data.priceFrom !== undefined) patch.priceFrom = data.priceFrom;
  if (data.sale !== undefined) patch.sale = data.sale;
  if (data.salePrice !== undefined) patch.salePrice = data.salePrice;
  if (data.image !== undefined) patch.image = data.image;
  if (data.gallery) patch.gallery = JSON.stringify(data.gallery);
  if (data.category !== undefined) patch.category = data.category;
  if (data.inStock !== undefined) patch.inStock = data.inStock;
  if (data.seo !== undefined) patch.seo = serializeSeoForDb(data.seo);
  if (data.status !== undefined) patch.status = data.status;

  const { data: result, error } = await getSupabase()
    .from("Product")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  throwOnError(error);
  return result as DbProduct;
}

export async function deleteProduct(id: string) {
  const { data, error } = await getSupabase()
    .from("Product")
    .delete()
    .eq("id", id)
    .select()
    .single();
  throwOnError(error);
  return data as DbProduct;
}

export async function createPublishLog(data: { status: string; message?: string }) {
  const row = {
    id: randomUUID(),
    status: data.status,
    message: data.message ?? null,
    createdAt: now(),
  };
  const { data: result, error } = await getSupabase()
    .from("PublishLog")
    .insert(row)
    .select()
    .single();
  throwOnError(error);
  return result as DbPublishLog;
}

export async function listPublishLogs(limit = 10): Promise<DbPublishLog[]> {
  const { data, error } = await getSupabase()
    .from("PublishLog")
    .select("*")
    .order("createdAt", { ascending: false })
    .limit(limit);
  throwOnError(error);
  return (data ?? []) as DbPublishLog[];
}

export async function getLatestPublishLog(): Promise<DbPublishLog | null> {
  const { data, error } = await getSupabase()
    .from("PublishLog")
    .select("*")
    .order("createdAt", { ascending: false })
    .limit(1)
    .maybeSingle();
  throwOnError(error);
  return data as DbPublishLog | null;
}
