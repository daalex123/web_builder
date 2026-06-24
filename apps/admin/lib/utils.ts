import path from "path";
import { getWebPreviewUrl } from "./paths";

export function getWebContentDir() {
  return path.resolve(
    process.cwd(),
    process.env.WEB_CONTENT_DIR ?? "content",
  );
}

/** JSON export target for the static site build (apps/web). */
export function getStaticBuildContentDir() {
  return path.resolve(
    process.cwd(),
    process.env.STATIC_CONTENT_DIR ?? "../../apps/web/content",
  );
}

export function getUploadDir() {
  return path.resolve(
    process.cwd(),
    process.env.UPLOAD_DIR ?? "public/uploads",
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

/** Resolve a media path or URL for display in the admin UI */
export function getMediaUrl(path: string) {
  if (path.startsWith("http")) return path;
  return path.startsWith("/") ? path : `/${path}`;
}

export { getWebPreviewUrl };

/** Public site URL for copying into content (live preview under /web) */
export function getPublicMediaUrl(path: string) {
  if (path.startsWith("http")) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${getWebPreviewUrl()}${normalized}`;
}
