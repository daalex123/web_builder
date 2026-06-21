import { z } from "zod";
import { navigationSettingsSchema } from "./navigation/types";
import { pageLayoutSchema, pageSectionSchema } from "./layouts";

export {
  PAGE_LAYOUTS,
  pageLayoutSchema,
  pageSectionSchema,
  createSectionId,
  defaultSection,
  MAX_PAGE_COLUMNS,
  normalizePageSections,
} from "./layouts";
export type { PageLayout, PageSection } from "./layouts";
export {
  nestedSectionSchema,
  NESTABLE_WIDGET_TYPES,
  normalizeColumnCell,
  normalizeColumnCells,
} from "./nested-sections";
export type { NestedSection, NestedSectionType, ColumnCell, ColumnCellInput } from "./nested-sections";

export const seoSchema = z.object({
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  canonicalUrl: z.string().optional(),
  ogImage: z.string().optional(),
  noIndex: z.boolean().optional(),
});

export type Seo = z.infer<typeof seoSchema>;

export const contentNodeSchema: z.ZodType<ContentNode> = z.lazy(() =>
  z.object({
    type: z.string(),
    attrs: z.record(z.unknown()).optional(),
    text: z.string().optional(),
    marks: z
      .array(
        z.object({
          type: z.string(),
          attrs: z.record(z.unknown()).optional(),
        }),
      )
      .optional(),
    content: z.array(contentNodeSchema).optional(),
  }),
);

export interface ContentNode {
  type: string;
  attrs?: Record<string, unknown>;
  text?: string;
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>;
  content?: ContentNode[];
}

export const contentDocSchema = z.object({
  type: z.literal("doc"),
  content: z.array(contentNodeSchema).default([]),
});

export type ContentDoc = z.infer<typeof contentDocSchema>;

export const pageSchema = z.object({
  slug: z.string(),
  title: z.string(),
  template: z.enum(["home", "page"]).default("page"),
  layout: pageLayoutSchema.optional(),
  sections: z.array(pageSectionSchema).optional(),
  seo: seoSchema.optional(),
  content: contentDocSchema,
});

export type Page = z.infer<typeof pageSchema>;

export const menuItemSchema: z.ZodType<MenuItem> = z.lazy(() =>
  z.object({
    label: z.string(),
    href: z.string().optional(),
    children: z.array(menuItemSchema).optional(),
  }),
);

export interface MenuItem {
  label: string;
  href?: string;
  children?: MenuItem[];
}

export const menusSchema = z.object({
  header: z.array(menuItemSchema).default([]),
  footer: z.array(menuItemSchema).default([]),
});

export type Menus = z.infer<typeof menusSchema>;

export const siteSettingsSchema = z.object({
  name: z.string(),
  description: z.string(),
  url: z.string(),
  logo: z.string().optional(),
  logoAlt: z.string().optional(),
  theme: z.string().default("default"),
  defaultSeo: seoSchema.optional(),
  contact: z
    .object({
      phones: z.array(z.string()).optional(),
      email: z.string().optional(),
      addresses: z.array(z.string()).optional(),
    })
    .optional(),
  social: z
    .object({
      instagram: z.string().optional(),
      facebook: z.string().optional(),
      twitter: z.string().optional(),
      linkedin: z.string().optional(),
      youtube: z.string().optional(),
    })
    .optional(),
  /** "builder" = visual page builder home page; "structured" = theme storefront homepage.json */
  homepageSource: z.enum(["builder", "structured"]).optional(),
  navigation: navigationSettingsSchema.optional(),
  modules: z
    .object({
      ecommerce: z
        .object({
          enabled: z.boolean().default(false),
        })
        .optional(),
    })
    .optional(),
  assistant: z
    .object({
      enabled: z.boolean().default(false),
      name: z.string().default("Maya"),
      role: z.string().default("Sales Consultant"),
      mode: z
        .enum(["consultative", "friendly", "expert", "concierge"])
        .default("consultative"),
      persona: z.string().optional(),
      greeting: z.string().optional(),
      placeholder: z.string().optional(),
      conversionGoals: z.array(z.string()).optional(),
      suggestedTopics: z.array(z.string()).optional(),
      primaryCtaLabel: z.string().optional(),
      primaryCtaHref: z.string().optional(),
      /** Public admin API base for chat (e.g. https://admin.example.com). Falls back to env on web. */
      apiBaseUrl: z.string().optional(),
    })
    .optional(),
});

export type SiteSettings = z.infer<typeof siteSettingsSchema>;

export const heroSlideSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  ctaLabel: z.string(),
  ctaHref: z.string(),
  image: z.string(),
});

export const featureItemSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
});

export const productCardSchema = z.object({
  name: z.string(),
  price: z.string().optional(),
  priceFrom: z.string().optional(),
  image: z.string(),
  href: z.string().optional(),
  inStock: z.boolean().default(true),
  sale: z.boolean().optional(),
  salePrice: z.string().optional(),
});

export const shopLookItemSchema = z.object({
  title: z.string(),
  image: z.string(),
  href: z.string().optional(),
});

export const categorySectionSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  ctaLabel: z.string(),
  ctaHref: z.string(),
  products: z.array(productCardSchema),
  productSlugs: z.array(z.string()).optional(),
});

export const testimonialSchema = z.object({
  name: z.string(),
  role: z.string().optional(),
  quote: z.string(),
});

export const commitmentSchema = z.object({
  title: z.string(),
  body: z.string(),
});

export const productSchema = z.object({
  slug: z.string(),
  name: z.string(),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  price: z.string().optional(),
  priceFrom: z.string().optional(),
  sale: z.boolean().optional(),
  salePrice: z.string().optional(),
  image: z.string(),
  gallery: z.array(z.string()).default([]),
  category: z.string().optional(),
  inStock: z.boolean().default(true),
  seo: seoSchema.optional(),
  status: z.enum(["draft", "published"]).default("draft"),
});

export type Product = z.infer<typeof productSchema>;

export const homepageSchema = z.object({
  heroSlides: z.array(heroSlideSchema),
  features: z.array(featureItemSchema),
  bestSellerTabs: z.array(z.string()),
  bestSellers: z.array(productCardSchema),
  bestSellerSlugs: z.array(z.string()).optional(),
  shopTheLook: z.array(shopLookItemSchema),
  categorySections: z.array(categorySectionSchema),
  ctaBanner: z.object({
    title: z.string(),
    body: z.string(),
  }),
  testimonials: z.array(testimonialSchema),
  commitments: z.array(commitmentSchema),
  instagram: z.object({
    title: z.string(),
    subtitle: z.string(),
    ctaLabel: z.string(),
    ctaHref: z.string(),
  }),
  newsletter: z.object({
    title: z.string(),
    ctaLabel: z.string(),
  }),
});

export type HeroSlide = z.infer<typeof heroSlideSchema>;
export type Homepage = z.infer<typeof homepageSchema>;
export type ProductCard = z.infer<typeof productCardSchema>;

export const siteContentSchema = z.object({
  site: siteSettingsSchema,
  menus: menusSchema,
  pages: z.array(pageSchema),
  homepage: homepageSchema.optional(),
  products: z.array(productSchema).optional(),
});

export type SiteContent = z.infer<typeof siteContentSchema>;
