"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import type { MenuItem, SiteSettings } from "../schemas";
import { EFFECT_CLASS_MAP } from "./effect-options";
import { resolveHeaderShellClassAndStyle } from "./header-background";
import {
  hasCustomMenuColors,
  menuPaddingClasses,
  menuStyleCssVars,
  menuTypographyClasses,
} from "./menu-style";
import { SiteLogo } from "./site-logo";
import { HeaderBuilderView } from "./header-builder-view";
import type { NavConfig, NavStyle } from "./types";

function isActive(href: string | undefined, pathname: string): boolean {
  if (!href || href === "#") return false;
  const normalized = href.replace(/\/$/, "") || "/";
  const path = pathname.replace(/\/$/, "") || "/";
  return path === normalized || (normalized !== "/" && path.startsWith(normalized));
}

const LINK_SIZE_CLASS = {
  xs: "text-xs",
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
} as const;
const HEADER_PY_CLASS = {
  compact: "py-2",
  default: "py-4",
  tall: "py-6",
} as const;
const MEGA_COLS_CLASS = {
  "1": "grid-cols-1",
  "2": "sm:grid-cols-2",
  "3": "sm:grid-cols-2 lg:grid-cols-3",
} as const;

function isOverlayLight(config: NavConfig, scrolled: boolean): boolean {
  return (
    config.effect === "transparent" &&
    !scrolled &&
    config.effects.header.transparentNavTone === "light"
  );
}

function linkClass(
  style: NavStyle,
  config: NavConfig,
  active: boolean,
  overlayLight: boolean,
): string {
  const fx = config.effects.style;
  const ms = config.menuStyle;
  const themed = hasCustomMenuColors(ms);
  const size = LINK_SIZE_CLASS[config.linkSize];
  const hover = EFFECT_CLASS_MAP.linkHover[fx.linkHover];
  const pillFx = EFFECT_CLASS_MAP.pillVariant[fx.pillVariant];
  const typography = menuTypographyClasses(ms);
  const padding = menuPaddingClasses(ms);
  const base = `${size} ${typography} ${config.navTracking} transition ${hover} nav-menu-link`;
  const indicator = config.activeIndicator;
  const underlineFx = EFFECT_CLASS_MAP.underlineThickness[fx.underlineThickness];

  if (overlayLight && !themed) {
    if (style === "pill" || (indicator === "pill" && active)) {
      return `${base} rounded-full px-4 py-2 ${
        active ? "bg-white text-neutral-900" : "text-white hover:bg-white/15"
      }`;
    }

    if (style === "underline" || indicator === "underline") {
      return `${base} relative ${padding} text-white/90 nav-link-underline ${underlineFx} ${
        active ? "nav-link-underline-active text-white" : "hover:text-white"
      }`;
    }

    if (style === "minimal") {
      return `${base} ${padding} text-white/80 ${active ? "text-white" : "hover:text-white"}`;
    }

    const boldActive = indicator === "bold" && active ? "font-bold text-white" : "";
    return `${base} ${padding} text-white/90 ${boldActive} ${
      active ? "text-white" : "hover:text-white"
    }`;
  }

  if (themed) {
    const shape =
      style === "pill" || (indicator === "pill" && active)
        ? `rounded-full ${padding}`
        : style === "underline" || indicator === "underline"
          ? `relative nav-link-underline ${underlineFx} ${padding}`
          : padding;

    const activeClass =
      active && (style === "underline" || indicator === "underline") ? "nav-link-underline-active" : "";
    const pillActive = active && (style === "pill" || indicator === "pill") ? "nav-menu-pill-active" : "";

    return `${base} ${shape} ${activeClass} ${pillActive}`.trim();
  }

  if (style === "pill" || (indicator === "pill" && active)) {
    return `${base} rounded-full ${padding} ${pillFx} ${
      active ? "bg-neutral-900 text-white" : "text-neutral-700 hover:bg-neutral-100"
    }`;
  }

  if (style === "underline" || indicator === "underline") {
    return `${base} relative ${padding} text-neutral-800 nav-link-underline ${underlineFx} ${
      active ? "nav-link-underline-active text-neutral-900" : "hover:text-neutral-500"
    }`;
  }

  if (style === "minimal") {
    return `${base} ${padding} text-neutral-600 ${active ? "text-neutral-900" : "hover:text-neutral-900"}`;
  }

  const boldActive = indicator === "bold" && active ? "font-bold text-neutral-900" : "";
  return `${base} ${padding} text-neutral-800 ${boldActive} ${
    active ? "text-neutral-900" : "hover:text-neutral-500"
  }`;
}

