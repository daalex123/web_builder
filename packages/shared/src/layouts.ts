import { z } from "zod";
import { sectionStylesSchema } from "./section-styles";
import { columnCellSchema, normalizeColumnCells } from "./nested-sections";
import { nestedSectionSchema } from "./widget-schemas";

const sectionStyleField = { styles: sectionStylesSchema.optional() };

export const PAGE_LAYOUTS = [
  {
    id: "standard",
    name: "Standard",
    description: "Centered content with title header — ideal for articles and simple pages",
    preview: "bg-slate-100",
  },
  {
    id: "full-width",
    name: "Full Width",
    description: "Edge-to-edge hero, slider, and video sections with contained content blocks",
    preview: "bg-blue-100",
  },
  {
    id: "sidebar",
    name: "Sidebar",
    description: "Main content with a sticky sidebar for links or highlights",
    preview: "bg-violet-100",
  },
  {
    id: "landing",
    name: "Landing",
    description: "Hero section plus stacked content blocks — great for marketing pages",
    preview: "bg-emerald-100",
  },
  {
    id: "contact",
    name: "Contact",
    description: "Split layout with contact details beside the main message",
    preview: "bg-amber-100",
  },
  {
    id: "gallery",
    name: "Gallery",
    description: "Image grid showcase above page content — perfect for portfolios",
    preview: "bg-rose-100",
  },
  {
    id: "split-hero",
    name: "Split Hero",
    description: "Half image, half text hero with content below",
    preview: "bg-cyan-100",
  },
  {
    id: "homepage",
    name: "Homepage",
    description: "Full-width blocks with no page title — ideal for a custom home page",
    preview: "bg-purple-100",
  },
] as const;

export const pageLayoutSchema = z.enum([
  "standard",
  "full-width",
  "sidebar",
  "landing",
  "contact",
  "gallery",
  "split-hero",
  "homepage",
]);

export type PageLayout = z.infer<typeof pageLayoutSchema>;

const columnsSectionSchema = z.object({
  id: z.string(),
  type: z.literal("columns"),
  columns: z.array(columnCellSchema).min(1).max(3),
  widths: z.array(z.number()).optional(),
  ...sectionStyleField,
});

export const pageSectionSchema = z.union([nestedSectionSchema, columnsSectionSchema]);

export type PageSection = z.infer<typeof pageSectionSchema>;

export const MAX_PAGE_COLUMNS = 3;

export function normalizePageSections(
  sections: PageSection[] | undefined,
): PageSection[] | undefined {
  if (!sections) return sections;

  return sections.map((section) => {
    if (section.type !== "columns") {
      return section;
    }

    const columns = normalizeColumnCells(section.columns).slice(0, MAX_PAGE_COLUMNS);
    const widths = section.widths?.slice(0, MAX_PAGE_COLUMNS);
    const normalizedWidths =
      widths && widths.length === columns.length
        ? widths
        : columns.map(() => Number((100 / columns.length).toFixed(2)));

    return { ...section, columns, widths: normalizedWidths };
  });
}

export function createSectionId() {
  return `sec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function defaultSection(type: PageSection["type"]): PageSection {
  const id = createSectionId();
  switch (type) {
    case "hero":
      return { id, type: "hero", title: "Hero Title", subtitle: "Supporting message", ctaLabel: "Learn more", ctaHref: "/" };
    case "text":
      return { id, type: "text", heading: "Section heading", body: "Write your content here." };
    case "image":
      return { id, type: "image", src: "/uploads/placeholder.jpg", alt: "Image" };
    case "columns":
      return {
        id,
        type: "columns",
        columns: [
          { id: createSectionId(), title: "Column 1", body: "First column content.", widgets: [] },
          { id: createSectionId(), title: "Column 2", body: "Second column content.", widgets: [] },
        ],
        widths: [50, 50],
      };
    case "cta":
      return { id, type: "cta", title: "Ready to get started?", body: "Contact us today.", buttonLabel: "Contact", buttonHref: "/contact/" };
    case "features":
      return {
        id,
        type: "features",
        items: [
          { title: "Feature 1", body: "Description of feature one." },
          { title: "Feature 2", body: "Description of feature two." },
          { title: "Feature 3", body: "Description of feature three." },
        ],
      };
    case "gallery":
      return {
        id,
        type: "gallery",
        images: [
          { src: "/uploads/placeholder.jpg", alt: "Image 1" },
          { src: "/uploads/placeholder.jpg", alt: "Image 2" },
          { src: "/uploads/placeholder.jpg", alt: "Image 3" },
        ],
      };
    case "slider":
      return {
        id,
        type: "slider",
        slides: [
          {
            image: "/uploads/placeholder.jpg",
            eyebrow: "New Collection",
            mainText: "Crafted for modern living",
            subText: "Discover furniture designed for comfort, quality, and timeless style.",
            primaryButton: { label: "Shop Now", href: "/shop/", variant: "primary" },
            secondaryButton: { label: "Explore", href: "/about/", variant: "outline" },
            align: "left",
            valign: "center",
          },
          {
            image: "/uploads/placeholder.jpg",
            eyebrow: "Best Sellers",
            mainText: "Transform your space",
            subText: "Curated pieces for every room in your home.",
            primaryButton: { label: "View Collection", href: "/collection/", variant: "primary" },
            align: "center",
            valign: "bottom",
          },
        ],
        effect: "fade",
        autoplay: true,
        interval: 6,
        pauseOnHover: true,
        loop: true,
        showArrows: true,
        showDots: true,
        showProgress: true,
        height: "lg",
        kenBurns: true,
        overlay: "gradient",
        arrowStyle: "circle",
        dotStyle: "bars",
      };
    case "testimonials":
      return {
        id,
        type: "testimonials",
        heading: "What our clients say",
        items: [
          { quote: "Outstanding quality and service.", author: "Jane Smith", role: "Interior Designer" },
          { quote: "Beautiful furniture that transformed our home.", author: "John Doe", role: "Homeowner" },
        ],
      };
    case "stats":
      return {
        id,
        type: "stats",
        items: [
          { value: "25+", label: "Years experience" },
          { value: "500+", label: "Projects completed" },
          { value: "98%", label: "Client satisfaction" },
        ],
      };
    case "video":
      return {
        id,
        type: "video",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        caption: "Watch our story",
      };
    case "spacer":
      return { id, type: "spacer", height: 48 };
    case "divider":
      return { id, type: "divider", variant: "line" };
    case "faq":
      return {
        id,
        type: "faq",
        heading: "Frequently asked questions",
        items: [
          { question: "What is your delivery time?", answer: "Most orders ship within 5–10 business days." },
          { question: "Do you offer custom sizing?", answer: "Yes, contact us for bespoke dimensions." },
        ],
      };
    case "featured-products":
      return {
        id,
        type: "featured-products",
        heading: "Featured Products",
        productSlugs: [],
        columns: 4,
      };
    case "category-products":
      return {
        id,
        type: "category-products",
        title: "Living Room",
        subtitle: "Curated pieces for your living space.",
        ctaLabel: "View all",
        ctaHref: "/shop/",
        productSlugs: [],
      };
    case "product-slider":
      return {
        id,
        type: "product-slider",
        heading: "New Arrivals",
        productSlugs: [],
        autoplay: true,
        interval: 5,
        showArrows: true,
        showDots: true,
      };
  }
}
