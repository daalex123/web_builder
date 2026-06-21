import type { CSSProperties } from "react";
import type { ResolvedHeaderEffectSettings } from "./effect-options";
import { EFFECT_CLASS_MAP } from "./effect-options";
import type { NavEffect } from "./types";

const TRANSPARENCY_OPACITY: Record<"none" | "light" | "medium" | "heavy", number> = {
  none: 0,
  light: 70,
  medium: 40,
  heavy: 10,
};

const DEFAULT_BG = "#ffffff";
const DEFAULT_BORDER = "#e5e5e5";

function cleanColor(value?: string, fallback = DEFAULT_BG): string {
  const trimmed = value?.trim();
  return trimmed || fallback;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalized = hex.replace("#", "").trim();
  if (normalized.length === 3) {
    const r = parseInt(normalized[0] + normalized[0], 16);
    const g = parseInt(normalized[1] + normalized[1], 16);
    const b = parseInt(normalized[2] + normalized[2], 16);
    return { r, g, b };
  }
  if (normalized.length !== 6) return null;
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  if ([r, g, b].some((n) => Number.isNaN(n))) return null;
  return { r, g, b };
}

export function colorWithOpacity(color: string, opacityPercent: number): string {
  const alpha = Math.min(100, Math.max(0, opacityPercent)) / 100;
  if (alpha >= 1) return cleanColor(color);

  const rgbMatch = color.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i);
  if (rgbMatch) {
    return `rgba(${rgbMatch[1]}, ${rgbMatch[2]}, ${rgbMatch[3]}, ${alpha})`;
  }

  const rgb = hexToRgb(color);
  if (rgb) return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
  return color;
}

export function resolveTopOpacity(hfx: ResolvedHeaderEffectSettings): number {
  if (hfx.topOpacity !== undefined && hfx.topOpacity !== null) {
    return hfx.topOpacity;
  }
  return TRANSPARENCY_OPACITY[hfx.transparency] ?? 0;
}

export function resolveScrolledOpacity(hfx: ResolvedHeaderEffectSettings): number {
  if (hfx.scrolledOpacity !== undefined && hfx.scrolledOpacity !== null) {
    return hfx.scrolledOpacity;
  }
  return 100;
}

export function hasCustomHeaderColors(hfx: ResolvedHeaderEffectSettings): boolean {
  return Boolean(
    hfx.backgroundColor?.trim() ||
      hfx.scrolledBackgroundColor?.trim() ||
      hfx.borderColor?.trim() ||
      hfx.topOpacity !== undefined ||
      hfx.scrolledOpacity !== undefined,
  );
}

export function resolveHeaderShellAppearance(
  effect: NavEffect,
  scrolled: boolean,
  hfx: ResolvedHeaderEffectSettings,
): { className: string; style: CSSProperties } {
  const bg = cleanColor(hfx.backgroundColor);
  const scrolledBg = cleanColor(hfx.scrolledBackgroundColor || hfx.backgroundColor);
  const shadow = EFFECT_CLASS_MAP.shadow[hfx.shadow];
  const blur = EFFECT_CLASS_MAP.blur[hfx.blurStrength];

  const style: CSSProperties = {};
  let className = "";

  switch (effect) {
    case "default":
      className = `${shadow}`.trim();
      style.backgroundColor = colorWithOpacity(bg, 100);
      break;

    case "blur": {
      className = `${blur} ${scrolled ? shadow : ""}`.trim();
      if (scrolled) {
        style.backgroundColor = colorWithOpacity(scrolledBg, resolveScrolledOpacity(hfx));
      } else {
        const top =
          hfx.topOpacity !== undefined ? hfx.topOpacity : hfx.transparency !== "none" ? resolveTopOpacity(hfx) : 90;
        style.backgroundColor = colorWithOpacity(bg, top);
      }
      break;
    }

    case "transparent": {
      className = scrolled ? shadow : "";
      if (scrolled) {
        style.backgroundColor = colorWithOpacity(scrolledBg, resolveScrolledOpacity(hfx));
      } else {
        const top = resolveTopOpacity(hfx);
        style.backgroundColor = top === 0 ? "transparent" : colorWithOpacity(bg, top);
      }
      break;
    }

    case "bordered":
      className = "border-b";
      style.backgroundColor = colorWithOpacity(bg, 100);
      style.borderColor = cleanColor(hfx.borderColor, DEFAULT_BORDER);
      break;
  }

  return { className: className.trim(), style };
}

/** Fallback Tailwind classes when no custom colors are configured */
export function legacyHeaderEffectClass(
  effect: NavEffect,
  scrolled: boolean,
  hfx: ResolvedHeaderEffectSettings,
): string {
  if (effect === "blur") {
    const blur = EFFECT_CLASS_MAP.blur[hfx.blurStrength];
    return scrolled
      ? `bg-white/85 ${EFFECT_CLASS_MAP.shadow[hfx.shadow]} ${blur}`
      : `bg-white/90 ${blur}`;
  }
  if (effect === "transparent") {
    return scrolled
      ? `bg-white ${EFFECT_CLASS_MAP.shadow[hfx.shadow]}`
      : EFFECT_CLASS_MAP.transparencyBg[hfx.transparency];
  }
  if (effect === "bordered") {
    return "border-b border-neutral-200 bg-white";
  }
  return `bg-white ${EFFECT_CLASS_MAP.shadow[hfx.shadow]}`;
}

export function resolveHeaderShellClassAndStyle(
  effect: NavEffect,
  scrolled: boolean,
  hfx: ResolvedHeaderEffectSettings,
): { className: string; style: CSSProperties } {
  if (!hasCustomHeaderColors(hfx)) {
    return {
      className: legacyHeaderEffectClass(effect, scrolled, hfx),
      style: {},
    };
  }
  return resolveHeaderShellAppearance(effect, scrolled, hfx);
}
