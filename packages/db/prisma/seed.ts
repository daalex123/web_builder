import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  upsertHomepage,
  upsertMenu,
  upsertSiteSettings,
} from "../src/queries";
import { prisma } from "../src/client";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
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
    await prisma.page.upsert({
      where: { slug: page.slug },
      create: {
        slug: page.slug,
        title: page.title,
        template: page.template ?? "page",
        content: JSON.stringify(page.content),
        seo: page.seo ? JSON.stringify(page.seo) : null,
        status: "published",
      },
      update: {
        title: page.title,
        template: page.template ?? "page",
        content: JSON.stringify(page.content),
        seo: page.seo ? JSON.stringify(page.seo) : null,
        status: "published",
      },
    });
  }

  console.log("Database seeded from apps/web/content");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
