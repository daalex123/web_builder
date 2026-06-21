import { z } from "zod";

export const slideButtonSchema = z.object({
  label: z.string(),
  href: z.string(),
  variant: z.enum(["primary", "outline", "ghost"]).optional(),
});

export const slideItemSchema = z.object({
  image: z.string(),
  /** @deprecated use mainText */
  title: z.string().optional(),
  /** @deprecated use subText */
  subtitle: z.string().optional(),
  /** @deprecated use primaryButton */
  link: z.string().optional(),
  eyebrow: z.string().optional(),
  mainText: z.string().optional(),
  subText: z.string().optional(),
  primaryButton: slideButtonSchema.optional(),
  secondaryButton: slideButtonSchema.optional(),
  align: z.enum(["left", "center", "right"]).optional(),
  valign: z.enum(["top", "center", "bottom"]).optional(),
});

export type SlideButton = z.infer<typeof slideButtonSchema>;
export type SlideItem = z.infer<typeof slideItemSchema>;

export const sliderEffectSchema = z.enum(["fade", "slide", "zoom", "crossfade"]);
export const sliderHeightSchema = z.enum(["sm", "md", "lg", "xl", "2xl"]);
export const sliderOverlaySchema = z.enum(["gradient", "solid", "none"]);
export const sliderArrowStyleSchema = z.enum(["circle", "square", "minimal"]);
export const sliderDotStyleSchema = z.enum(["dots", "bars", "fraction"]);

export type SliderEffect = z.infer<typeof sliderEffectSchema>;
export type SliderHeight = z.infer<typeof sliderHeightSchema>;
export type SliderOverlay = z.infer<typeof sliderOverlaySchema>;
export type SliderArrowStyle = z.infer<typeof sliderArrowStyleSchema>;
export type SliderDotStyle = z.infer<typeof sliderDotStyleSchema>;

export const sliderSettingsSchema = z.object({
  effect: sliderEffectSchema.optional(),
  autoplay: z.boolean().optional(),
  interval: z.number().min(2).max(30).optional(),
  pauseOnHover: z.boolean().optional(),
  loop: z.boolean().optional(),
  showArrows: z.boolean().optional(),
  showDots: z.boolean().optional(),
  showProgress: z.boolean().optional(),
  height: sliderHeightSchema.optional(),
  kenBurns: z.boolean().optional(),
  overlay: sliderOverlaySchema.optional(),
  arrowStyle: sliderArrowStyleSchema.optional(),
  dotStyle: sliderDotStyleSchema.optional(),
});

export type SliderSettings = z.infer<typeof sliderSettingsSchema>;

export function normalizeSlide(slide: SlideItem): SlideItem & { mainText?: string; subText?: string } {
  return {
    ...slide,
    mainText: slide.mainText ?? slide.title,
    subText: slide.subText ?? slide.subtitle,
  };
}

export const DEFAULT_SLIDER_SETTINGS: Required<SliderSettings> = {
  effect: "fade",
  autoplay: true,
  interval: 5,
  pauseOnHover: true,
  loop: true,
  showArrows: true,
  showDots: true,
  showProgress: true,
  height: "lg",
  kenBurns: false,
  overlay: "gradient",
  arrowStyle: "circle",
  dotStyle: "dots",
};

export function resolveSliderSettings(settings?: SliderSettings): Required<SliderSettings> {
  return { ...DEFAULT_SLIDER_SETTINGS, ...settings };
}

/** Inline height map — avoids Tailwind purge when classes live in the shared package. */
export const HEIGHT_STYLES: Record<
  SliderHeight,
  { minHeight: number; height: string; maxHeight: number | "none" }
> = {
  sm: { minHeight: 280, height: "38vh", maxHeight: 360 },
  md: { minHeight: 360, height: "48vh", maxHeight: 480 },
  lg: { minHeight: 420, height: "58vh", maxHeight: 620 },
  xl: { minHeight: 560, height: "80vh", maxHeight: 920 },
  "2xl": { minHeight: 640, height: "92vh", maxHeight: "none" },
};
