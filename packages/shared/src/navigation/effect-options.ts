import { z } from "zod";

export const navTransitionSpeedSchema = z.enum(["fast", "normal", "slow"]);
export const navShadowLevelSchema = z.enum(["none", "sm", "md", "lg", "xl"]);
export const navBlurStrengthSchema = z.enum(["sm", "md", "lg", "xl"]);
export const navScrollThresholdSchema = z.enum(["0", "24", "48", "96", "160"]);
export const navTransparencyLevelSchema = z.enum(["none", "light", "medium", "heavy"]);
export const navTransparentNavToneSchema = z.enum(["dark", "light"]);
export const navLinkHoverSchema = z.enum(["fade", "lift", "scale", "underline-grow", "none"]);
export const navLogoHoverSchema = z.enum(["none", "fade", "scale"]);
export const navLogoShrinkSchema = z.enum(["none", "subtle", "medium", "strong"]);
export const navUnderlineThicknessSchema = z.enum(["thin", "medium", "thick"]);
export const navPillVariantSchema = z.enum(["solid", "outline", "soft"]);
export const navSpacingSchema = z.enum(["tight", "normal", "relaxed"]);
export const navDropdownOffsetSchema = z.enum(["none", "sm", "md", "lg"]);
export const navRoundedSchema = z.enum(["none", "md", "lg", "xl"]);
export const navDropdownItemHoverSchema = z.enum(["highlight", "slide", "fade"]);
export const navMegaCardStyleSchema = z.enum(["flat", "bordered", "elevated"]);
export const navOverlayStrengthSchema = z.enum(["none", "light", "medium", "dark"]);
export const navMobileEnterSchema = z.enum(["slide", "fade", "scale"]);
export const navDrawerSideSchema = z.enum(["left", "right"]);

export const headerEffectSettingsSchema = z.object({
  shadow: navShadowLevelSchema.optional(),
  blurStrength: navBlurStrengthSchema.optional(),
  transparency: navTransparencyLevelSchema.optional(),
  transparentNavTone: navTransparentNavToneSchema.optional(),
  scrollThreshold: navScrollThresholdSchema.optional(),
  transitionSpeed: navTransitionSpeedSchema.optional(),
  /** Base header background color (hex/rgb) */
  backgroundColor: z.string().optional(),
  /** Background when scrolled / solid state; defaults to backgroundColor */
  scrolledBackgroundColor: z.string().optional(),
  /** Top-state opacity 0–100; overrides transparency preset when set */
  topOpacity: z.number().min(0).max(100).optional(),
  /** Scrolled-state opacity 0–100 */
  scrolledOpacity: z.number().min(0).max(100).optional(),
  /** Bottom border color for bordered effect */
  borderColor: z.string().optional(),
});

export const styleEffectSettingsSchema = z.object({
  linkHover: navLinkHoverSchema.optional(),
  logoHover: navLogoHoverSchema.optional(),
  logoShrink: navLogoShrinkSchema.optional(),
  underlineThickness: navUnderlineThicknessSchema.optional(),
  pillVariant: navPillVariantSchema.optional(),
  spacing: navSpacingSchema.optional(),
});

export const dropdownEffectSettingsSchema = z.object({
  duration: navTransitionSpeedSchema.optional(),
  offset: navDropdownOffsetSchema.optional(),
  shadow: navShadowLevelSchema.optional(),
  rounded: navRoundedSchema.optional(),
  itemHover: navDropdownItemHoverSchema.optional(),
  megaCardStyle: navMegaCardStyleSchema.optional(),
});

export const mobileEffectSettingsSchema = z.object({
  overlay: navOverlayStrengthSchema.optional(),
  enterAnimation: navMobileEnterSchema.optional(),
  drawerSide: navDrawerSideSchema.optional(),
});

export const navEffectsSettingsSchema = z.object({
  header: headerEffectSettingsSchema.optional(),
  style: styleEffectSettingsSchema.optional(),
  dropdown: dropdownEffectSettingsSchema.optional(),
  mobile: mobileEffectSettingsSchema.optional(),
});

export type NavTransitionSpeed = z.infer<typeof navTransitionSpeedSchema>;
export type HeaderEffectSettings = z.infer<typeof headerEffectSettingsSchema>;
export type StyleEffectSettings = z.infer<typeof styleEffectSettingsSchema>;
export type DropdownEffectSettings = z.infer<typeof dropdownEffectSettingsSchema>;
export type MobileEffectSettings = z.infer<typeof mobileEffectSettingsSchema>;
export type NavEffectsSettings = z.infer<typeof navEffectsSettingsSchema>;

export type ResolvedHeaderEffectSettings = Required<
  Pick<
    HeaderEffectSettings,
    "shadow" | "blurStrength" | "transparency" | "transparentNavTone" | "scrollThreshold" | "transitionSpeed"
  >
