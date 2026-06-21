"use client";

import { useCallback, useEffect, useState } from "react";
import type { SectionStyles } from "../section-styles";
import {
  HEIGHT_STYLES,
  normalizeSlide,
  resolveSliderSettings,
  type SlideItem,
  type SliderSettings,
} from "./slider-types";

export type { SlideItem, SliderSettings } from "./slider-types";

const SLIDER_TITLE_CLASSES: Record<
  NonNullable<SectionStyles["titleSize"]>,
  string
> = {
  sm: "text-2xl font-bold leading-tight md:text-3xl",
  md: "text-3xl font-bold leading-tight md:text-4xl lg:text-5xl",
  lg: "text-4xl font-bold leading-tight md:text-5xl lg:text-6xl",
  xl: "text-5xl font-bold leading-tight md:text-6xl lg:text-7xl",
};

type WidgetSliderProps = SliderSettings & {
  slides: SlideItem[];
  fullBleed?: boolean;
  styles?: SectionStyles;
};

function resolveHeightStyle(height: keyof typeof HEIGHT_STYLES) {
  const h = HEIGHT_STYLES[height];
  return {
    minHeight: h.minHeight,
    height: h.height,
    maxHeight: h.maxHeight === "none" ? undefined : h.maxHeight,
  };
}

function resolveSlideAlign(slide: SlideItem, styles?: SectionStyles) {
  return slide.align ?? styles?.textAlign ?? "left";
}

