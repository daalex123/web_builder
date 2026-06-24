import { RenderSections } from "../render-sections";
import { findFirstShowcaseSection } from "./utils";
import type { LayoutShellProps } from "./index";

export function SplitHeroLayout({ title, body, blocks, sections, suppressTitle }: LayoutShellProps) {
  const hero = sections.find((s) => s.type === "hero");

  if (!hero) {
    const showcase = findFirstShowcaseSection(sections);
    if (showcase) {
      return (
        <article>
          <RenderSections sections={[showcase]} layout="full-width" />
          <div className="mx-auto max-w-5xl px-6 py-12">
            {blocks ? <div className="mb-10">{blocks}</div> : null}
            <div className="prose-content">{body}</div>
          </div>
        </article>
      );
    }
  }

  return (
    <article>
      <div className="grid min-h-[420px] lg:grid-cols-2">
        <div className="flex flex-col justify-center bg-gray-900 px-8 py-16 text-white lg:px-16">
          {!suppressTitle ? (
            <h1 className="text-4xl font-bold md:text-5xl">
              {hero && hero.type === "hero" ? hero.title : title}
            </h1>
          ) : null}
          {hero && hero.type === "hero" && hero.subtitle ? (
            <p className="mt-4 text-lg text-gray-300">{hero.subtitle}</p>
          ) : null}
          {hero && hero.type === "hero" && hero.ctaLabel && hero.ctaHref ? (
            <a
              href={hero.ctaHref}
              className="mt-8 inline-block w-fit rounded-lg bg-white px-6 py-3 font-semibold text-gray-900"
            >
              {hero.ctaLabel}
            </a>
          ) : null}
        </div>
        <div
          className="min-h-[280px] bg-gray-200 bg-cover bg-center"
          style={{
            backgroundImage:
              hero && hero.type === "hero" && hero.image ? `url(${hero.image})` : undefined,
          }}
        />
      </div>
      <div className="mx-auto max-w-5xl px-6 py-12">
        {blocks ? <div className="mb-10">{blocks}</div> : null}
        <div className="prose-content">{body}</div>
      </div>
    </article>
  );
}
