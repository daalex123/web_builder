import { z } from "zod";
import { navEffectsSettingsSchema, resolveNavEffects, type ResolvedNavEffects } from "./effect-options";
import { headerBuilderSchema, defaultHeaderBuilder, resolveHeaderBuilder, type HeaderBuilderConfig } from "./header-elements";
import { navMenuStyleSchema, resolveMenuStyle, type ResolvedNavMenuStyle } from "./menu-style";

export const navStyleSchema = z.enum([
  "classic",
  "underline",
  "pill",
  "centered",
  "minimal",
  "mega",
  "split",
]);

export const navEffectSchema = z.enum(["default", "blur", "transparent", "bordered"]);

export const navDropdownSchema = z.enum(["simple", "mega", "slide", "fade"]);

export const navMobileSchema = z.enum(["accordion", "drawer", "fullscreen"]);

export const navLogoSizeSchema = z.enum(["sm", "md", "lg", "xl", "2xl"]);

export const navAlignSchema = z.enum(["left", "center", "right"]);

export const navLinkSizeSchema = z.enum(["xs", "sm", "base", "lg", "xl"]);

export const navDropdownTriggerSchema = z.enum(["hover", "click"]);

export const navHeaderHeightSchema = z.enum(["compact", "default", "tall"]);

export const navContainerWidthSchema = z.enum(["contained", "full"]);

export const navActiveIndicatorSchema = z.enum(["underline", "pill", "bold", "none"]);

export const navMegaColumnsSchema = z.enum(["1", "2", "3"]);

export const navHeaderModeSchema = z.enum(["preset", "builder"]);

export const navigationSettingsSchema = z.object({
  style: navStyleSchema.optional(),
  effect: navEffectSchema.optional(),
  dropdown: navDropdownSchema.optional(),
  mobile: navMobileSchema.optional(),
  sticky: z.boolean().optional(),
  showTopBar: z.boolean().optional(),
  topBarText: z.string().optional(),
  topBarLinkLabel: z.string().optional(),
  topBarLinkHref: z.string().optional(),
  logoSize: navLogoSizeSchema.optional(),
  logoHeight: z.number().min(24).max(160).optional(),
  logoMaxWidth: z.number().min(80).max(480).optional(),
  navAlign: navAlignSchema.optional(),
  linkSize: navLinkSizeSchema.optional(),
  dropdownTrigger: navDropdownTriggerSchema.optional(),
  headerHeight: navHeaderHeightSchema.optional(),
  containerWidth: navContainerWidthSchema.optional(),
  activeIndicator: navActiveIndicatorSchema.optional(),
  megaColumns: navMegaColumnsSchema.optional(),
  showUtilityBar: z.boolean().optional(),
  showCta: z.boolean().optional(),
  ctaLabel: z.string().optional(),
  ctaHref: z.string().optional(),
  headerMode: navHeaderModeSchema.optional(),
  headerBuilder: headerBuilderSchema.optional(),
  menuStyle: navMenuStyleSchema.optional(),
  effects: navEffectsSettingsSchema.optional(),
});

export type NavStyle = z.infer<typeof navStyleSchema>;
export type NavEffect = z.infer<typeof navEffectSchema>;
export type NavDropdown = z.infer<typeof navDropdownSchema>;
export type NavMobile = z.infer<typeof navMobileSchema>;
export type NavLogoSize = z.infer<typeof navLogoSizeSchema>;
export type NavAlign = z.infer<typeof navAlignSchema>;
export type NavLinkSize = z.infer<typeof navLinkSizeSchema>;
export type NavDropdownTrigger = z.infer<typeof navDropdownTriggerSchema>;
export type NavHeaderHeight = z.infer<typeof navHeaderHeightSchema>;
export type NavContainerWidth = z.infer<typeof navContainerWidthSchema>;
export type NavActiveIndicator = z.infer<typeof navActiveIndicatorSchema>;
export type NavMegaColumns = z.infer<typeof navMegaColumnsSchema>;
export type NavHeaderMode = z.infer<typeof navHeaderModeSchema>;
export type NavigationSettings = z.infer<typeof navigationSettingsSchema>;

export type NavConfig = {
  style: NavStyle;
  effect: NavEffect;
  dropdown: NavDropdown;
  mobile: NavMobile;
  sticky: boolean;
  showTopBar: boolean;
  topBarText?: string;
  topBarLinkLabel?: string;
  topBarLinkHref?: string;
  logoSize: NavLogoSize;
  logoHeight?: number;
  logoMaxWidth?: number;
  navAlign: NavAlign;
  linkSize: NavLinkSize;
  dropdownTrigger: NavDropdownTrigger;
  headerHeight: NavHeaderHeight;
  containerWidth: NavContainerWidth;
  activeIndicator: NavActiveIndicator;
  megaColumns: NavMegaColumns;
  showUtilityBar: boolean;
  showCta: boolean;
  ctaLabel?: string;
  ctaHref?: string;
  headerMode: NavHeaderMode;
  headerBuilder: HeaderBuilderConfig;
  menuStyle: ResolvedNavMenuStyle;
  effects: ResolvedNavEffects;
  logoTracking: string;
  navTracking: string;
  accentBg: string;
};

