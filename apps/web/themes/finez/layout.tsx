"use client";

import Link from "next/link";
import { useState } from "react";
import type { MenuItem, SiteSettings } from "@cms/shared";

function NavDropdown({ item }: { item: MenuItem }) {
  const [open, setOpen] = useState(false);

  if (!item.children?.length) {
    return item.href ? (
      <Link
        href={item.href}
        className="px-3 py-4 text-xs font-semibold tracking-[0.15em] text-neutral-800 transition hover:text-neutral-500"
      >
        {item.label}
      </Link>
    ) : (
      <span className="px-3 py-4 text-xs font-semibold tracking-[0.15em] text-neutral-800">
        {item.label}
      </span>
    );
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className="px-3 py-4 text-xs font-semibold tracking-[0.15em] text-neutral-800 transition hover:text-neutral-500"
      >
        {item.label}
      </button>
      {open ? (
        <div className="absolute left-0 top-full z-50 min-w-[200px] border border-neutral-200 bg-white py-2 shadow-lg">
          {item.children.map((child) => (
            <Link
              key={child.label}
              href={child.href ?? "#"}
              className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
            >
              {child.label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function SiteHeader({
  site,
  menu,
}: {
  site: SiteSettings;
  menu: MenuItem[];
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm">
      <div className="border-b border-neutral-200 bg-neutral-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 text-xs text-neutral-600">
          <div className="flex gap-4">
            <span>Register or Sign in</span>
            {site.contact?.phones?.map((phone) => (
              <span key={phone}>{phone}</span>
            ))}
          </div>
          <div className="hidden gap-4 sm:flex">
            <span>Favourites</span>
            <span>Account</span>
            <span>0 Cart</span>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link
          href="/"
          className="text-2xl font-light tracking-[0.3em] text-neutral-900"
        >
          {site.name}
        </Link>

        <button
          type="button"
          className="lg:hidden"
          aria-label="Toggle menu"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <nav className="hidden items-center lg:flex">
          {menu.map((item) => (
            <NavDropdown key={item.label} item={item} />
          ))}
        </nav>

        <div className="hidden items-center gap-4 text-xs sm:flex lg:hidden">
          <span>0 Cart</span>
        </div>
      </div>

      {mobileOpen ? (
        <nav className="border-t border-neutral-200 px-4 py-4 lg:hidden">
          {menu.map((item) => (
            <div key={item.label} className="border-b border-neutral-100 py-2">
              {item.href ? (
                <Link href={item.href} className="block text-sm font-medium">
                  {item.label}
                </Link>
              ) : (
                <span className="block text-sm font-medium">{item.label}</span>
              )}
              {item.children?.map((child) => (
                <Link
                  key={child.label}
                  href={child.href ?? "#"}
                  className="block py-1 pl-4 text-sm text-neutral-600"
                >
                  {child.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>
      ) : null}
    </header>
  );
}

export function SiteFooter({
  site,
  menu,
}: {
  site: SiteSettings;
  menu: MenuItem[];
}) {
  return (
    <footer className="mt-0 bg-neutral-900 text-neutral-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <p className="text-xl font-light tracking-[0.2em] text-white">{site.name}</p>
          {site.contact?.addresses?.map((address) => (
            <p key={address} className="mt-4 text-sm leading-relaxed">
              {address}
            </p>
          ))}
          {site.contact?.phones?.map((phone) => (
            <p key={phone} className="mt-1 text-sm">
              {phone}
            </p>
          ))}
          {site.contact?.email ? (
            <p className="mt-1 text-sm">{site.contact.email}</p>
          ) : null}
        </div>

        {menu.map((column) => (
          <div key={column.label}>
            <h4 className="text-xs font-semibold tracking-[0.2em] text-white">
              {column.label}
            </h4>
            <ul className="mt-4 space-y-2">
              {column.children?.map((item) => (
                <li key={item.label}>
                  <a href={item.href ?? "#"} className="text-sm hover:text-white">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-neutral-800">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-6 text-xs sm:flex-row">
          <div className="flex flex-wrap justify-center gap-4">
            <a href="#">FAQs</a>
            <a href="#">Warranty Policy</a>
            <a href="#">Terms of Use</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Refund & Delivery Policy</a>
          </div>
          <p>© {new Date().getFullYear()} Finez Capital Ventures. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
