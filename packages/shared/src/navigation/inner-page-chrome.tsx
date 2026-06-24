"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MenuItem, SiteSettings } from "../schemas";
import { MainMenuNav } from "./site-header";
import { resolveNavConfig } from "./resolve";
import { normalizeNavPath, resolveSecondaryNav } from "./secondary-nav";
import type { NavConfig } from "./types";

type InnerPageChromeProps = {
  title: string;
  menu: MenuItem[];
  site: SiteSettings;
  config?: NavConfig;
  showTitle?: boolean;
  children: React.ReactNode;
};

function isActive(href: string, pathname: string): boolean {
  return normalizeNavPath(href) === normalizeNavPath(pathname);
}

function resolveHomeHref(menu: MenuItem[]): string {
  const home = menu.find((item) => {
    const path = normalizeNavPath(item.href);
    return path === "/" || path === "/home" || item.label.toLowerCase() === "home";
  });
  return home?.href ?? "/";
}

function isHomePath(pathname: string): boolean {
  const normalized = normalizeNavPath(pathname);
  return normalized === "/" || normalized === "/home";
}

export function InnerPageChrome({
  title,
  menu,
  site,
  config,
  showTitle = true,
  children,
}: InnerPageChromeProps) {
  const pathname = usePathname();

  if (isHomePath(pathname)) {
    return <>{children}</>;
  }

  const navConfig = config ?? resolveNavConfig(site);
  const context = resolveSecondaryNav(menu, pathname);
  const homeHref = resolveHomeHref(menu);
  const hasNav = Boolean(context?.items.length);
  const hasMainMenu = menu.length > 0;

  return (
    <>
      <header className="border-b border-neutral-200 bg-neutral-50">
        {hasMainMenu ? (
          <div className="border-b border-neutral-200/80 bg-white">
            <div className="mx-auto max-w-7xl overflow-x-auto px-4 py-3 sm:px-6 lg:px-8">
              <MainMenuNav
                menu={menu}
                config={navConfig}
                pathname={pathname}
                className="min-w-max"
              />
            </div>
          </div>
        ) : null}

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-neutral-500">
              <li>
                <Link href={homeHref} className="transition hover:text-neutral-900">
                  Home
                </Link>
              </li>
              {context ? (
                <>
                  <li aria-hidden className="text-neutral-300">
                    /
                  </li>
                  <li className="font-medium text-neutral-700">{context.sectionLabel}</li>
                </>
              ) : (
                <>
                  <li aria-hidden className="text-neutral-300">
                    /
                  </li>
                  <li className="font-medium text-neutral-700">{title}</li>
                </>
              )}
            </ol>
          </nav>

          {showTitle ? (
            <div className={hasNav ? "mb-6" : undefined}>
              {context ? (
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500">
                  {context.sectionLabel}
                </p>
              ) : null}
              <h1 className="mt-1 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
                {title}
              </h1>
            </div>
          ) : null}

          {hasNav && context ? (
            <nav
              aria-label={`${context.sectionLabel} pages`}
              className={showTitle ? "border-t border-neutral-200/80 pt-5" : undefined}
            >
              <ul className="flex flex-wrap gap-2">
                {context.items.map((item) => {
                  const active = isActive(item.href, pathname);
                  return (
                    <li key={`${item.label}-${item.href}`}>
                      <Link
                        href={item.href}
                        className={`inline-flex rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                          active
                            ? "bg-neutral-900 text-white shadow-sm"
                            : "bg-white text-neutral-700 ring-1 ring-neutral-200 hover:bg-neutral-100 hover:text-neutral-900"
                        }`}
                        aria-current={active ? "page" : undefined}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          ) : null}
        </div>
      </header>
      {children}
    </>
  );
}