function NavDropdownItem({
  item,
  config,
  pathname,
  overlayLight,
}: {
  item: MenuItem;
  config: NavConfig;
  pathname: string;
  overlayLight: boolean;
}) {
  const [open, setOpen] = useState(false);
  const active = isActive(item.href, pathname);

  if (!item.children?.length) {
    return item.href ? (
      <Link
        href={item.href}
        className={linkClass(config.style, config, active, overlayLight)}
        data-active={active ? "true" : undefined}
      >
        {item.label}
      </Link>
    ) : (
      <span className={linkClass(config.style, config, false, overlayLight)}>{item.label}</span>
    );
  }

  const dfx = config.effects.dropdown;
  const panelBase =
    config.dropdown === "mega"
      ? `absolute left-0 top-full z-50 w-[min(100vw-2rem,560px)] border border-neutral-200 bg-white p-6 ${EFFECT_CLASS_MAP.shadow[dfx.shadow]} ${EFFECT_CLASS_MAP.rounded[dfx.rounded]}`
      : `absolute left-0 top-full z-50 min-w-[220px] border border-neutral-200 bg-white py-2 ${EFFECT_CLASS_MAP.shadow[dfx.shadow]} ${EFFECT_CLASS_MAP.rounded[dfx.rounded]}`;

  const panelAnim =
    config.dropdown === "slide"
      ? `nav-dropdown-slide ${EFFECT_CLASS_MAP.dropdownDuration[dfx.duration]}`
      : config.dropdown === "fade"
        ? `nav-dropdown-fade ${EFFECT_CLASS_MAP.dropdownDuration[dfx.duration]}`
        : EFFECT_CLASS_MAP.dropdownDuration[dfx.duration];

  const itemHover = EFFECT_CLASS_MAP.dropdownItemHover[dfx.itemHover];
  const megaCard = EFFECT_CLASS_MAP.megaCard[dfx.megaCardStyle];
  const panelClass = `${panelBase} ${EFFECT_CLASS_MAP.dropdownOffset[dfx.offset]} ${panelAnim}`.trim();

  const triggerProps =
    config.dropdownTrigger === "click"
      ? {
          onClick: () => setOpen((v) => !v),
          onMouseEnter: undefined,
          onMouseLeave: undefined,
        }
      : {
          onMouseEnter: () => setOpen(true),
          onMouseLeave: () => setOpen(false),
          onClick: undefined,
        };

  return (
    <div className="relative" {...triggerProps}>
      <button
        type="button"
        className={linkClass(config.style, config, active, overlayLight)}
        data-active={active ? "true" : undefined}
      >
        {item.label}
        <span className="ml-1 opacity-60">▾</span>
      </button>
      {open ? (
        <div className={panelClass}>
          {config.dropdown === "mega" ? (
            <div className={`grid gap-4 ${MEGA_COLS_CLASS[config.megaColumns]}`}>
              {item.children.map((child) => (
                <Link
                  key={child.label}
                  href={child.href ?? "#"}
                  className={`rounded-lg px-3 py-2 text-sm text-neutral-700 ${megaCard} ${itemHover}`}
                  onClick={() => setOpen(false)}
                >
                  {child.label}
                </Link>
              ))}
            </div>
          ) : (
            item.children.map((child) => (
              <Link
                key={child.label}
                href={child.href ?? "#"}
                className={`block px-4 py-2 text-sm text-neutral-700 ${itemHover}`}
                onClick={() => setOpen(false)}
              >
                {child.label}
              </Link>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}

function NavItems({
  menu,
  config,
  pathname,
  className,
  overlayLight,
}: {
  menu: MenuItem[];
  config: NavConfig;
  pathname: string;
  className?: string;
  overlayLight: boolean;
}) {
  const alignClass =
    config.navAlign === "center"
      ? "justify-center"
      : config.navAlign === "left"
        ? "justify-start"
        : "justify-end";

  const spacing = EFFECT_CLASS_MAP.spacing[config.effects.style.spacing];

  return (
    <nav className={`flex flex-wrap items-center ${spacing} ${className ?? ""} ${alignClass}`}>
      {menu.map((item) => (
        <NavDropdownItem key={item.label} item={item} config={config} pathname={pathname} overlayLight={overlayLight} />
      ))}
    </nav>
  );
}

function CtaButton({ config }: { config: NavConfig }) {
  if (!config.showCta || !config.ctaLabel) return null;
  const href = config.ctaHref ?? "/contact-us/";
  return (
    <Link
      href={href}
      className="hidden rounded-full bg-neutral-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-neutral-700 sm:inline-block"
    >
      {config.ctaLabel}
    </Link>
  );
}

function MobileMenu({
  menu,
  config,
  open,
  onClose,
}: {
  menu: MenuItem[];
  config: NavConfig;
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  const content = (
    <div className="flex flex-col gap-1 p-6">
      {menu.map((item) => (
        <div key={item.label} className="border-b border-neutral-100 py-3">
          {item.href ? (
            <Link href={item.href} className="block text-base font-medium" onClick={onClose}>
              {item.label}
            </Link>
          ) : (
            <span className="block text-base font-medium">{item.label}</span>
          )}
          {item.children?.map((child) => (
            <Link
              key={child.label}
              href={child.href ?? "#"}
              className="block py-2 pl-4 text-sm text-neutral-600"
              onClick={onClose}
            >
              {child.label}
            </Link>
          ))}
        </div>
      ))}
      {config.showCta && config.ctaLabel ? (
        <Link
          href={config.ctaHref ?? "/contact-us/"}
          className="mt-4 block rounded-full bg-neutral-900 px-4 py-3 text-center text-sm font-semibold text-white"
          onClick={onClose}
        >
          {config.ctaLabel}
        </Link>
      ) : null}
    </div>
  );

  const mfx = config.effects.mobile;
  const overlayClass = EFFECT_CLASS_MAP.overlay[mfx.overlay];
  const enterClass = EFFECT_CLASS_MAP.mobileEnter[mfx.enterAnimation];
  const drawerPos = mfx.drawerSide === "left" ? "left-0 nav-drawer-in-left" : "right-0 nav-drawer-in";

  if (config.mobile === "fullscreen") {
    return (
      <div className={`fixed inset-0 z-50 bg-white lg:hidden ${enterClass}`}>
        <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-4">
          <span className="text-sm font-semibold uppercase tracking-widest">Menu</span>
          <button type="button" aria-label="Close menu" onClick={onClose} className="p-2">
            ✕
          </button>
        </div>
        {content}
      </div>
    );
  }

  if (config.mobile === "drawer") {
    return (
      <>
        <div className={`fixed inset-0 z-40 lg:hidden ${overlayClass} ${enterClass}`} onClick={onClose} aria-hidden />
        <div className={`fixed top-0 z-50 h-full w-[min(100vw-3rem,320px)] bg-white shadow-2xl lg:hidden ${drawerPos} ${enterClass}`}>
          <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-4">
            <span className="text-sm font-semibold">Menu</span>
            <button type="button" aria-label="Close menu" onClick={onClose}>
              ✕
            </button>
          </div>
          {content}
        </div>
      </>
    );
  }

  return <div className={`border-t border-neutral-200 lg:hidden ${enterClass}`}>{content}</div>;
}

function HeaderShell({
  config,
  scrolled,
  children,
  topBar,
}: {
  config: NavConfig;
  scrolled: boolean;
  children: ReactNode;
  topBar?: React.ReactNode;
}) {
  const hfx = config.effects.header;
  const transitionMs = EFFECT_CLASS_MAP.transitionMs[hfx.transitionSpeed];
  const overlayHeader = config.effect === "transparent" && config.sticky;
  const positionClass = overlayHeader
    ? "fixed inset-x-0 top-0 z-40"
    : config.sticky
      ? "sticky top-0 z-40"
      : "relative z-40";

  const { className: effectClass, style: bgStyle } = resolveHeaderShellClassAndStyle(
    config.effect,
    scrolled,
    hfx,
  );

  const menuVars = menuStyleCssVars(config.menuStyle);
  const themedMenu = hasCustomMenuColors(config.menuStyle) ? "nav-menu-themed" : "";

  return (
    <header
      className={`${positionClass} transition-colors ${effectClass} ${themedMenu}`.trim()}
      style={{ transitionDuration: `${transitionMs}ms`, ...bgStyle, ...menuVars }}
    >
      {topBar}
      {children}
    </header>
  );
}

function Container({ config, children }: { config: NavConfig; children: ReactNode }) {
  if (config.containerWidth === "full") {
    return <div className="w-full px-4">{children}</div>;
  }
  return <div className="mx-auto max-w-7xl px-4">{children}</div>;
}

export function SiteHeader({
  site,
  menu,
  config,
}: {
  site: SiteSettings;
  menu: MenuItem[];
  config: NavConfig;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const py = HEADER_PY_CLASS[config.headerHeight];

  const logoShrink = config.effects.style.logoShrink;
  const overlayLight = isOverlayLight(config, scrolled);
  const trackScroll =
    logoShrink !== "none" || config.effect === "transparent" || config.effect === "blur";

  useEffect(() => {
    if (!trackScroll) return;
    const threshold = Number(config.effects.header.scrollThreshold);
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [trackScroll, config.effect, config.effects.header.scrollThreshold]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const topBarLink =
    config.topBarLinkLabel && config.topBarLinkHref ? (
      <Link href={config.topBarLinkHref} className="underline hover:no-underline">
        {config.topBarLinkLabel}
      </Link>
    ) : null;

  const topBar =
    config.showTopBar && config.topBarText ? (
      <div className={`${config.accentBg} px-4 py-2 text-center text-xs text-white`}>
        {config.topBarText}
        {topBarLink ? <span className="ml-2">{topBarLink}</span> : null}
      </div>
    ) : config.showUtilityBar || config.style === "mega" ? (
      <div className="border-b border-neutral-200 bg-neutral-50">
        <Container config={config}>
          <div className="flex items-center justify-between py-2 text-xs text-neutral-600">
            <div className="flex gap-4">
              {site.contact?.phones?.map((phone) => (
                <span key={phone}>{phone}</span>
              ))}
            </div>
            <div className="hidden gap-4 sm:flex">
              {site.contact?.email ? <span>{site.contact.email}</span> : null}
            </div>
          </div>
        </Container>
      </div>
    ) : null;

  const logo = <SiteLogo site={site} config={config} scrolled={scrolled} overlayLight={overlayLight} />;

  const menuButton = (
    <button
      type="button"
      className={`lg:hidden ${overlayLight ? "text-white" : "text-neutral-900"}`}
      aria-label="Toggle menu"
      onClick={() => setMobileOpen((v) => !v)}
    >
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  );

  const builderCtx = {
    site,
    menu,
    config,
    pathname,
    overlayLight,
    scrolled,
    renderMenu: (className?: string) => (
      <NavItems
        menu={menu}
        config={config}
        pathname={pathname}
        className={className}
        overlayLight={overlayLight}
      />
    ),
    renderMenuButton: () => menuButton,
  };

  if (config.headerMode === "builder") {
    return (
      <HeaderShell config={config} scrolled={scrolled} topBar={topBar}>
        <Container config={config}>
          <HeaderBuilderView
            rows={config.headerBuilder.rows}
            showTopRow={config.headerBuilder.showTopRow}
            ctx={builderCtx}
            py={py}
          />
        </Container>
        <MobileMenu menu={menu} config={config} open={mobileOpen} onClose={() => setMobileOpen(false)} />
      </HeaderShell>
    );
  }

  let mainRow: ReactNode;

  if (config.style === "centered") {
    mainRow = (
      <Container config={config}>
        <div className={`${py} text-center`}>
          <div className="flex items-center justify-between lg:hidden">
            <span />
            {menuButton}
          </div>
          <div className="hidden lg:block">{logo}</div>
          <div className="mt-4 hidden lg:flex">
            <NavItems
              menu={menu}
              config={config}
              pathname={pathname}
              className="flex flex-1 flex-wrap items-center gap-1"
              overlayLight={overlayLight}
            />
          </div>
          <div className="lg:hidden">{logo}</div>
        </div>
      </Container>
    );
  } else if (config.style === "split") {
    mainRow = (
      <Container config={config}>
        <div className={`flex items-center gap-4 ${py}`}>
          <div className="shrink-0">{logo}</div>
          <NavItems
            menu={menu}
            config={config}
            pathname={pathname}
            className="hidden flex-1 items-center justify-center lg:flex"
            overlayLight={overlayLight}
          />
          <div className="ml-auto flex items-center gap-3">
            {menuButton}
            <CtaButton config={config} />
          </div>
        </div>
      </Container>
    );
  } else {
    mainRow = (
      <Container config={config}>
        <div className={`flex items-center justify-between gap-4 ${py}`}>
          {logo}
          <div className="hidden flex-1 items-center lg:flex">
            <NavItems
              menu={menu}
              config={config}
              pathname={pathname}
              className="flex flex-1 flex-wrap items-center gap-1"
              overlayLight={overlayLight}
            />
          </div>
          <div className="flex items-center gap-3">
            <CtaButton config={config} />
            {menuButton}
          </div>
        </div>
      </Container>
    );
  }

  return (
    <HeaderShell config={config} scrolled={scrolled} topBar={topBar}>
      {mainRow}
      <MobileMenu menu={menu} config={config} open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </HeaderShell>
  );
}
