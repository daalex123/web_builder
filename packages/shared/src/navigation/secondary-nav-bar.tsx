"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MenuItem } from "../schemas";
import { normalizeNavPath, resolveSecondaryNav } from "./secondary-nav";

function isActive(href: string, pathname: string): boolean {
  return normalizeNavPath(href) === normalizeNavPath(pathname);
}

export function SecondaryNavBar({ menu }: { menu: MenuItem[] }) {
  const pathname = usePathname();
  const context = resolveSecondaryNav(menu, pathname);

  if (!context) return null;

  return (
    <nav
      aria-label={`${context.sectionLabel} section`}
      className="border-b border-neutral-200 bg-neutral-50"
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-3 sm:px-6">
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
          {context.sectionLabel}
        </span>
        <span className="hidden h-4 w-px bg-neutral-300 sm:block" aria-hidden />
        <ul className="flex flex-wrap items-center gap-1">
          {context.items.map((item) => {
            const active = isActive(item.href, pathname);
            return (
              <li key={`${item.label}-${item.href}`}>
                <Link
                  href={item.href}
                  className={`rounded-full px-3 py-1.5 text-sm transition ${
                    active
                      ? "bg-neutral-900 font-medium text-white"
                      : "text-neutral-700 hover:bg-neutral-200/80 hover:text-neutral-900"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
