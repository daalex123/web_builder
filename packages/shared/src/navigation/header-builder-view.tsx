"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { MenuItem, SiteSettings } from "../schemas";
import type { HeaderElement, HeaderRow, HeaderZone } from "./header-elements";
import { HEADER_ZONES } from "./header-elements";
import { SiteLogo } from "./site-logo";
import type { NavConfig } from "./types";

const TEXT_SIZE_CLASS = {
  xs: "text-xs",
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
} as const;

const SEARCH_WIDTH_CLASS = {
  sm: "w-32",
  md: "w-48",
  lg: "w-64",
} as const;

const SOCIAL_SIZE_CLASS = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
} as const;

const SOCIAL_URLS: Record<string, (site: SiteSettings) => string | undefined> = {
  instagram: (s) => s.social?.instagram,
  facebook: (s) => s.social?.facebook,
  twitter: (s) => s.social?.twitter,
  linkedin: (s) => s.social?.linkedin,
  youtube: (s) => s.social?.youtube,
};

type BuilderContext = {
  site: SiteSettings;
  menu: MenuItem[];
  config: NavConfig;
  pathname: string;
  overlayLight: boolean;
  scrolled: boolean;
  renderMenu: (className?: string) => ReactNode;
  renderMenuButton: () => ReactNode;
};

function visibilityClass(element: HeaderElement): string {
  if (element.hidden) return "hidden";
  if (element.type === "menu") return "hidden lg:inline-flex items-center";
  if (element.hiddenMobile) return "hidden lg:inline-flex items-center";
  return "inline-flex items-center";
}

function ElementCta({
  label,
  href,
  variant = "solid",
  overlayLight,
}: {
  label: string;
  href: string;
  variant?: "solid" | "outline" | "ghost";
  overlayLight: boolean;
}) {
  const base = "inline-flex items-center rounded-full px-4 py-2 text-xs font-semibold transition";
  if (variant === "outline") {
    return (
      <Link
        href={href}
        className={`${base} border ${
          overlayLight ? "border-white/80 text-white hover:bg-white/10" : "border-neutral-900 text-neutral-900 hover:bg-neutral-50"
        }`}
      >
        {label}
      </Link>
    );
  }
  if (variant === "ghost") {
    return (
      <Link
        href={href}
        className={`${base} ${overlayLight ? "text-white hover:bg-white/10" : "text-neutral-800 hover:bg-neutral-100"}`}
      >
        {label}
      </Link>
    );
  }
  return (
    <Link
      href={href}
      className={`${base} ${overlayLight ? "bg-white text-neutral-900 hover:bg-white/90" : "bg-neutral-900 text-white hover:bg-neutral-700"}`}
    >
      {label}
    </Link>
  );
}

