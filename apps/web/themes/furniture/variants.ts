import type { FurnitureThemeId } from "@cms/shared/theme-presets/options";

export type FurnitureVariant = {
  id: FurnitureThemeId;
  /** Top announcement bar text */
  promoBar?: string;
  headerStyle: "minimal" | "mega" | "studio" | "editorial" | "storefront";
  heroStyle: "carousel" | "split";
  logoTracking: string;
  navTracking: string;
  accentBg: string;
  accentText: string;
  accentHover: string;
  footerBg: string;
  footerText: string;
  featureBg: string;
  proseClass: string;
  shopLookTitle: string;
  bestSellerTitle: string;
  showTopBar: boolean;
};

export const FURNITURE_VARIANTS: Record<FurnitureThemeId, FurnitureVariant> = {
  "ergocraft-single": {
    id: "ergocraft-single",
    headerStyle: "minimal",
    heroStyle: "split",
    logoTracking: "tracking-[0.35em]",
    navTracking: "tracking-[0.12em]",
    accentBg: "bg-stone-900",
    accentText: "text-stone-900",
    accentHover: "hover:bg-stone-900 hover:text-white",
    footerBg: "bg-stone-950",
    footerText: "text-stone-400",
    featureBg: "bg-stone-50",
    proseClass: "prose-furniture",
    shopLookTitle: "Collections",
    bestSellerTitle: "Latest Arrivals",
    showTopBar: false,
  },
  ergocraft: {
    id: "ergocraft",
    promoBar: "Mix, match, and save up to $400 off on Spring-ready styles!",
    headerStyle: "mega",
    heroStyle: "carousel",
    logoTracking: "tracking-[0.2em]",
    navTracking: "tracking-[0.1em]",
    accentBg: "bg-neutral-900",
    accentText: "text-neutral-900",
    accentHover: "hover:bg-neutral-900 hover:text-white",
    footerBg: "bg-neutral-950",
    footerText: "text-neutral-400",
    featureBg: "bg-neutral-50",
    proseClass: "prose-furniture",
    shopLookTitle: "Popular Categories",
    bestSellerTitle: "Best Sellers",
    showTopBar: true,
  },
  gravity: {
    id: "gravity",
    headerStyle: "studio",
    heroStyle: "carousel",
    logoTracking: "tracking-[0.15em]",
    navTracking: "tracking-[0.08em]",
    accentBg: "bg-zinc-800",
    accentText: "text-zinc-800",
    accentHover: "hover:bg-zinc-800 hover:text-white",
    footerBg: "bg-zinc-900",
    footerText: "text-zinc-400",
    featureBg: "bg-zinc-100",
    proseClass: "prose-furniture",
    shopLookTitle: "Our Expertise",
    bestSellerTitle: "New Products",
    showTopBar: false,
  },
  decorazzio: {
    id: "decorazzio",
    headerStyle: "editorial",
    heroStyle: "carousel",
    logoTracking: "tracking-[0.25em]",
    navTracking: "tracking-[0.14em]",
    accentBg: "bg-amber-900",
    accentText: "text-amber-950",
    accentHover: "hover:bg-amber-900 hover:text-white",
    footerBg: "bg-amber-950",
    footerText: "text-amber-200/70",
    featureBg: "bg-amber-50/50",
    proseClass: "prose-furniture",
    shopLookTitle: "Styled Spaces",
    bestSellerTitle: "Curated Picks",
    showTopBar: false,
  },
  colombo: {
    id: "colombo",
    promoBar: "⚠️ Online ordering demo — showcase theme with placeholder products.",
    headerStyle: "storefront",
    heroStyle: "carousel",
    logoTracking: "tracking-wide",
    navTracking: "tracking-normal",
    accentBg: "bg-emerald-800",
    accentText: "text-emerald-900",
    accentHover: "hover:bg-emerald-800 hover:text-white",
    footerBg: "bg-emerald-950",
    footerText: "text-emerald-200/70",
    featureBg: "bg-emerald-50",
    proseClass: "prose-furniture",
    shopLookTitle: "Shop By Room",
    bestSellerTitle: "Best Sellers",
    showTopBar: true,
  },
};

export function getFurnitureVariant(themeId: string): FurnitureVariant | null {
  if (themeId in FURNITURE_VARIANTS) {
    return FURNITURE_VARIANTS[themeId as FurnitureThemeId];
  }
  return null;
}
