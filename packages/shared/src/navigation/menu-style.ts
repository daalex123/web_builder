import { z } from "zod";
import type { CSSProperties } from "react";

export const navMenuFontWeightSchema = z.enum(["normal", "medium", "semibold", "bold"]);
export const navMenuLetterSpacingSchema = z.enum(["tighter", "tight", "normal", "wide", "widest"]);
export const navMenuItemPaddingSchema = z.enum(["none", "sm", "md", "lg"]);

export const navMenuStyleSchema = z.object({
  color: z.string().optional(),
  hoverColor: z.string().optional(),
  activeColor: z.string().optional(),
  activeBackground: z.string().optional(),
  fontWeight: navMenuFontWeightSchema.optional(),
  letterSpacing: navMenuLetterSpacingSchema.optional(),
  itemPaddingX: navMenuItemPaddingSchema.optional(),
  itemPaddingY: navMenuItemPaddingSchema.optional(),
});

export type NavMenuStyle = z.infer<typeof navMenuStyleSchema>;
export type NavMenuFontWeight = z.infer<typeof navMenuFontWeightSchema>;
export type NavMenuLetterSpacing = z.infer<typeof navMenuLetterSpacingSchema>;
export type NavMenuItemPadding = z.infer<typeof navMenuItemPaddingSchema>;

export type ResolvedNavMenuStyle = {
  color?: string;
  hoverColor?: string;
  activeColor?: string;
  activeBackground?: string;
  fontWeight: NavMenuFontWeight;
  letterSpacing: NavMenuLetterSpacing;
  itemPaddingX: NavMenuItemPadding;
  itemPaddingY: NavMenuItemPadding;
};

export const DEFAULT_MENU_STYLE: ResolvedNavMenuStyle = {
  fontWeight: "semibold",
  letterSpacing: "normal",
  itemPaddingX: "md",
  itemPaddingY: "md",
};

export const NAV_MENU_FONT_WEIGHT_OPTIONS: { value: NavMenuFontWeight; label: string }[] = [
  { value: "normal", label: "Normal" },
  { value: "medium", label: "Medium" },
  { value: "semibold", label: "Semibold" },
  { value: "bold", label: "Bold" },
];

export const NAV_MENU_LETTER_SPACING_OPTIONS: { value: NavMenuLetterSpacing; label: string }[] = [
  { value: "tighter", label: "Tighter" },
  { value: "tight", label: "Tight" },
  { value: "normal", label: "Normal" },
  { value: "wide", label: "Wide" },
  { value: "widest", label: "Widest" },
];

export const NAV_MENU_ITEM_PADDING_OPTIONS: { value: NavMenuItemPadding; label: string }[] = [
  { value: "none", label: "None" },
  { value: "sm", label: "Small" },
  { value: "md", label: "Medium" },
  { value: "lg", label: "Large" },
];

const FONT_WEIGHT_CLASS: Record<NavMenuFontWeight, string> = {
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
};

const LETTER_SPACING_CLASS: Record<NavMenuLetterSpacing, string> = {
  tighter: "tracking-tighter",
  tight: "tracking-tight",
  normal: "tracking-normal",
  wide: "tracking-wide",
  widest: "tracking-widest",
};

const PADDING_X_CLASS: Record<NavMenuItemPadding, string> = {
  none: "px-0",
  sm: "px-2",
  md: "px-3",
  lg: "px-4",
};

const PADDING_Y_CLASS: Record<NavMenuItemPadding, string> = {
  none: "py-0",
  sm: "py-1",
  md: "py-2",
  lg: "py-4",
};

function cleanColor(value?: string): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function resolveMenuStyle(settings?: NavMenuStyle): ResolvedNavMenuStyle {
  return {
    ...DEFAULT_MENU_STYLE,
    ...settings,
    color: cleanColor(settings?.color),
    hoverColor: cleanColor(settings?.hoverColor),
    activeColor: cleanColor(settings?.activeColor),
    activeBackground: cleanColor(settings?.activeBackground),
    fontWeight: settings?.fontWeight ?? DEFAULT_MENU_STYLE.fontWeight,
    letterSpacing: settings?.letterSpacing ?? DEFAULT_MENU_STYLE.letterSpacing,
    itemPaddingX: settings?.itemPaddingX ?? DEFAULT_MENU_STYLE.itemPaddingX,
    itemPaddingY: settings?.itemPaddingY ?? DEFAULT_MENU_STYLE.itemPaddingY,
  };
}

export function hasCustomMenuColors(menuStyle: ResolvedNavMenuStyle): boolean {
  return Boolean(
    menuStyle.color || menuStyle.hoverColor || menuStyle.activeColor || menuStyle.activeBackground,
  );
}

export function menuStyleCssVars(menuStyle: ResolvedNavMenuStyle): CSSProperties | undefined {
  if (!hasCustomMenuColors(menuStyle)) return undefined;

  return {
    ["--nav-menu-color" as string]: menuStyle.color,
    ["--nav-menu-hover" as string]: menuStyle.hoverColor ?? menuStyle.color,
    ["--nav-menu-active" as string]: menuStyle.activeColor ?? menuStyle.color,
    ["--nav-menu-active-bg" as string]: menuStyle.activeBackground,
  };
}

export function menuTypographyClasses(menuStyle: ResolvedNavMenuStyle): string {
  return `${FONT_WEIGHT_CLASS[menuStyle.fontWeight]} ${LETTER_SPACING_CLASS[menuStyle.letterSpacing]}`;
}

export function menuPaddingClasses(menuStyle: ResolvedNavMenuStyle): string {
  return `${PADDING_X_CLASS[menuStyle.itemPaddingX]} ${PADDING_Y_CLASS[menuStyle.itemPaddingY]}`;
}
