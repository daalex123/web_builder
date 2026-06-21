"use client";

import { useCallback, useEffect, useState } from "react";
import { WidgetProductCardView, type WidgetProductCard } from "./product-card";

export function WidgetProductSlider({
  products,
  heading,
  autoplay = true,
  interval = 5,
  showArrows = true,
  showDots = true,
}: {
  products: WidgetProductCard[];
  heading?: string;
  autoplay?: boolean;
  interval?: number;
  showArrows?: boolean;
  showDots?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = products.length;
  const canNavigate = count > 1;

  const goTo = useCallback(
    (next: number) => {
      if (!count) return;
      setIndex(((next % count) + count) % count);
    },
    [count],
  );

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  useEffect(() => {
    if (!autoplay || !canNavigate || paused) return;
    const timer = setInterval(next, interval * 1000);
    return () => clearInterval(timer);
  }, [autoplay, interval, canNavigate, paused, next]);

  if (!count) {
    return (
      <section className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center text-sm text-gray-500">
        No products selected
      </section>
    );
  }

  const current = products[index]!;

  return (
    <section
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {heading ? (
        <h2 className="mb-8 text-center text-2xl font-light tracking-wide text-neutral-900">
          {heading}
        </h2>
      ) : null}

      <div className="relative mx-auto max-w-sm">
        <WidgetProductCardView product={current} />

        {showArrows && canNavigate ? (
          <>
            <button
              type="button"
              aria-label="Previous product"
              className="absolute -left-2 top-1/3 z-10 -translate-y-1/2 rounded-full bg-white px-3 py-2 text-lg shadow-md hover:bg-gray-50 md:-left-12"
              onClick={prev}
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Next product"
              className="absolute -right-2 top-1/3 z-10 -translate-y-1/2 rounded-full bg-white px-3 py-2 text-lg shadow-md hover:bg-gray-50 md:-right-12"
              onClick={next}
            >
              ›
            </button>
          </>
        ) : null}
      </div>

      {showDots && canNavigate ? (
        <div className="mt-6 flex justify-center gap-2">
          {products.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to product ${i + 1}`}
              className={`h-2 w-2 rounded-full transition ${i === index ? "bg-neutral-900" : "bg-neutral-300"}`}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
