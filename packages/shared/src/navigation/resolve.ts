import type { SiteSettings } from "../schemas";
import { resolveNavEffects } from "./effect-options";
import { resolveHeaderBuilder } from "./header-elements";
import { resolveMenuStyle } from "./menu-style";
import {
  DEFAULT_NAV_CONFIG,
  type NavConfig,
  type NavigationSettings,
} from "./types";

type ThemeNavHints = {
  headerStyle?: string;
  logoTracking?: string;
  navTracking?: string;
  accentBg?: string;
  promoBar?: string;
  showTopBar?: boolean;
};

const HEADER_STYLE_MAP: Record<string, Partial<NavigationSettings>> = {
  minimal: { style: "minimal", effect: "bordered", activeIndicator: "bold" },
  mega: { style: "mega", effect: "default", showTopBar: true, showUtilityBar: true, dropdown: "mega" },
  studio: { style: "classic", effect: "default" },
  editorial: { style: "underline", effect: "blur", activeIndicator: "underline" },
  storefront: { style: "split", effect: "default", showTopBar: true, showCta: true, ctaLabel: "Contact" },
};

export function resolveNavConfig(
  site: SiteSettings,
  themeHints?: ThemeNavHints | null,
): NavConfig {
  const fromHeaderStyle = themeHints?.headerStyle
    ? HEADER_STYLE_MAP[themeHints.headerStyle]
    : undefined;

  const user = site.navigation ?? {};
  const merged: NavigationSettings = {
    ...fromHeaderStyle,
    ...user,
  };

  if (merged.showTopBar === undefined && themeHints?.showTopBar !== undefined) {
    merged.showTopBar = themeHints.showTopBar;
  }

  const style = merged.style ?? DEFAULT_NAV_CONFIG.style;

  return {
    style,
    effect: merged.effect ?? DEFAULT_NAV_CONFIG.effect,
    dropdown: merged.dropdown ?? (style === "mega" ? "mega" : DEFAULT_NAV_CONFIG.dropdown),
    mobile: merged.mobile ?? DEFAULT_NAV_CONFIG.mobile,
    sticky: merged.sticky ?? DEFAULT_NAV_CONFIG.sticky,
    showTopBar: merged.showTopBar ?? DEFAULT_NAV_CONFIG.showTopBar,
    topBarText: merged.topBarText ?? themeHints?.promoBar,
    topBarLinkLabel: merged.topBarLinkLabel,
    topBarLinkHref: merged.topBarLinkHref,
    logoSize: merged.logoSize ?? DEFAULT_NAV_CONFIG.logoSize,
    logoHeight: merged.logoHeight,
    logoMaxWidth: merged.logoMaxWidth,
    navAlign: merged.navAlign ?? (style === "centered" ? "center" : DEFAULT_NAV_CONFIG.navAlign),
    linkSize: merged.linkSize ?? DEFAULT_NAV_CONFIG.linkSize,
    dropdownTrigger: merged.dropdownTrigger ?? DEFAULT_NAV_CONFIG.dropdownTrigger,
    headerHeight: merged.headerHeight ?? DEFAULT_NAV_CONFIG.headerHeight,
    containerWidth: merged.containerWidth ?? DEFAULT_NAV_CONFIG.containerWidth,
    activeIndicator:
      merged.activeIndicator ??
      (style === "underline" ? "underline" : style === "pill" ? "pill" : DEFAULT_NAV_CONFIG.activeIndicator),
    megaColumns: merged.megaColumns ?? DEFAULT_NAV_CONFIG.megaColumns,
    showUtilityBar: merged.showUtilityBar ?? (style === "mega" ? true : DEFAULT_NAV_CONFIG.showUtilityBar),
    showCta: merged.showCta ?? DEFAULT_NAV_CONFIG.showCta,
    ctaLabel: merged.ctaLabel,
    ctaHref: merged.ctaHref,
    headerMode: merged.headerMode ?? DEFAULT_NAV_CONFIG.headerMode,
    headerBuilder: resolveHeaderBuilder(
      merged.headerBuilder,
      style,
      merged.showCta,
      merged.ctaLabel,
      merged.ctaHref,
    ),
    menuStyle: resolveMenuStyle(merged.menuStyle),
    effects: resolveNavEffects(merged.effects),
    logoTracking: themeHints?.logoTracking ?? DEFAULT_NAV_CONFIG.logoTracking,
    navTracking: themeHints?.navTracking ?? DEFAULT_NAV_CONFIG.navTracking,
    accentBg: themeHints?.accentBg ?? DEFAULT_NAV_CONFIG.accentBg,
  };
}
