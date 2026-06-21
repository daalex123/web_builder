import {
  buildPageMetadata,
  buildWebPageJsonLd,
  getPageBySlug,
  loadContent,
  type PageLayout,
} from "@cms/shared";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageLayoutRenderer } from "@/layouts/index";
import { getThemeComponents, ThemeShell } from "@/themes/index";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  const content = loadContent();
  return content.pages
    .filter((page) => page.slug !== "home")
    .map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const content = loadContent();
  const page = getPageBySlug(content, slug);
  if (!page) return {};
  return buildPageMetadata(content.site, page);
}

export default async function PageRoute({ params }: Props) {
  const { slug } = await params;
  const content = loadContent();
  const page = getPageBySlug(content, slug);

  if (!page || page.slug === "home") {
    notFound();
  }

  const url = `${content.site.url}/${page.slug}/`;
  const { JsonLd } = getThemeComponents(content.site.theme);
  const defaultLayout = page.template === "home" ? "homepage" : "standard";
  const layout = (page.layout ?? defaultLayout) as PageLayout;

  return (
    <>
      <JsonLd
        data={buildWebPageJsonLd(
          content.site,
          page.title,
          url,
          page.seo?.metaDescription,
        )}
      />
      <ThemeShell
        site={content.site}
        menu={content.menus.header}
        footerMenu={content.menus.footer}
      >
        <PageLayoutRenderer
          title={page.title}
          content={page.content}
          sections={page.sections}
          layout={layout}
        />
      </ThemeShell>
    </>
  );
}
