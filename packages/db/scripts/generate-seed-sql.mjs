import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contentDir = path.resolve(__dirname, "../../../apps/web/content");

function sqlLiteral(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

function sqlJson(value) {
  return sqlLiteral(JSON.stringify(value));
}

function upsertSiteSettings(site) {
  return `INSERT INTO "SiteSettings" (id, data, "updatedAt")
VALUES ('default', ${sqlJson(site)}, NOW())
ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, "updatedAt" = NOW();`;
}

function upsertHomepage(homepage) {
  return `INSERT INTO "Homepage" (id, data, "updatedAt")
VALUES ('default', ${sqlJson(homepage)}, NOW())
ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, "updatedAt" = NOW();`;
}

function upsertMenu(location, items) {
  const id = randomUUID();
  return `INSERT INTO "Menu" (id, location, items, "updatedAt")
VALUES (${sqlLiteral(id)}, ${sqlLiteral(location)}, ${sqlJson(items)}, NOW())
ON CONFLICT (location) DO UPDATE SET items = EXCLUDED.items, "updatedAt" = NOW();`;
}

function upsertPage(page) {
  const id = randomUUID();
  const sections = page.sections ? sqlJson(page.sections) : "NULL";
  const seo = page.seo ? sqlJson(page.seo) : "NULL";
  return `INSERT INTO "Page" (
    id, slug, title, template, layout, sections, content, seo, status, "createdAt", "updatedAt"
  ) VALUES (
    ${sqlLiteral(id)},
    ${sqlLiteral(page.slug)},
    ${sqlLiteral(page.title)},
    ${sqlLiteral(page.template ?? "page")},
    ${sqlLiteral(page.layout ?? "standard")},
    ${sections},
    ${sqlJson(page.content)},
    ${seo},
    'published',
    NOW(),
    NOW()
  )
  ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    template = EXCLUDED.template,
    layout = EXCLUDED.layout,
    sections = EXCLUDED.sections,
    content = EXCLUDED.content,
    seo = EXCLUDED.seo,
    status = EXCLUDED.status,
    "updatedAt" = NOW();`;
}

const site = JSON.parse(fs.readFileSync(path.join(contentDir, "site.json"), "utf8"));
const menus = JSON.parse(fs.readFileSync(path.join(contentDir, "menus.json"), "utf8"));
const homepage = fs.existsSync(path.join(contentDir, "homepage.json"))
  ? JSON.parse(fs.readFileSync(path.join(contentDir, "homepage.json"), "utf8"))
  : null;

const statements = [
  upsertSiteSettings(site),
  upsertMenu("header", menus.header),
  upsertMenu("footer", menus.footer),
];

if (homepage) {
  statements.push(upsertHomepage(homepage));
}

for (const file of fs.readdirSync(path.join(contentDir, "pages"))) {
  if (!file.endsWith(".json")) continue;
  const page = JSON.parse(fs.readFileSync(path.join(contentDir, "pages", file), "utf8"));
  statements.push(upsertPage(page));
}

process.stdout.write(statements.join("\n\n"));