> &
  Pick<
    HeaderEffectSettings,
    "backgroundColor" | "scrolledBackgroundColor" | "topOpacity" | "scrolledOpacity" | "borderColor"
  >;

export type ResolvedNavEffects = {
  header: ResolvedHeaderEffectSettings;
  style: Required<StyleEffectSettings>;
  dropdown: Required<DropdownEffectSettings>;
  mobile: Required<MobileEffectSettings>;
};

export const DEFAULT_HEADER_EFFECTS: ResolvedHeaderEffectSettings = {
  shadow: "sm",
  blurStrength: "md",
  transparency: "none",
  transparentNavTone: "light",
  scrollThreshold: "24",
  transitionSpeed: "normal",
  backgroundColor: undefined,
  scrolledBackgroundColor: undefined,
  topOpacity: undefined,
  scrolledOpacity: undefined,
  borderColor: undefined,
};

export const DEFAULT_STYLE_EFFECTS: Required<StyleEffectSettings> = {
  linkHover: "fade",
  logoHover: "fade",
  logoShrink: "none",
  underlineThickness: "medium",
  pillVariant: "solid",
  spacing: "normal",
};

export const DEFAULT_DROPDOWN_EFFECTS: Required<DropdownEffectSettings> = {
  duration: "normal",
  offset: "sm",
  shadow: "lg",
  rounded: "lg",
  itemHover: "highlight",
  megaCardStyle: "flat",
};

export const DEFAULT_MOBILE_EFFECTS: Required<MobileEffectSettings> = {
  overlay: "medium",
  enterAnimation: "slide",
  drawerSide: "right",
};

export const NAV_TRANSITION_SPEED_OPTIONS = [
  { value: "fast" as const, label: "Fast (150ms)" },
  { value: "normal" as const, label: "Normal (300ms)" },
  { value: "slow" as const, label: "Slow (500ms)" },
];

export const NAV_SHADOW_OPTIONS = [
  { value: "none" as const, label: "None" },
  { value: "sm" as const, label: "Small" },
  { value: "md" as const, label: "Medium" },
  { value: "lg" as const, label: "Large" },
  { value: "xl" as const, label: "Extra large" },
];

export const NAV_BLUR_OPTIONS = [
  { value: "sm" as const, label: "Light" },
  { value: "md" as const, label: "Medium" },
  { value: "lg" as const, label: "Strong" },
  { value: "xl" as const, label: "Heavy" },
];

export const NAV_SCROLL_THRESHOLD_OPTIONS = [
  { value: "0" as const, label: "Immediate" },
  { value: "24" as const, label: "24px" },
  { value: "48" as const, label: "48px" },
  { value: "96" as const, label: "96px" },
  { value: "160" as const, label: "160px" },
];

export const NAV_TRANSPARENCY_OPTIONS = [
  { value: "none" as const, label: "None (fully clear)", description: "No background at top — header floats over hero/slider" },
  { value: "light" as const, label: "Light (subtle)", description: "Slight white tint at top" },
  { value: "medium" as const, label: "Medium", description: "Semi-transparent white at top" },
  { value: "heavy" as const, label: "Heavy (very clear)", description: "Mostly transparent with a faint tint" },
];

export const NAV_TRANSPARENT_NAV_TONE_OPTIONS = [
  { value: "light" as const, label: "Light text", description: "White links/logo over dark heroes and sliders" },
  { value: "dark" as const, label: "Dark text", description: "Dark links/logo over light page backgrounds" },
];

export const NAV_LINK_HOVER_OPTIONS = [
  { value: "fade" as const, label: "Color fade" },
  { value: "lift" as const, label: "Lift up" },
  { value: "scale" as const, label: "Scale" },
  { value: "underline-grow" as const, label: "Underline grow" },
  { value: "none" as const, label: "None" },
];

export const NAV_LOGO_HOVER_OPTIONS = [
  { value: "none" as const, label: "None" },
  { value: "fade" as const, label: "Opacity fade" },
  { value: "scale" as const, label: "Scale up" },
];

export const NAV_LOGO_SHRINK_OPTIONS = [
  { value: "none" as const, label: "None", description: "Logo stays the same size when scrolling" },
  { value: "subtle" as const, label: "Subtle", description: "Slight shrink (~8%) after scroll threshold" },
  { value: "medium" as const, label: "Medium", description: "Noticeable shrink (~15%) — studio header style" },
  { value: "strong" as const, label: "Strong", description: "Compact shrink (~22%) for dense sticky bars" },
];

export const NAV_UNDERLINE_THICKNESS_OPTIONS = [
  { value: "thin" as const, label: "Thin (1px)" },
  { value: "medium" as const, label: "Medium (2px)" },
  { value: "thick" as const, label: "Thick (3px)" },
];

export const NAV_PILL_VARIANT_OPTIONS = [
  { value: "solid" as const, label: "Solid fill" },
  { value: "outline" as const, label: "Outline" },
  { value: "soft" as const, label: "Soft background" },
];

