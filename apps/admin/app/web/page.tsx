import {
  buildPageMetadata,
  buildWebsiteJsonLd,
  getHomePage,
  resolveHomepageRenderMode,
  type PageLayout,
} from "@cms/shared";
import type { Metadata } from "next";
import { loadPreviewContentAsync } from "@preview/preview-content";
import { FinezHomepage } from "@preview/themes/finez/homepage";
import { FurnitureHomepage } from "@preview/themes/furniture/homepage";
import { getThemeComponents, ThemeShell } from "@preview/themes/index";
import { HomeTemplate } from "@preview/themes/default/templates";
import { PageLayoutRenderer } from "@preview/layouts/index";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const content = await loadPreviewContentAsync();
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

export default async function WebHomePage() {
  const content = await loadPreviewContentAsync();
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
