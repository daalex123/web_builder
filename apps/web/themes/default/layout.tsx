import type { MenuItem } from "@cms/shared";
import Link from "next/link";

function NavItem({ item }: { item: MenuItem }) {
  if (!item.href) {
    return <span className="text-sm font-medium text-gray-700">{item.label}</span>;
  }

  return (
    <Link
      href={item.href}
      className="text-sm font-medium text-gray-600 transition hover:text-gray-900"
    >
      {item.label}
    </Link>
  );
}

export function SiteHeader({
  siteName,
  menu,
}: {
  siteName: string;
  menu: MenuItem[];
}) {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-bold tracking-tight text-gray-900">
          {siteName}
        </Link>
        <nav className="flex items-center gap-6">
          {menu.map((item) => (
            <NavItem key={item.label} item={item} />
          ))}
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter({
  siteName,
  menu,
}: {
  siteName: string;
  menu: MenuItem[];
}) {
  return (
    <footer className="mt-16 border-t border-gray-200 bg-gray-50">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-500">
          © {new Date().getFullYear()} {siteName}. All rights reserved.
        </p>
        <nav className="flex items-center gap-4">
          {menu.map((item) => (
            <NavItem key={item.label} item={item} />
          ))}
        </nav>
      </div>
    </footer>
  );
}
