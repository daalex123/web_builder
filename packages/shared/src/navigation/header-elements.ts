import { z } from "zod";
import type { NavStyle } from "./types";

export const headerZoneSchema = z.enum(["left", "center", "right"]);
export type HeaderZone = z.infer<typeof headerZoneSchema>;

export const HEADER_ZONES: HeaderZone[] = ["left", "center", "right"];

const headerElementBaseSchema = z.object({
  id: z.string(),
  hidden: z.boolean().optional(),
  hiddenMobile: z.boolean().optional(),
});

export const headerLogoElementSchema = headerElementBaseSchema.extend({
  type: z.literal("logo"),
  size: z.enum(["sm", "md", "lg", "xl", "2xl"]).optional(),
  height: z.number().min(24).max(160).optional(),
  maxWidth: z.number().min(80).max(480).optional(),
});

export const headerMenuElementSchema = headerElementBaseSchema.extend({
  type: z.literal("menu"),
});

export const headerCtaElementSchema = headerElementBaseSchema.extend({
  type: z.literal("cta"),
  label: z.string(),
  href: z.string(),
  variant: z.enum(["solid", "outline", "ghost"]).optional(),
});

export const headerSpacerElementSchema = headerElementBaseSchema.extend({
  type: z.literal("spacer"),
  width: z.number().min(0).max(240).optional(),
});

export const headerTextElementSchema = headerElementBaseSchema.extend({
  type: z.literal("text"),
  content: z.string(),
  color: z.string().optional(),
  size: z.enum(["xs", "sm", "base", "lg"]).optional(),
});

export const headerHtmlElementSchema = headerElementBaseSchema.extend({
  type: z.literal("html"),
  html: z.string(),
});

export const headerSocialElementSchema = headerElementBaseSchema.extend({
  type: z.literal("social"),
  networks: z.array(z.enum(["instagram", "facebook", "twitter", "linkedin", "youtube"])).optional(),
  iconSize: z.enum(["sm", "md", "lg"]).optional(),
});

export const headerPhoneElementSchema = headerElementBaseSchema.extend({
  type: z.literal("phone"),
  phone: z.string().optional(),
  showIcon: z.boolean().optional(),
});

export const headerSearchElementSchema = headerElementBaseSchema.extend({
  type: z.literal("search"),
  placeholder: z.string().optional(),
  width: z.enum(["sm", "md", "lg"]).optional(),
});

export const headerIconLinkElementSchema = headerElementBaseSchema.extend({
  type: z.literal("icon-link"),
  label: z.string(),
  href: z.string(),
  icon: z.enum(["cart", "user", "heart", "mail", "phone", "search"]).optional(),
});

export const headerElementSchema = z.discriminatedUnion("type", [
  headerLogoElementSchema,
  headerMenuElementSchema,
  headerCtaElementSchema,
  headerSpacerElementSchema,
  headerTextElementSchema,
  headerHtmlElementSchema,
  headerSocialElementSchema,
  headerPhoneElementSchema,
  headerSearchElementSchema,
  headerIconLinkElementSchema,
]);

export type HeaderElement = z.infer<typeof headerElementSchema>;

export const headerRowSchema = z.object({
  id: z.string(),
  zones: z.object({
    left: z.array(headerElementSchema),
    center: z.array(headerElementSchema),
    right: z.array(headerElementSchema),
  }),
});

export type HeaderRow = z.infer<typeof headerRowSchema>;

export const headerBuilderSchema = z.object({
  rows: z.array(headerRowSchema).min(1).max(2),
  showTopRow: z.boolean().optional(),
});

export type HeaderBuilderConfig = z.infer<typeof headerBuilderSchema>;

export const HEADER_ELEMENT_LABELS: Record<HeaderElement["type"], string> = {
  logo: "Logo",
  menu: "Navigation menu",
  cta: "CTA button",
  spacer: "Spacer",
  text: "Text",
  html: "Custom HTML",
  social: "Social icons",
  phone: "Phone number",
  search: "Search box",
  "icon-link": "Icon link",
};

export const HEADER_ELEMENT_TYPES = Object.keys(HEADER_ELEMENT_LABELS) as HeaderElement["type"][];

