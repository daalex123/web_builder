import type { MenuItem } from "../schemas";

export type SecondaryNavItem = {
  label: string;
  href: string;
};

export type SecondaryNavContext = {
  sectionLabel: string;
  items: SecondaryNavItem[];
};

/** Strip /web preview prefix so menu hrefs match inner page routes. */
export function normalizeNavPath(path: string | undefined): string {
  if (!path || path === "#") return "";
  let normalized = path.trim();
  if (!normalized.startsWith("/")) normalized = `/${normalized}`;
  normalized = normalized.replace(/\/+$/, "") || "/";
  if (normalized === "/web") return "/";
  if (normalized.startsWith("/web/")) {
    normalized = normalized.slice(4) || "/";
  }
  return normalized;
}

function pathsMatch(a: string, b: string): boolean {
  if (!a || !b) return false;
  const left = normalizeNavPath(a);
  const right = normalizeNavPath(b);
  if (left === right) return true;
  if (left !== "/" && right.startsWith(`${left}/`)) return true;
  if (right !== "/" && left.startsWith(`${right}/`)) return true;
  return false;
}

function isHomePath(path: string): boolean {
  const normalized = normalizeNavPath(path);
  return normalized === "/" || normalized === "/home";
}

function collectSectionItems(item: MenuItem): SecondaryNavItem[] {
  const items: SecondaryNavItem[] = [];
  if (item.href && item.href !== "#") {
    items.push({ label: item.label, href: item.href });
  }
  for (const child of item.children ?? []) {
    if (child.href && child.href !== "#") {
      items.push({ label: child.label, href: child.href });
    }
  }
  return items;
}

function walkMenu(items: MenuItem[], currentPath: string): SecondaryNavContext | null {
  for (const item of items) {
    if (!item.children?.length) continue;

    const onParent = item.href ? pathsMatch(item.href, currentPath) : false;
    const onChild = item.children.some(
      (child) => child.href && pathsMatch(child.href, currentPath),
    );

    if (onParent || onChild) {
      const navItems = collectSectionItems(item);
      if (navItems.length > 0) {
        return { sectionLabel: item.label, items: navItems };
      }
    }

    const nested = walkMenu(item.children, currentPath);
    if (nested) return nested;
  }
  return null;
}

/** Resolve subsection links from the header menu for the current page. */
export function resolveSecondaryNav(
  menu: MenuItem[],
  currentPath: string,
): SecondaryNavContext | null {
  if (isHomePath(currentPath)) return null;
  return walkMenu(menu, currentPath);
}
