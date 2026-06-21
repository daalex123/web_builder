import { z } from "zod";
import { sectionStylesSchema } from "./section-styles";
import { slideItemSchema, sliderSettingsSchema } from "./widgets/slider-types";

const styles = { styles: sectionStylesSchema.optional() };

export { slideItemSchema } from "./widgets/slider-types";

export const testimonialItemSchema = z.object({
  quote: z.string(),
  author: z.string(),
  role: z.string().optional(),
  avatar: z.string().optional(),
});

export const statItemSchema = z.object({
  value: z.string(),
  label: z.string(),
});

export const faqItemSchema = z.object({
  question: z.string(),
  answer: z.string(),
});

/** Resolved product card embedded at export time (matches productCardSchema). */
export const widgetProductCardSchema = z.object({
  name: z.string(),
  price: z.string().optional(),
  priceFrom: z.string().optional(),
  image: z.string(),
  href: z.string().optional(),
  inStock: z.boolean().default(true),
  sale: z.boolean().optional(),
  salePrice: z.string().optional(),
});

const heroWidget = z.object({
  id: z.string(),
  type: z.literal("hero"),
  title: z.string(),
  subtitle: z.string().optional(),
  image: z.string().optional(),
  ctaLabel: z.string().optional(),
  ctaHref: z.string().optional(),
  ...styles,
});

const textWidget = z.object({
  id: z.string(),
  type: z.literal("text"),
  heading: z.string().optional(),
  body: z.string(),
  ...styles,
});

const imageWidget = z.object({
  id: z.string(),
  type: z.literal("image"),
  src: z.string(),
  alt: z.string().optional(),
  caption: z.string().optional(),
  ...styles,
});

const ctaWidget = z.object({
  id: z.string(),
  type: z.literal("cta"),
  title: z.string(),
  body: z.string(),
  buttonLabel: z.string(),
  buttonHref: z.string(),
  ...styles,
});

const featuresWidget = z.object({
  id: z.string(),
  type: z.literal("features"),
  items: z.array(z.object({ title: z.string(), body: z.string() })),
  ...styles,
});

const galleryWidget = z.object({
  id: z.string(),
  type: z.literal("gallery"),
  images: z.array(z.object({ src: z.string(), alt: z.string().optional() })),
  ...styles,
});

const sliderWidget = z
  .object({
    id: z.string(),
    type: z.literal("slider"),
    slides: z.array(slideItemSchema).min(1),
    ...styles,
  })
  .merge(sliderSettingsSchema);

const testimonialsWidget = z.object({
  id: z.string(),
  type: z.literal("testimonials"),
  heading: z.string().optional(),
  items: z.array(testimonialItemSchema).min(1),
  ...styles,
});

const statsWidget = z.object({
  id: z.string(),
  type: z.literal("stats"),
  items: z.array(statItemSchema).min(1),
  ...styles,
});

const videoWidget = z.object({
  id: z.string(),
  type: z.literal("video"),
  url: z.string(),
  poster: z.string().optional(),
  caption: z.string().optional(),
  ...styles,
});

const spacerWidget = z.object({
  id: z.string(),
  type: z.literal("spacer"),
  height: z.number().min(8).max(240).optional(),
  ...styles,
});

const dividerWidget = z.object({
  id: z.string(),
  type: z.literal("divider"),
  variant: z.enum(["line", "dots"]).optional(),
  ...styles,
});

const faqWidget = z.object({
  id: z.string(),
  type: z.literal("faq"),
  heading: z.string().optional(),
  items: z.array(faqItemSchema).min(1),
  ...styles,
});

const featuredProductsWidget = z.object({
  id: z.string(),
  type: z.literal("featured-products"),
  heading: z.string().optional(),
  productSlugs: z.array(z.string()).default([]),
  products: z.array(widgetProductCardSchema).optional(),
  columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional(),
  ...styles,
});

const categoryProductsWidget = z.object({
  id: z.string(),
  type: z.literal("category-products"),
  title: z.string(),
  subtitle: z.string(),
  ctaLabel: z.string(),
  ctaHref: z.string(),
  productSlugs: z.array(z.string()).default([]),
  products: z.array(widgetProductCardSchema).optional(),
  ...styles,
});

const productSliderWidget = z.object({
  id: z.string(),
  type: z.literal("product-slider"),
  heading: z.string().optional(),
  productSlugs: z.array(z.string()).default([]),
  products: z.array(widgetProductCardSchema).optional(),
  autoplay: z.boolean().optional(),
  interval: z.number().min(2).max(30).optional(),
  showArrows: z.boolean().optional(),
  showDots: z.boolean().optional(),
  ...styles,
});

/** All nestable / leaf widget schemas (no columns). */
export const leafWidgetSchemas = [
  heroWidget,
  textWidget,
  imageWidget,
  ctaWidget,
  featuresWidget,
  galleryWidget,
  sliderWidget,
  testimonialsWidget,
  statsWidget,
  videoWidget,
  spacerWidget,
  dividerWidget,
  faqWidget,
  featuredProductsWidget,
  categoryProductsWidget,
  productSliderWidget,
] as const;

export const nestedSectionSchema = z.discriminatedUnion(
  "type",
  leafWidgetSchemas as unknown as [
    (typeof leafWidgetSchemas)[0],
    ...(typeof leafWidgetSchemas)[number][],
  ],
);

export type NestedSection = z.infer<typeof nestedSectionSchema>;
export type NestedSectionType = NestedSection["type"];

export const NESTABLE_WIDGET_TYPES: NestedSectionType[] = [
  "hero",
  "text",
  "image",
  "cta",
  "features",
  "gallery",
  "slider",
  "testimonials",
  "stats",
  "video",
  "spacer",
  "divider",
  "faq",
  "featured-products",
  "category-products",
  "product-slider",
];

export const WIDGET_LABELS: Record<NestedSectionType, string> = {
  hero: "Hero",
  text: "Text",
  image: "Image",
  cta: "CTA",
  features: "Features",
  gallery: "Gallery",
  slider: "Slider",
  testimonials: "Testimonials",
  stats: "Stats",
  video: "Video",
  spacer: "Spacer",
  divider: "Divider",
  faq: "FAQ",
  "featured-products": "Featured Products",
  "category-products": "Category Products",
  "product-slider": "Product Slider",
};