export function createHeaderElementId(): string {
  return `hdr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function createHeaderRowId(): string {
  return `hrow_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function defaultHeaderElement(type: HeaderElement["type"]): HeaderElement {
  const id = createHeaderElementId();
  switch (type) {
    case "logo":
      return { id, type: "logo", size: "md" };
    case "menu":
      return { id, type: "menu" };
    case "cta":
      return { id, type: "cta", label: "Contact", href: "/contact-us/", variant: "solid" };
    case "spacer":
      return { id, type: "spacer", width: 24 };
    case "text":
      return { id, type: "text", content: "Free shipping on orders over $100", size: "sm" };
    case "html":
      return { id, type: "html", html: "<span>Custom HTML</span>" };
    case "social":
      return { id, type: "social", networks: ["instagram"], iconSize: "md" };
    case "phone":
      return { id, type: "phone", showIcon: true };
    case "search":
      return { id, type: "search", placeholder: "Search…", width: "md" };
    case "icon-link":
      return { id, type: "icon-link", label: "Account", href: "/account/", icon: "user" };
  }
}

export function createEmptyHeaderRow(): HeaderRow {
  return {
    id: createHeaderRowId(),
    zones: { left: [], center: [], right: [] },
  };
}

export function presetToHeaderRows(style: NavStyle, showCta?: boolean, ctaLabel?: string, ctaHref?: string): HeaderRow[] {
  const main = createEmptyHeaderRow();
  main.zones.left.push(defaultHeaderElement("logo"));
  main.zones.right.push(defaultHeaderElement("menu"));

  if (style === "centered") {
    main.zones.left = [];
    main.zones.right = [];
    main.zones.center = [defaultHeaderElement("logo"), defaultHeaderElement("menu")];
  } else if (style === "split") {
    main.zones.center = [defaultHeaderElement("menu")];
    main.zones.right = [];
    if (showCta) {
      main.zones.right.push({
        id: createHeaderElementId(),
        type: "cta",
        label: ctaLabel ?? "Contact",
        href: ctaHref ?? "/contact-us/",
        variant: "solid",
      });
    }
  } else if (showCta) {
    main.zones.right.push({
      id: createHeaderElementId(),
      type: "cta",
      label: ctaLabel ?? "Contact",
      href: ctaHref ?? "/contact-us/",
      variant: "solid",
    });
  }

  return [main];
}

export function defaultHeaderBuilder(style: NavStyle = "classic"): HeaderBuilderConfig {
  return {
    rows: presetToHeaderRows(style),
    showTopRow: false,
  };
}

export function resolveHeaderBuilder(
  builder: HeaderBuilderConfig | undefined,
  style: NavStyle,
  showCta?: boolean,
  ctaLabel?: string,
  ctaHref?: string,
): HeaderBuilderConfig {
  if (builder?.rows?.length) {
    return {
      showTopRow: builder.showTopRow ?? false,
      rows: builder.rows,
    };
  }
  return defaultHeaderBuilder(style);
}

export function getZoneElements(row: HeaderRow, zone: HeaderZone): HeaderElement[] {
  return row.zones[zone];
}

export function updateZoneElements(row: HeaderRow, zone: HeaderZone, elements: HeaderElement[]): HeaderRow {
  return {
    ...row,
    zones: { ...row.zones, [zone]: elements },
  };
}

export function updateHeaderElement(
  rows: HeaderRow[],
  rowId: string,
  elementId: string,
  patch: Partial<HeaderElement>,
): HeaderRow[] {
  return rows.map((row) => {
    if (row.id !== rowId) return row;
    const zones = { ...row.zones };
    for (const zone of HEADER_ZONES) {
      zones[zone] = zones[zone].map((el) =>
        el.id === elementId ? ({ ...el, ...patch } as HeaderElement) : el,
      );
    }
    return { ...row, zones };
  });
}

export function removeHeaderElement(rows: HeaderRow[], rowId: string, elementId: string): HeaderRow[] {
  return rows.map((row) => {
    if (row.id !== rowId) return row;
    const zones = { ...row.zones };
    for (const zone of HEADER_ZONES) {
      zones[zone] = zones[zone].filter((el) => el.id !== elementId);
    }
    return { ...row, zones };
  });
}

export function findHeaderElement(
  rows: HeaderRow[],
  elementId: string,
): { row: HeaderRow; zone: HeaderZone; element: HeaderElement } | null {
  for (const row of rows) {
    for (const zone of HEADER_ZONES) {
      const element = row.zones[zone].find((el) => el.id === elementId);
      if (element) return { row, zone, element };
    }
  }
  return null;
}
