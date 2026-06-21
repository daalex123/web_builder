export const FURNITURE_THEME_IDS = [
  "ergocraft-single",
  "ergocraft",
  "gravity",
  "decorazzio",
  "colombo",
] as const;

export type FurnitureThemeId = (typeof FURNITURE_THEME_IDS)[number];

export type ThemeOption = {
  value: string;
  label: string;
  description: string;
  sourceUrl: string;
};

export const THEME_OPTIONS: ThemeOption[] = [
  {
    value: "default",
    label: "Default (Blog)",
    description: "Simple blog layout with classic header",
    sourceUrl: "",
  },
  {
    value: "finez",
    label: "Finez (E-commerce)",
    description: "Full-featured e-commerce homepage",
    sourceUrl: "",
  },
  {
    value: "ergocraft-single",
    label: "Ergocraft Single Brand",
    description: "Minimal Scandinavian single-brand furniture store",
    sourceUrl: "https://ergocraft.vamtam.com/single-brand/",
  },
  {
    value: "ergocraft",
    label: "Ergocraft Multi Brand",
    description: "Multi-category furniture marketplace with mega menu",
    sourceUrl: "https://ergocraft.vamtam.com/",
  },
  {
    value: "gravity",
    label: "Gravity Interior",
    description: "Interior design studio with services and portfolio feel",
    sourceUrl: "https://gravity.axiomthemes.com/",
  },
  {
    value: "decorazzio",
    label: "Decorazzio",
    description: "Decor and styling with editorial collections",
    sourceUrl: "https://decorazzio.cmsmasters.studio/",
  },
  {
    value: "colombo",
    label: "Colombo Furniture House",
    description: "Room-based furniture shop with deals and categories",
    sourceUrl: "https://colombofurniturehouse.com/",
  },
];

export function isFurnitureTheme(theme: string): theme is FurnitureThemeId {
  return (FURNITURE_THEME_IDS as readonly string[]).includes(theme);
}

export function hasStructuredHomepage(theme: string): boolean {
  return theme === "finez" || isFurnitureTheme(theme);
}

export function getThemeOption(themeId: string): ThemeOption | undefined {
  return THEME_OPTIONS.find((t) => t.value === themeId);
}

/** Themes that use the structured homepage editor + layout */
export const HOMEPAGE_THEME_OPTIONS = THEME_OPTIONS.filter((t) =>
  hasStructuredHomepage(t.value),
);