export function WidgetSlider({
  slides,
  fullBleed = false,
  styles,
  ...settingsInput
}: WidgetSliderProps) {
  const settings = resolveSliderSettings(settingsInput);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [animKey, setAnimKey] = useState(0);

  const count = slides.length;
  const canNavigate = count > 1;

  const goTo = useCallback(
    (next: number) => {
      if (!count) return;
      const target = settings.loop
        ? ((next % count) + count) % count
        : Math.max(0, Math.min(count - 1, next));
      setIndex(target);
      setAnimKey((k) => k + 1);
      setProgress(0);
    },
    [count, settings.loop],
  );

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  useEffect(() => {
    if (!settings.autoplay || !canNavigate || paused) return;

    const tick = 50;
    const step = (tick / (settings.interval * 1000)) * 100;
    const timer = setInterval(() => {
      setProgress((p) => {
        if (p + step >= 100) {
          next();
          return 0;
        }
        return p + step;
      });
    }, tick);

    return () => clearInterval(timer);
  }, [settings.autoplay, settings.interval, canNavigate, paused, index, next]);

  if (!count) return null;

  const slide = normalizeSlide(slides[index]);
  const align = resolveSlideAlign(slide, styles);
  const valign = slide.valign ?? "center";

  const valignClass =
    valign === "top" ? "justify-start" : valign === "bottom" ? "justify-end" : "justify-center";

  const contentPositionClass =
    align === "center" ? "mx-auto items-center" : align === "right" ? "ml-auto items-end" : "items-start";

  const textAlignClass =
    align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left";

  const buttonRowClass =
    align === "center" ? "justify-center" : align === "right" ? "justify-end" : "justify-start";

  const titleColor = styles?.textColor ?? "#ffffff";
  const subtitleColor = styles?.subTextColor ?? titleColor;
  const titleClass = SLIDER_TITLE_CLASSES[styles?.titleSize ?? "lg"];

  const overlayClass =
    settings.overlay === "none"
      ? ""
      : settings.overlay === "solid"
        ? "bg-black/45"
        : "bg-gradient-to-t from-black/75 via-black/35 to-black/10";

  const effectClass =
    settings.effect === "zoom"
      ? "animate-slider-zoom"
      : settings.effect === "slide"
        ? "animate-slider-slide"
        : settings.effect === "crossfade"
          ? "animate-slider-crossfade"
          : "animate-slider-fade";

  const arrowBase =
    settings.arrowStyle === "minimal"
      ? "bg-transparent text-white hover:bg-white/15 border border-white/30"
      : settings.arrowStyle === "square"
        ? "bg-white/90 text-gray-900 hover:bg-white rounded-md"
        : "bg-white/90 text-gray-900 hover:bg-white rounded-full";

  return (
    <div
      className={`group relative overflow-hidden bg-gray-900 ${fullBleed ? "" : "rounded-2xl"}`}
      onMouseEnter={() => settings.pauseOnHover && setPaused(true)}
      onMouseLeave={() => settings.pauseOnHover && setPaused(false)}
    >
      <div className="relative w-full" style={resolveHeightStyle(settings.height)}>
        {slides.map((raw, i) => {
          const s = normalizeSlide(raw);
          const active = i === index;
          return (
            <div
              key={`${i}-${animKey}`}
              className={`absolute inset-0 transition-opacity duration-700 ${active ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"}`}
              aria-hidden={!active}
            >
              <div className={`relative h-full w-full overflow-hidden ${active ? effectClass : ""}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={s.image}
                  alt={s.mainText ?? ""}
                  className={`h-full w-full object-cover ${settings.kenBurns && active ? "animate-ken-burns" : ""}`}
                  style={
                    settings.kenBurns && active
                      ? { animationDuration: `${settings.interval + 2}s` }
                      : undefined
                  }
                />
                {settings.overlay !== "none" ? <div className={`absolute inset-0 ${overlayClass}`} /> : null}
              </div>
            </div>
          );
        })}

        <div
          className={`absolute inset-0 z-20 flex flex-col px-6 py-10 md:px-12 md:py-14 ${valignClass}`}
        >
          <div
            className={`flex w-full max-w-3xl flex-col ${contentPositionClass} ${textAlignClass}`}
          >
            {slide.eyebrow ? (
              <p
                className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] md:text-sm"
                style={{ color: titleColor, opacity: 0.85 }}
              >
                {slide.eyebrow}
              </p>
            ) : null}
            {slide.mainText ? (
              <h2 className={titleClass} style={{ color: titleColor }}>
                {slide.mainText}
              </h2>
            ) : null}
            {slide.subText ? (
              <p
                className="mt-4 max-w-2xl text-base md:text-lg lg:text-xl"
                style={{ color: subtitleColor, opacity: styles?.subTextColor ? 1 : 0.9 }}
              >
                {slide.subText}
              </p>
            ) : null}
            {(slide.primaryButton || slide.secondaryButton || slide.link) ? (
              <div className={`mt-8 flex flex-wrap gap-3 ${buttonRowClass}`}>
                {slide.primaryButton ? (
                  <a href={slide.primaryButton.href} className={buttonClass(slide.primaryButton.variant ?? "primary")}>
                    {slide.primaryButton.label}
                  </a>
                ) : slide.link ? (
                  <a href={slide.link} className={buttonClass("primary")}>
                    Learn more
                  </a>
                ) : null}
                {slide.secondaryButton ? (
                  <a href={slide.secondaryButton.href} className={buttonClass(slide.secondaryButton.variant ?? "outline")}>
                    {slide.secondaryButton.label}
                  </a>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        {settings.showArrows && canNavigate ? (
          <>
            <button
              type="button"
              aria-label="Previous slide"
              className={`absolute left-3 top-1/2 z-30 -translate-y-1/2 px-3 py-2 text-lg font-semibold shadow transition ${arrowBase} ${!settings.loop && index === 0 ? "opacity-40" : ""}`}
              onClick={prev}
              disabled={!settings.loop && index === 0}
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Next slide"
              className={`absolute right-3 top-1/2 z-30 -translate-y-1/2 px-3 py-2 text-lg font-semibold shadow transition ${arrowBase} ${!settings.loop && index === count - 1 ? "opacity-40" : ""}`}
              onClick={next}
              disabled={!settings.loop && index === count - 1}
            >
              ›
            </button>
          </>
        ) : null}

        {settings.showDots && canNavigate ? (
          <div className="absolute bottom-4 left-0 right-0 z-30 flex justify-center gap-2 px-4">
            {settings.dotStyle === "fraction" ? (
              <span className="rounded-full bg-black/40 px-3 py-1 text-xs font-medium text-white">
                {index + 1} / {count}
              </span>
            ) : settings.dotStyle === "bars" ? (
              slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Go to slide ${i + 1}`}
                  className={`h-1 rounded-full transition-all ${i === index ? "w-8 bg-white" : "w-4 bg-white/40"}`}
                  onClick={() => goTo(i)}
                />
              ))
            ) : (
              slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Go to slide ${i + 1}`}
                  className={`h-2.5 w-2.5 rounded-full transition ${i === index ? "bg-white scale-110" : "bg-white/45"}`}
                  onClick={() => goTo(i)}
                />
              ))
            )}
          </div>
        ) : null}

        {settings.showProgress && settings.autoplay && canNavigate ? (
          <div className="absolute bottom-0 left-0 right-0 z-30 h-1 bg-white/20">
            <div className="h-full bg-white transition-[width] duration-75 ease-linear" style={{ width: `${progress}%` }} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function buttonClass(variant: "primary" | "outline" | "ghost") {
  const base = "inline-flex items-center rounded-lg px-6 py-3 text-sm font-semibold transition";
  switch (variant) {
    case "outline":
      return `${base} border-2 border-white text-white hover:bg-white/10`;
    case "ghost":
      return `${base} text-white underline-offset-4 hover:underline`;
    default:
      return `${base} bg-white text-gray-900 hover:bg-gray-100`;
  }
}
