"use client";

import { useEffect, useState } from "react";
import type { HeroSlide } from "@cms/shared";
import { useFurnitureTheme } from "./context";

export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const variant = useFurnitureTheme();
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const slide = slides[active];

  if (variant.heroStyle === "split" && slides.length >= 3) {
    return (
      <section className="grid lg:grid-cols-3">
        {slides.slice(0, 3).map((item) => (
          <a
            key={item.title}
            href={item.ctaHref}
            className="group relative flex min-h-[320px] items-end overflow-hidden sm:min-h-[420px]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.image}
              alt={item.title}
              className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="relative p-8 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
                {item.subtitle.split(" ")[0]}
              </p>
              <h2 className="mt-2 text-2xl font-light tracking-wide">{item.title}</h2>
              <span className="mt-4 inline-block text-xs font-semibold tracking-[0.15em] underline-offset-4 group-hover:underline">
                {item.ctaLabel}
              </span>
            </div>
          </a>
        ))}
      </section>
    );
  }

  return (
    <section className="relative h-[420px] overflow-hidden bg-neutral-900 sm:h-[520px] lg:h-[600px]">
      {slides.map((item, index) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={item.title + index}
          src={item.image}
          alt={item.title}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            index === active ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-center px-6 text-white">
        <h2 className="max-w-xl text-3xl font-light tracking-wide sm:text-4xl lg:text-5xl">
          {slide.title}
        </h2>
        <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/90 sm:text-base">
          {slide.subtitle}
        </p>
        <a
          href={slide.ctaHref}
          className={`mt-8 inline-block w-fit border border-white px-8 py-3 text-xs font-semibold tracking-[0.2em] transition ${variant.accentHover}`}
        >
          {slide.ctaLabel}
        </a>
      </div>
      {slides.length > 1 ? (
        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Go to slide ${index + 1}`}
              onClick={() => setActive(index)}
              className={`h-2 w-2 rounded-full transition ${
                index === active ? "bg-white" : "bg-white/40"
              }`}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
