import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  upsertHomepage,
  upsertMenu,
  upsertSiteSettings,
  getPageBySlug,
  createPage,
} from "../src/queries";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile(path.resolve(__dirname, "../../../apps/admin/.env.local"));
loadEnvFile(path.resolve(__dirname, "../.env"));

const contentDir = path.resolve(__dirname, "../../../apps/web/content");

async function main() {
  const site = JSON.parse(
    fs.readFileSync(path.join(contentDir, "site.json"), "utf-8"),
  );
  const menus = JSON.parse(
    fs.readFileSync(path.join(contentDir, "menus.json"), "utf-8"),
  );
  const homepage = fs.existsSync(path.join(contentDir, "homepage.json"))
    ? JSON.parse(fs.readFileSync(path.join(contentDir, "homepage.json"), "utf-8"))
    : null;

  await upsertSiteSettings(site);
  await upsertMenu("header", menus.header);
  await upsertMenu("footer", menus.footer);
  if (homepage) {
    await upsertHomepage(homepage);
  }

  const pagesDir = path.join(contentDir, "pages");
  for (const file of fs.readdirSync(pagesDir)) {
    if (!file.endsWith(".json")) continue;
    const page = JSON.parse(fs.readFileSync(path.join(pagesDir, file), "utf-8"));
    const existing = await getPageBySlug(page.slug);
    const payload = {
      slug: page.slug,
      title: page.title,
      template: page.template ?? "page",
      layout: page.layout ?? "standard",
      sections: page.sections,
      content: page.content,
      seo: page.seo,
      status: "published" as const,
    };

    if (existing) {
      const { updatePage } = await import("../src/queries");
      await updatePage(existing.id, payload);
    } else {
      await createPage(payload);
    }
  }

  console.log("Database seeded from apps/web/content");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
