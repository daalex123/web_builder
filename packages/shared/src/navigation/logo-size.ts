import type { NavConfig, NavLogoSize } from "./types";

/** Default image heights (px) per preset */
export const LOGO_HEIGHT_PRESETS: Record<NavLogoSize, number> = {
  sm: 32,
  md: 40,
  lg: 56,
  xl: 72,
  "2xl": 96,
};

export const LOGO_MAX_WIDTH_DEFAULT = 220;

export const LOGO_HEIGHT_MIN = 24;
export const LOGO_HEIGHT_MAX = 160;
export const LOGO_MAX_WIDTH_MIN = 80;
export const LOGO_MAX_WIDTH_MAX = 480;

export function resolveLogoHeight(config: Pick<NavConfig, "logoSize" | "logoHeight">): number {
  if (config.logoHeight !== undefined && config.logoHeight !== null) {
    return Math.min(LOGO_HEIGHT_MAX, Math.max(LOGO_HEIGHT_MIN, config.logoHeight));
  }
  return LOGO_HEIGHT_PRESETS[config.logoSize] ?? LOGO_HEIGHT_PRESETS.md;
}

export function resolveLogoMaxWidth(config: Pick<NavConfig, "logoMaxWidth">): number {
  if (config.logoMaxWidth !== undefined && config.logoMaxWidth !== null) {
    return Math.min(LOGO_MAX_WIDTH_MAX, Math.max(LOGO_MAX_WIDTH_MIN, config.logoMaxWidth));
  }
  return LOGO_MAX_WIDTH_DEFAULT;
}

export function logoSizeFromHeight(height: number): NavLogoSize {
  if (height <= 36) return "sm";
  if (height <= 48) return "md";
  if (height <= 64) return "lg";
  if (height <= 84) return "xl";
  return "2xl";
}

export const LOGO_TEXT_SIZE_CLASS: Record<NavLogoSize, string> = {
  sm: "text-lg sm:text-xl",
  md: "text-xl sm:text-2xl",
  lg: "text-2xl sm:text-3xl",
  xl: "text-3xl sm:text-4xl",
  "2xl": "text-4xl sm:text-5xl",
};