export const DEFAULT_NAV_CONFIG: NavConfig = {
  style: "classic",
  effect: "default",
  dropdown: "simple",
  mobile: "accordion",
  sticky: true,
  showTopBar: false,
  logoSize: "md",
  navAlign: "right",
  linkSize: "xs",
  dropdownTrigger: "hover",
  headerHeight: "default",
  containerWidth: "contained",
  activeIndicator: "none",
  megaColumns: "2",
  showUtilityBar: false,
  showCta: false,
  headerMode: "preset",
  headerBuilder: defaultHeaderBuilder(),
  menuStyle: resolveMenuStyle(),
  effects: resolveNavEffects(),
  logoTracking: "tracking-tight",
  navTracking: "tracking-normal",
  accentBg: "bg-neutral-900",
};

export const NAV_STYLE_OPTIONS: { value: NavStyle; label: string; description: string }[] = [
  { value: "classic", label: "Classic", description: "Logo left, links right — standard studio header" },
  { value: "underline", label: "Underline", description: "Animated underline on hover and active page" },
  { value: "pill", label: "Pill buttons", description: "Rounded pill links with fill on hover" },
  { value: "centered", label: "Centered logo", description: "Logo centered with navigation below" },
  { value: "minimal", label: "Minimal", description: "Ultra-clean sparse typography navigation" },
  { value: "mega", label: "Mega menu", description: "Utility bar + wide dropdown panels" },
  { value: "split", label: "Split bar", description: "Logo left, nav center, actions right" },
];

export const NAV_EFFECT_OPTIONS: { value: NavEffect; label: string; description: string }[] = [
  { value: "default", label: "Solid", description: "White background with subtle shadow" },
  { value: "blur", label: "Glass blur", description: "Frosted glass backdrop when sticky" },
  { value: "transparent", label: "Transparent → solid", description: "Transparent at top, solid on scroll" },
  { value: "bordered", label: "Bordered", description: "Clean bottom border, no shadow" },
];

export const NAV_DROPDOWN_OPTIONS: { value: NavDropdown; label: string; description: string }[] = [
  { value: "simple", label: "Simple list", description: "Compact vertical link list" },
  { value: "mega", label: "Mega panel", description: "Wide multi-column dropdown grid" },
  { value: "slide", label: "Slide + fade", description: "Animated slide-down panel" },
  { value: "fade", label: "Fade in", description: "Soft opacity fade on open" },
];

export const NAV_MOBILE_OPTIONS: { value: NavMobile; label: string; description: string }[] = [
  { value: "accordion", label: "Accordion", description: "Expandable list below the header" },
  { value: "drawer", label: "Slide-in drawer", description: "Panel slides in from the right" },
  { value: "fullscreen", label: "Fullscreen", description: "Full-screen overlay menu" },
];

export const NAV_LOGO_SIZE_OPTIONS: { value: NavLogoSize; label: string }[] = [
  { value: "sm", label: "Small" },
  { value: "md", label: "Medium" },
  { value: "lg", label: "Large" },
  { value: "xl", label: "XL" },
  { value: "2xl", label: "2XL" },
];

export const NAV_ALIGN_OPTIONS: { value: NavAlign; label: string }[] = [
  { value: "left", label: "Left" },
  { value: "center", label: "Center" },
  { value: "right", label: "Right" },
];

export const NAV_LINK_SIZE_OPTIONS: { value: NavLinkSize; label: string }[] = [
  { value: "xs", label: "Extra small" },
  { value: "sm", label: "Small" },
  { value: "base", label: "Base" },
  { value: "lg", label: "Large" },
  { value: "xl", label: "Extra large" },
];

export const NAV_DROPDOWN_TRIGGER_OPTIONS: { value: NavDropdownTrigger; label: string }[] = [
  { value: "hover", label: "Hover" },
  { value: "click", label: "Click" },
];

export const NAV_HEADER_HEIGHT_OPTIONS: { value: NavHeaderHeight; label: string }[] = [
  { value: "compact", label: "Compact" },
  { value: "default", label: "Default" },
  { value: "tall", label: "Tall" },
];

export const NAV_CONTAINER_WIDTH_OPTIONS: { value: NavContainerWidth; label: string }[] = [
  { value: "contained", label: "Contained (max-width)" },
  { value: "full", label: "Full width" },
];

export const NAV_ACTIVE_INDICATOR_OPTIONS: { value: NavActiveIndicator; label: string }[] = [
  { value: "none", label: "None" },
  { value: "underline", label: "Underline" },
  { value: "pill", label: "Pill highlight" },
  { value: "bold", label: "Bold text" },
];

export const NAV_HEADER_MODE_OPTIONS: { value: NavHeaderMode; label: string; description: string }[] = [
  { value: "preset", label: "Preset layouts", description: "Choose from Classic, Pill, Split, and other ready-made header styles" },
  { value: "builder", label: "Visual builder", description: "Drag and place logo, menu, CTA, search, social, and more" },
];

export const NAV_MEGA_COLUMNS_OPTIONS: { value: NavMegaColumns; label: string }[] = [
  { value: "1", label: "1 column" },
  { value: "2", label: "2 columns" },
  { value: "3", label: "3 columns" },
];
