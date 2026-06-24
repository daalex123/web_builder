import { getDeploymentUrl } from "./vercel";

export const ADMIN_BASE = "/admin";
export const WEB_BASE = "/web";

/** Prefix a path for admin dashboard routes. */
export function adminPath(path: string): string {
  if (path.startsWith("http")) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (normalized === ADMIN_BASE || normalized.startsWith(`${ADMIN_BASE}/`)) {
    return normalized;
  }
  if (normalized === "/") return ADMIN_BASE;
  return `${ADMIN_BASE}${normalized}`;
}

/** Prefix a path for the live preview under /web. */
export function webPath(path: string): string {
  if (path.startsWith("http")) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (normalized === WEB_BASE || normalized.startsWith(`${WEB_BASE}/`)) {
    return normalized;
  }
  if (normalized === "/") return WEB_BASE;
  return `${WEB_BASE}${normalized}`;
}

/** Live preview URL (same deployment, /web path). */
export function getWebPreviewUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_WEB_URL?.trim();
  if (fromEnv) {
    const withProtocol = /^https?:\/\//i.test(fromEnv)
      ? fromEnv
      : `https://${fromEnv}`;
    return withProtocol.replace(/\/$/, "");
  }

  const deployment = getDeploymentUrl();
  if (deployment) {
    return `${deployment}${WEB_BASE}`;
  }

  const port = process.env.PORT ?? "3000";
  return `http://localhost:${port}${WEB_BASE}`;
}
