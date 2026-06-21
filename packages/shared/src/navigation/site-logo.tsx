import Link from "next/link";
import type { SiteSettings } from "../schemas";
import { EFFECT_CLASS_MAP } from "./effect-options";
import {
  LOGO_TEXT_SIZE_CLASS,
  resolveLogoHeight,
  resolveLogoMaxWidth,
} from "./logo-size";
import type { NavConfig } from "./types";

export function SiteLogo({
  site,
  config,
  scrolled,
  overlayLight = false,
  heightOverride,
  maxWidthOverride,
}: {
  site: SiteSettings;
  config: NavConfig;
  scrolled: boolean;
  overlayLight?: boolean;
  heightOverride?: number;
  maxWidthOverride?: number;
}) {
  const logoHover = EFFECT_CLASS_MAP.logoHover[config.effects.style.logoHover];
  const logoShrink = config.effects.style.logoShrink;
  const logoShrinkClass =
    logoShrink !== "none"
      ? `nav-logo-shrink-wrap ${EFFECT_CLASS_MAP.logoShrink[logoShrink]}${scrolled ? " is-shrunk" : ""}`
      : "";

  const heightPx =
    heightOverride !== undefined
      ? heightOverride
      : resolveLogoHeight(config);
  const maxWidthPx =
    maxWidthOverride !== undefined
      ? maxWidthOverride
      : resolveLogoMaxWidth(config);

  const textSizeClass =
    config.style === "centered" && config.logoSize === "md"
      ? "text-2xl sm:text-3xl"
      : LOGO_TEXT_SIZE_CLASS[config.logoSize];

  const linkClass = `inline-block origin-left transition ${logoHover} ${logoShrinkClass}`;

  if (site.logo?.trim()) {
    return (
      <Link href="/" className={linkClass}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={site.logo}
          alt={site.logoAlt?.trim() || site.name}
          className="w-auto object-contain object-left"
          style={{ height: heightPx, maxWidth: maxWidthPx }}
        />
      </Link>
    );
  }

  return (
    <Link
      href="/"
      className={`${linkClass} font-light uppercase ${overlayLight ? "text-white" : "text-neutral-900"} ${config.logoTracking} ${textSizeClass}`}
      style={{ fontSize: heightPx * 0.55 }}
    >
      {site.name}
    </Link>
  );
}
