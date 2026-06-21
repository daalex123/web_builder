import fs from "fs";
import path from "path";
import {
  contentDocSchema,
  homepageSchema,
  menusSchema,
  pageSchema,
  productSchema,
  siteContentSchema,
  siteSettingsSchema,
  type ContentDoc,
  type Homepage,
  type Menus,
  type Page,
  type Product,
  type SiteContent,
  type SiteSettings,
} from "./schemas";

function readJsonFile<T>(filePath: string): T {
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as T;
}

function readPages(contentDir: string): Page[] {
  const pagesDir = path.join(contentDir, "pages");
  if (!fs.existsSync(pagesDir)) return [];

  return fs
    .readdirSync(pagesDir)
    .filter((file) => file.endsWith(".json"))
    .map((file) => pageSchema.parse(readJsonFile(path.join(pagesDir, file))));
}

function normalizeProductFromDisk(raw: unknown) {
  if (!raw || typeof raw !== "object") return raw;
  const product = { ...(raw as Record<string, unknown>) };
  if (typeof product.seo === "string") {
    try {
      let parsed: unknown = JSON.parse(product.seo);
      if (typeof parsed === "string") {
        parsed = JSON.parse(parsed);
      }
      product.seo = parsed;
    } catch {
      delete product.seo;
    }
  }
  return product;
}

function readProducts(contentDir: string): Product[] {
  const productsPath = path.join(contentDir, "products.json");
  if (!fs.existsSync(productsPath)) return [];

  const raw = readJsonFile<unknown[]>(productsPath);
  return raw.map((item) => productSchema.parse(normalizeProductFromDisk(item)));
}

export function getContentDir(): string {
  return process.env.CMS_CONTENT_DIR ?? path.join(process.cwd(), "content");
}

export function loadContent(contentDir = getContentDir()): SiteContent {
  const site = siteSettingsSchema.parse(
    readJsonFile(path.join(contentDir, "site.json")),
  );
  const menus = menusSchema.parse(
    readJsonFile(path.join(contentDir, "menus.json")),
  );
  const pages = readPages(contentDir);

  const homepagePath = path.join(contentDir, "homepage.json");
  const homepage = fs.existsSync(homepagePath)
    ? homepageSchema.parse(readJsonFile(homepagePath))
    : undefined;

  const productsPath = path.join(contentDir, "products.json");
  const products = fs.existsSync(productsPath) ? readProducts(contentDir) : undefined;

  return siteContentSchema.parse({ site, menus, pages, homepage, products });
}

export function getPageBySlug(
  content: SiteContent,
  slug: string,
): Page | undefined {
  return content.pages.find((page) => page.slug === slug);
}

export function getHomePage(content: SiteContent): Page | undefined {
  return (
    content.pages.find((page) => page.template === "home") ??
    content.pages.find((page) => page.slug === "home")
  );
}

export function emptyDoc(): ContentDoc {
  return contentDocSchema.parse({ type: "doc", content: [] });
}

export function getProductBySlug(
  content: SiteContent,
  slug: string,
): Product | undefined {
  return content.products?.find((product) => product.slug === slug);
}

export type { SiteContent, SiteSettings, Menus, Page, ContentDoc, Homepage, Product };
