import type { CSSProperties, ReactNode } from "react";
import type { PageLayout, PageSection } from "./layouts";
import type { NestedSection } from "./nested-sections";
import type { SectionStyles } from "./section-styles";
import { normalizeColumnCells } from "./nested-sections";
import { shouldFullBleed } from "./section-layout";
import { sectionStylesToCss } from "./section-styles";
import { WidgetSlider } from "./widgets/slider";
import { WidgetVideo } from "./widgets/video";
import { WidgetProductCardView } from "./widgets/product-card";
import { WidgetProductSlider } from "./widgets/product-slider";

type SectionGroup = { fullBleed: boolean; sections: PageSection[] };

function groupSectionsByBleed(sections: PageSection[], layout: PageLayout): SectionGroup[] {
  const groups: SectionGroup[] = [];

  for (const section of sections) {
    const fullBleed = shouldFullBleed(section, layout);
    const last = groups[groups.length - 1];
    if (last && last.fullBleed === fullBleed) {
      last.sections.push(section);
    } else {
      groups.push({ fullBleed, sections: [section] });
    }
  }

  return groups;
}

export function RenderSections({
  sections,
  layout = "standard",
}: {
  sections: PageSection[];
  layout?: PageLayout;
}) {
  if (!sections.length) return null;

  const groups = groupSectionsByBleed(sections, layout);

  return (
    <>
      {groups.map((group, index) =>
        group.fullBleed ? (
          <div key={`bleed-${index}`} className="flex w-full flex-col gap-0">
            {group.sections.map((section) => (
              <SectionBlock key={section.id} section={section} fullBleed />
            ))}
          </div>
        ) : (
          <div key={`contained-${index}`} className="mx-auto w-full max-w-7xl px-6">
            <div className="space-y-12 py-12">
              {group.sections.map((section) => (
                <SectionBlock key={section.id} section={section} fullBleed={false} />
              ))}
            </div>
          </div>
        ),
      )}
    </>
  );
}

function SectionShell({ section, children }: { section: { styles?: SectionStyles }; children: ReactNode }) {
  const style = sectionStylesToCss(section.styles);
  if (!Object.keys(style).length) return <>{children}</>;
  return <div style={style}>{children}</div>;
}

