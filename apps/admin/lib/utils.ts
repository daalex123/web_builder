import path from "path";

export function getWebContentDir() {
  return path.resolve(
    process.cwd(),
    process.env.WEB_CONTENT_DIR ?? "../../apps/web/content",
  );
}

export function getUploadDir() {
  return path.resolve(
    process.cwd(),
    process.env.UPLOAD_DIR ?? "../../apps/web/public/uploads",
  );
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Preview URL in admin — served from this app's /uploads route */
export function getMediaUrl(path: string) {
  if (path.startsWith("http")) return path;
  return path.startsWith("/") ? path : `/${path}`;
}

const DEFAULT_WEB_PREVIEW_URL = "http://localhost:3000";

/** Public site URL for live preview links (set NEXT_PUBLIC_WEB_URL on Vercel). */
export function getWebPreviewUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_WEB_URL?.trim();
  if (!fromEnv) return DEFAULT_WEB_PREVIEW_URL;

  const withProtocol = /^https?:\/\//i.test(fromEnv)
    ? fromEnv
    : `https://${fromEnv}`;

  return withProtocol.replace(/\/$/, "");
}

/** Public site URL for copying into content (served from apps/web) */
export function getPublicMediaUrl(path: string) {
  if (path.startsWith("http")) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${getWebPreviewUrl()}${normalized}`;
}
