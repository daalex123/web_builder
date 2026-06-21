import {
  buildPageMetadata,
  buildWebsiteJsonLd,
  getHomePage,
  loadContent,
  resolveHomepageRenderMode,
} from "@cms/shared";
import type { Metadata } from "next";
import type { PageLayout } from "@cms/shared";
import { FinezHomepage } from "@/themes/finez/homepage";
import { FurnitureHomepage } from "@/themes/furniture/homepage";
import { getThemeComponents, ThemeShell } from "@/themes/index";
import { HomeTemplate } from "@/themes/default/templates";
import { PageLayoutRenderer } from "@/layouts/index";

export function generateMetadata(): Metadata {
  const content = loadContent();
  const homePage = getHomePage(content);
  const mode = resolveHomepageRenderMode(content);

  if (mode === "builder" && homePage) {
    return buildPageMetadata(content.site, homePage);
  }

  const { site } = content;
  return {
    title: site.defaultSeo?.metaTitle ?? site.name,
    description: site.defaultSeo?.metaDescription ?? site.description,
  };
}

export default function HomePage() {
  const content = loadContent();
  const homePage = getHomePage(content);
  const { JsonLd } = getThemeComponents(content.site.theme);
  const mode = resolveHomepageRenderMode(content);

  if (!homePage && mode !== "structured") {
    return (
      <main>
        <p className="p-8 text-center text-neutral-500">No home page configured.</p>
      </main>
    );
  }

  return (
    <>
      <JsonLd data={buildWebsiteJsonLd(content.site)} />
      <ThemeShell
        site={content.site}
        menu={content.menus.header}
        footerMenu={content.menus.footer}
      >
        {mode === "builder" && homePage ? (
          <PageLayoutRenderer
            title={homePage.title}
            content={homePage.content}
            sections={homePage.sections}
            layout={(homePage.layout ?? "homepage") as PageLayout}
          />
        ) : mode === "structured" && content.site.theme === "finez" && content.homepage ? (
          <FinezHomepage data={content.homepage} />
        ) : mode === "structured" && content.homepage ? (
          <FurnitureHomepage data={content.homepage} />
        ) : homePage ? (
          <HomeTemplate title={homePage.title} content={homePage.content} />
        ) : (
          <main>
            <p className="p-8 text-center text-neutral-500">No home page configured.</p>
          </main>
        )}
      </ThemeShell>
    </>
  );
}