function HeaderElementView({
  element,
  ctx,
}: {
  element: HeaderElement;
  ctx: BuilderContext;
}) {
  const wrap = (node: ReactNode) => (
    <div key={element.id} className={`shrink-0 ${visibilityClass(element)}`}>
      {node}
    </div>
  );

  switch (element.type) {
    case "logo": {
      const logoConfig = { ...ctx.config, logoSize: element.size ?? ctx.config.logoSize };
      return wrap(
        <SiteLogo
          site={ctx.site}
          config={logoConfig}
          scrolled={ctx.scrolled}
          overlayLight={ctx.overlayLight}
          heightOverride={element.height}
          maxWidthOverride={element.maxWidth}
        />,
      );
    }
    case "menu":
      return wrap(ctx.renderMenu("flex flex-wrap items-center"));
    case "cta":
      return wrap(
        <ElementCta
          label={element.label}
          href={element.href}
          variant={element.variant}
          overlayLight={ctx.overlayLight}
        />,
      );
    case "spacer":
      return wrap(<span style={{ width: element.width ?? 24 }} aria-hidden className="inline-block" />);
    case "text":
      return wrap(
        <span
          className={`${TEXT_SIZE_CLASS[element.size ?? "sm"]} font-medium ${ctx.overlayLight ? "text-white/90" : "text-neutral-600"}`}
          style={element.color ? { color: element.color } : undefined}
        >
          {element.content}
        </span>,
      );
    case "html":
      return wrap(
        <div
          className={`text-sm ${ctx.overlayLight ? "text-white" : "text-neutral-700"}`}
          dangerouslySetInnerHTML={{ __html: element.html }}
        />,
      );
    case "social": {
      const networks = element.networks ?? ["instagram"];
      const size = SOCIAL_SIZE_CLASS[element.iconSize ?? "md"];
      return wrap(
        <div className="flex items-center gap-3">
          {networks.map((network) => {
            const href = SOCIAL_URLS[network]?.(ctx.site);
            if (!href) return null;
            return (
              <a
                key={network}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={`${size} inline-block rounded-full opacity-80 transition hover:opacity-100 ${
                  ctx.overlayLight ? "text-white" : "text-neutral-700"
                }`}
                aria-label={network}
              >
                <span className="sr-only">{network}</span>
                ●
              </a>
            );
          })}
        </div>,
      );
    }
    case "phone": {
      const phone = element.phone?.trim() || ctx.site.contact?.phones?.[0];
      if (!phone) return null;
      return wrap(
        <a
          href={`tel:${phone.replace(/\s/g, "")}`}
          className={`text-sm font-medium ${ctx.overlayLight ? "text-white/90 hover:text-white" : "text-neutral-700 hover:text-neutral-900"}`}
        >
          {element.showIcon !== false ? "☎ " : null}
          {phone}
        </a>,
      );
    }
    case "search":
      return wrap(
        <form action="/search/" method="get" className="hidden sm:block">
          <input
            type="search"
            name="q"
            placeholder={element.placeholder ?? "Search…"}
            className={`${SEARCH_WIDTH_CLASS[element.width ?? "md"]} rounded-full border px-3 py-1.5 text-xs ${
              ctx.overlayLight
                ? "border-white/30 bg-white/10 text-white placeholder:text-white/60"
                : "border-neutral-200 bg-white text-neutral-800"
            }`}
          />
        </form>,
      );
    case "icon-link": {
      const icons: Record<string, string> = {
        cart: "🛒",
        user: "👤",
        heart: "♥",
        mail: "✉",
        phone: "☎",
        search: "⌕",
      };
      return wrap(
        <Link
          href={element.href}
          className={`text-sm font-medium ${ctx.overlayLight ? "text-white hover:text-white/80" : "text-neutral-800 hover:text-neutral-600"}`}
          aria-label={element.label}
        >
          <span className="mr-1">{element.icon ? icons[element.icon] : "→"}</span>
          <span className="hidden sm:inline">{element.label}</span>
        </Link>,
      );
    }
  }
}

function HeaderBuilderRowView({
  row,
  ctx,
  py,
}: {
  row: HeaderRow;
  ctx: BuilderContext;
  py: string;
}) {
  const zoneClass: Record<HeaderZone, string> = {
    left: "flex flex-1 items-center justify-start gap-3",
    center: "flex items-center justify-center gap-3",
    right: "flex flex-1 items-center justify-end gap-3",
  };

  return (
    <div className={`flex items-center gap-4 ${py}`}>
      {HEADER_ZONES.map((zone) => (
        <div key={zone} className={zoneClass[zone]}>
          {row.zones[zone].map((element) => (
            <HeaderElementView key={element.id} element={element} ctx={ctx} />
          ))}
        </div>
      ))}
      <div className="flex items-center lg:hidden">{ctx.renderMenuButton()}</div>
    </div>
  );
}

export function HeaderBuilderView({
  rows,
  showTopRow,
  ctx,
  py,
}: {
  rows: HeaderRow[];
  showTopRow?: boolean;
  ctx: BuilderContext;
  py: string;
}) {
  const mainRow = rows[rows.length - 1];
  const topRow = showTopRow && rows.length > 1 ? rows[0] : null;

  return (
    <>
      {topRow ? (
        <div className="border-b border-neutral-200/60 bg-neutral-50/80">
          <HeaderBuilderRowView row={topRow} ctx={ctx} py="py-2" />
        </div>
      ) : null}
      {mainRow ? <HeaderBuilderRowView row={mainRow} ctx={ctx} py={py} /> : null}
    </>
  );
}
