import type { Homepage } from "@cms/shared";
import { HeroCarousel } from "./hero-carousel";
import { ProductCard } from "./product-card";

export function FinezHomepage({ data }: { data: Homepage }) {
  return (
    <>
      <HeroCarousel slides={data.heroSlides} />

      <section className="border-b border-neutral-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-neutral-200 lg:grid-cols-4">
          {data.features.map((feature) => (
            <div key={feature.title} className="px-6 py-8 text-center">
              <p className="text-sm font-medium text-neutral-900">{feature.title}</p>
              <p className="text-lg font-light text-neutral-700">{feature.subtitle}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="text-center text-2xl font-light tracking-wide text-neutral-900">
          Best Sellers
        </h2>
        <div className="mt-6 flex flex-wrap justify-center gap-4 border-b border-neutral-200 pb-4">
          {data.bestSellerTabs.map((tab, index) => (
            <button
              key={tab}
              type="button"
              className={`text-xs font-semibold tracking-[0.15em] ${
                index === 0 ? "text-neutral-900" : "text-neutral-400"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {data.bestSellers.map((product) => (
            <ProductCard key={product.name} product={product} />
          ))}
        </div>
      </section>

      <section className="bg-neutral-50 py-16">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-center text-2xl font-light tracking-wide text-neutral-900">
            Shop the Look
          </h2>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {data.shopTheLook.map((item) => (
              <a
                key={item.title}
                href={item.href ?? "#"}
                className="group relative overflow-hidden"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt={item.title}
                  className="aspect-[3/4] w-full object-cover transition group-hover:scale-105"
                />
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent p-4">
                  <span className="text-sm font-medium text-white">{item.title}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {data.categorySections.map((section) => (
        <section key={section.title} className="mx-auto max-w-7xl px-6 py-16">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-light text-neutral-900">{section.title}</h2>
            <p className="mt-4 text-sm leading-relaxed text-neutral-600">
              {section.subtitle}
            </p>
            <a
              href={section.ctaHref}
              className="mt-6 inline-block border border-neutral-900 px-6 py-2 text-xs font-semibold tracking-[0.15em] transition hover:bg-neutral-900 hover:text-white"
            >
              {section.ctaLabel}
            </a>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {section.products.map((product) => (
              <ProductCard key={product.name} product={product} />
            ))}
          </div>
        </section>
      ))}

      <section className="bg-neutral-100 py-20 text-center">
        <div className="mx-auto max-w-2xl px-6">
          <h2 className="text-3xl font-light text-neutral-900">{data.ctaBanner.title}</h2>
          <p className="mt-4 text-sm leading-relaxed text-neutral-600">
            {data.ctaBanner.body}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="text-center text-2xl font-light text-neutral-900">
          The Trust We&apos;ve Earned
        </h2>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {data.testimonials.map((item) => (
            <blockquote
              key={item.name}
              className="border border-neutral-200 bg-white p-6 text-sm leading-relaxed text-neutral-600"
            >
              <p>&ldquo;{item.quote}&rdquo;</p>
              <footer className="mt-4 font-medium text-neutral-900">{item.name}</footer>
            </blockquote>
          ))}
        </div>
      </section>

      <section className="bg-neutral-50 py-16">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-center text-2xl font-light text-neutral-900">
            Our Commitment
          </h2>
          <div className="mt-10 grid gap-8 md:grid-cols-2">
            {data.commitments.map((item) => (
              <div key={item.title} className="bg-white p-8">
                <h3 className="text-lg font-medium text-neutral-900">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-neutral-600">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 text-center">
        <h2 className="text-2xl font-light text-neutral-900">{data.instagram.title}</h2>
        <p className="mx-auto mt-3 max-w-lg text-sm text-neutral-600">
          {data.instagram.subtitle}
        </p>
        <a
          href={data.instagram.ctaHref}
          className="mt-6 inline-block border border-neutral-900 px-8 py-3 text-xs font-semibold tracking-[0.15em] transition hover:bg-neutral-900 hover:text-white"
        >
          {data.instagram.ctaLabel}
        </a>
      </section>

      <section className="bg-neutral-900 py-16 text-center text-white">
        <h2 className="text-xl font-light">{data.newsletter.title}</h2>
        <button
          type="button"
          className="mt-6 border border-white px-8 py-3 text-xs font-semibold tracking-[0.2em] transition hover:bg-white hover:text-neutral-900"
        >
          {data.newsletter.ctaLabel}
        </button>
      </section>
    </>
  );
}