export const NAV_SPACING_OPTIONS = [
  { value: "tight" as const, label: "Tight" },
  { value: "normal" as const, label: "Normal" },
  { value: "relaxed" as const, label: "Relaxed" },
];

export const NAV_DROPDOWN_OFFSET_OPTIONS = [
  { value: "none" as const, label: "Flush" },
  { value: "sm" as const, label: "Small gap" },
  { value: "md" as const, label: "Medium gap" },
  { value: "lg" as const, label: "Large gap" },
];

export const NAV_ROUNDED_OPTIONS = [
  { value: "none" as const, label: "Square" },
  { value: "md" as const, label: "Medium" },
  { value: "lg" as const, label: "Large" },
  { value: "xl" as const, label: "Extra large" },
];

export const NAV_DROPDOWN_ITEM_HOVER_OPTIONS = [
  { value: "highlight" as const, label: "Background highlight" },
  { value: "slide" as const, label: "Slide right" },
  { value: "fade" as const, label: "Opacity fade" },
];

export const NAV_MEGA_CARD_STYLE_OPTIONS = [
  { value: "flat" as const, label: "Flat" },
  { value: "bordered" as const, label: "Bordered cards" },
  { value: "elevated" as const, label: "Elevated shadow" },
];

export const NAV_OVERLAY_OPTIONS = [
  { value: "none" as const, label: "None" },
  { value: "light" as const, label: "Light (20%)" },
  { value: "medium" as const, label: "Medium (40%)" },
  { value: "dark" as const, label: "Dark (60%)" },
];

export const NAV_MOBILE_ENTER_OPTIONS = [
  { value: "slide" as const, label: "Slide" },
  { value: "fade" as const, label: "Fade" },
  { value: "scale" as const, label: "Scale" },
];

export const NAV_DRAWER_SIDE_OPTIONS = [
  { value: "left" as const, label: "Left" },
  { value: "right" as const, label: "Right" },
];

export function resolveNavEffects(settings?: NavEffectsSettings): ResolvedNavEffects {
  return {
    header: { ...DEFAULT_HEADER_EFFECTS, ...settings?.header },
    style: { ...DEFAULT_STYLE_EFFECTS, ...settings?.style },
    dropdown: { ...DEFAULT_DROPDOWN_EFFECTS, ...settings?.dropdown },
    mobile: { ...DEFAULT_MOBILE_EFFECTS, ...settings?.mobile },
  };
}

export const EFFECT_CLASS_MAP = {
  shadow: { none: "", sm: "shadow-sm", md: "shadow-md", lg: "shadow-lg", xl: "shadow-xl" },
  blur: { sm: "backdrop-blur-sm", md: "backdrop-blur-md", lg: "backdrop-blur-lg", xl: "backdrop-blur-xl" },
  rounded: { none: "rounded-none", md: "rounded-md", lg: "rounded-lg", xl: "rounded-xl" },
  dropdownOffset: { none: "mt-0", sm: "mt-1", md: "mt-2", lg: "mt-4" },
  linkHover: {
    fade: "nav-hover-fade",
    lift: "nav-hover-lift",
    scale: "nav-hover-scale",
    "underline-grow": "nav-hover-underline-grow",
    none: "",
  },
  logoHover: { none: "", fade: "nav-logo-hover-fade", scale: "nav-logo-hover-scale" },
  logoShrink: {
    none: "",
    subtle: "nav-logo-shrink-subtle",
    medium: "nav-logo-shrink-medium",
    strong: "nav-logo-shrink-strong",
  },
  underlineThickness: {
    thin: "nav-underline-thin",
    medium: "nav-underline-medium",
    thick: "nav-underline-thick",
  },
  spacing: { tight: "gap-0", normal: "gap-1", relaxed: "gap-3" },
  dropdownDuration: { fast: "nav-anim-fast", normal: "nav-anim-normal", slow: "nav-anim-slow" },
  dropdownItemHover: {
    highlight: "nav-dropdown-item-highlight",
    slide: "nav-dropdown-item-slide",
    fade: "nav-dropdown-item-fade",
  },
  megaCard: {
    flat: "",
    bordered: "border border-neutral-200",
    elevated: "shadow-md border border-neutral-100",
  },
  overlay: {
    none: "bg-transparent",
    light: "bg-black/20",
    medium: "bg-black/40",
    dark: "bg-black/60",
  },
  mobileEnter: {
    slide: "nav-mobile-slide",
    fade: "nav-mobile-fade",
    scale: "nav-mobile-scale",
  },
  transitionMs: { fast: 150, normal: 300, slow: 500 },
  transparencyBg: {
    none: "bg-transparent",
    light: "bg-white/70",
    medium: "bg-white/40",
    heavy: "bg-white/10",
  },
  pillVariant: {
    solid: "",
    outline: "nav-pill-outline",
    soft: "nav-pill-soft",
  },
} as const;