function SectionBlock({ section, fullBleed }: { section: PageSection; fullBleed: boolean }) {
  switch (section.type) {
    case "hero":
      return (
        <SectionShell section={section}>
          <section
            className={
              fullBleed
                ? "relative flex min-h-[420px] items-center overflow-hidden bg-gradient-to-br from-slate-900 to-slate-700 px-6 py-20 text-white md:min-h-[520px]"
                : "relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 px-8 py-16 text-white"
            }
          >
            {section.image ? (
              <div
                className={`absolute inset-0 bg-cover bg-center ${fullBleed ? "opacity-40" : "opacity-30"}`}
                style={{ backgroundImage: `url(${section.image})` }}
              />
            ) : null}
            <div
              className={
                fullBleed ? "relative mx-auto w-full max-w-4xl text-center" : "relative max-w-2xl"
              }
            >
              {fullBleed ? (
                <h1 className="text-4xl font-bold md:text-5xl lg:text-6xl">{section.title}</h1>
              ) : (
                <h2 className="text-3xl font-bold md:text-4xl">{section.title}</h2>
              )}
              {section.subtitle ? (
                <p className={`mt-4 text-lg text-slate-200 ${fullBleed ? "md:text-xl" : ""}`}>
                  {section.subtitle}
                </p>
              ) : null}
              {section.ctaLabel && section.ctaHref ? (
                <a
                  href={section.ctaHref}
                  className="mt-6 inline-block rounded-lg bg-white px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100"
                >
                  {section.ctaLabel}
                </a>
              ) : null}
            </div>
          </section>
        </SectionShell>
      );

    case "text":
      return (
        <SectionShell section={section}>
          <section>
            {section.heading ? <h2 className="mb-4 text-2xl font-semibold text-gray-900">{section.heading}</h2> : null}
            <p className="whitespace-pre-wrap text-gray-600 leading-relaxed">{section.body}</p>
          </section>
        </SectionShell>
      );

    case "image":
      return (
        <SectionShell section={section}>
          <figure>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={section.src} alt={section.alt ?? ""} className="w-full rounded-xl object-cover" />
            {section.caption ? <figcaption className="mt-2 text-center text-sm text-gray-500">{section.caption}</figcaption> : null}
          </figure>
        </SectionShell>
      );

    case "columns": {
      const cells = normalizeColumnCells(section.columns);
      const widths =
        section.widths && section.widths.length === cells.length
          ? section.widths
          : new Array(cells.length).fill(100 / cells.length);
      return (
        <SectionShell section={section}>
          <section
            className="grid gap-8"
            style={{ gridTemplateColumns: widths.map((w) => `minmax(0, ${w}fr)`).join(" ") }}
          >
            {cells.map((col) => (
              <div key={col.id} className="rounded-xl border border-gray-200 p-6">
                {col.title ? <h3 className="text-lg font-semibold text-gray-900">{col.title}</h3> : null}
                {col.body ? <p className="mt-2 text-gray-600">{col.body}</p> : null}
                {col.widgets.length > 0 ? (
                  <div className="mt-4 space-y-6">
                    {col.widgets.map((widget) => (
                      <NestedSectionBlock key={widget.id} section={widget} />
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </section>
        </SectionShell>
      );
    }

    case "cta":
      return (
        <SectionShell section={section}>
          <section className="rounded-2xl bg-blue-600 px-8 py-12 text-center text-white">
            <h2 className="text-2xl font-bold">{section.title}</h2>
            <p className="mx-auto mt-3 max-w-xl text-blue-100">{section.body}</p>
            <a
              href={section.buttonHref}
              className="mt-6 inline-block rounded-lg bg-white px-6 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-50"
            >
              {section.buttonLabel}
            </a>
          </section>
        </SectionShell>
      );

    case "features":
      return (
        <SectionShell section={section}>
          <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {section.items.map((item, i) => (
              <div key={i} className="rounded-xl bg-gray-50 p-6">
                <h3 className="font-semibold text-gray-900">{item.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{item.body}</p>
              </div>
            ))}
          </section>
        </SectionShell>
      );

    case "gallery":
      return (
        <SectionShell section={section}>
          <section className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {section.images.map((img, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={img.src} alt={img.alt ?? ""} className="aspect-square w-full rounded-lg object-cover" />
            ))}
          </section>
        </SectionShell>
      );

    case "slider":
      return (
        <SectionShell section={section}>
          <WidgetSlider
            slides={section.slides}
            effect={section.effect}
            autoplay={section.autoplay}
            interval={section.interval}
            pauseOnHover={section.pauseOnHover}
            loop={section.loop}
            showArrows={section.showArrows}
            showDots={section.showDots}
            showProgress={section.showProgress}
            height={section.height}
            kenBurns={section.kenBurns}
            overlay={section.overlay}
            arrowStyle={section.arrowStyle}
            dotStyle={section.dotStyle}
            fullBleed={fullBleed}
            styles={section.styles}
          />
        </SectionShell>
      );

    case "testimonials":
      return (
        <SectionShell section={section}>
          <section>
            {section.heading ? <h2 className="mb-8 text-center text-2xl font-semibold text-gray-900">{section.heading}</h2> : null}
            <div className="grid gap-6 md:grid-cols-2">
              {section.items.map((item, i) => (
                <blockquote key={i} className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
                  <p className="text-gray-700 italic">&ldquo;{item.quote}&rdquo;</p>
                  <footer className="mt-4 flex items-center gap-3">
                    {item.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.avatar} alt={item.author} className="h-10 w-10 rounded-full object-cover" />
                    ) : null}
                    <div>
                      <cite className="font-semibold text-gray-900 not-italic">{item.author}</cite>
                      {item.role ? <p className="text-sm text-gray-500">{item.role}</p> : null}
                    </div>
                  </footer>
                </blockquote>
              ))}
            </div>
          </section>
        </SectionShell>
      );

    case "stats":
      return (
        <SectionShell section={section}>
          <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {section.items.map((item, i) => (
              <div key={i} className="rounded-2xl bg-slate-900 px-6 py-8 text-center text-white">
                <p className="text-3xl font-bold">{item.value}</p>
                <p className="mt-2 text-sm text-slate-300">{item.label}</p>
              </div>
            ))}
          </section>
        </SectionShell>
      );

    case "video":
      return (
        <SectionShell section={section}>
          <WidgetVideo
            url={section.url}
            poster={section.poster}
            caption={section.caption}
            fullBleed={fullBleed}
          />
        </SectionShell>
      );

    case "spacer":
      return (
        <SectionShell section={section}>
          <div style={{ height: section.height ?? 48 }} aria-hidden />
        </SectionShell>
      );

    case "divider":
      return (
        <SectionShell section={section}>
          {section.variant === "dots" ? (
            <div className="flex justify-center gap-2 py-4">
              <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />
              <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />
              <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />
            </div>
          ) : (
            <hr className="border-gray-200" />
          )}
        </SectionShell>
      );

    case "faq":
      return (
        <SectionShell section={section}>
          <section>
            {section.heading ? <h2 className="mb-6 text-2xl font-semibold text-gray-900">{section.heading}</h2> : null}
            <div className="space-y-3">
              {section.items.map((item, i) => (
                <details key={i} className="group rounded-xl border border-gray-200 bg-white p-4">
                  <summary className="cursor-pointer font-medium text-gray-900">{item.question}</summary>
                  <p className="mt-3 text-gray-600 leading-relaxed">{item.answer}</p>
                </details>
              ))}
            </div>
          </section>
        </SectionShell>
      );

    case "featured-products": {
      const columns = section.columns ?? 4;
      const gridClass =
        columns === 2
          ? "grid-cols-2"
          : columns === 3
            ? "sm:grid-cols-2 lg:grid-cols-3"
            : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4";
      const items = section.products ?? [];
      return (
        <SectionShell section={section}>
          <section>
            {section.heading ? (
              <h2 className="mb-8 text-center text-2xl font-light tracking-wide text-neutral-900">
                {section.heading}
              </h2>
            ) : null}
            {items.length ? (
              <div className={`grid gap-6 ${gridClass}`}>
                {items.map((product) => (
                  <WidgetProductCardView key={`${product.name}-${product.image}`} product={product} />
                ))}
              </div>
            ) : (
              <p className="text-center text-sm text-gray-500">No products to display.</p>
            )}
          </section>
        </SectionShell>
      );
    }

    case "category-products": {
      const items = section.products ?? [];
      return (
        <SectionShell section={section}>
          <section>
            <div className="max-w-2xl">
              <h2 className="text-3xl font-light text-neutral-900">{section.title}</h2>
              <p className="mt-4 text-sm leading-relaxed text-neutral-600">{section.subtitle}</p>
              <a
                href={section.ctaHref}
                className="mt-4 inline-block text-xs font-semibold tracking-[0.15em] text-neutral-900 underline-offset-4 hover:underline"
              >
                {section.ctaLabel}
              </a>
            </div>
            {items.length ? (
              <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
                {items.map((product) => (
                  <WidgetProductCardView key={`${product.name}-${product.image}`} product={product} />
                ))}
              </div>
            ) : (
              <p className="mt-8 text-sm text-gray-500">No products in this category section.</p>
            )}
          </section>
        </SectionShell>
      );
    }

    case "product-slider":
      return (
        <SectionShell section={section}>
          <WidgetProductSlider
            products={section.products ?? []}
            heading={section.heading}
            autoplay={section.autoplay}
            interval={section.interval}
            showArrows={section.showArrows}
            showDots={section.showDots}
          />
        </SectionShell>
      );
  }
}

function NestedSectionBlock({ section }: { section: NestedSection }) {
  return <SectionBlock section={section as PageSection} fullBleed={false} />;
}

export function getColumnGridStyle(section: Extract<PageSection, { type: "columns" }>): CSSProperties {
  const cells = normalizeColumnCells(section.columns);
  const widths =
    section.widths && section.widths.length === cells.length
      ? section.widths
      : new Array(cells.length).fill(100 / cells.length);

  return { gridTemplateColumns: widths.map((w) => `minmax(0, ${w}fr)`).join(" ") };
}
