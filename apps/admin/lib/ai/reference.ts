import type { ReferenceContext } from "./types";

const FETCH_TIMEOUT_MS = 12_000;
const MAX_TEXT_LENGTH = 4_000;

function isBlockedHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".local")) return true;
  if (host === "127.0.0.1" || host === "::1" || host === "0.0.0.0") return true;
  if (/^10\./.test(host)) return true;
  if (/^192\.168\./.test(host)) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(host)) return true;
  return false;
}

export function parseReferenceUrl(raw: string): URL | null {
  try {
    const url = new URL(raw.trim());
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (isBlockedHost(url.hostname)) return null;
    return url;
  } catch {
    return null;
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function metaContent(html: string, name: string): string | undefined {
  const patterns = [
    new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${name}["']`, "i"),
    new RegExp(`<meta[^>]+property=["']og:${name}["'][^>]+content=["']([^"']+)["']`, "i"),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return match[1].trim();
  }
  return undefined;
}

function titleFromHtml(html: string): string | undefined {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match?.[1]?.trim();
}

export async function fetchReferenceContext(url: string): Promise<ReferenceContext> {
  const parsed = parseReferenceUrl(url);
  if (!parsed) {
    throw new Error("Invalid reference URL. Use a public http(s) link.");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(parsed.toString(), {
      signal: controller.signal,
      headers: {
        "User-Agent": "CMS-AI-PageBuilder/1.0",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error(`Could not fetch reference URL (${response.status})`);
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html") && !contentType.includes("application/xhtml")) {
      throw new Error("Reference URL must return an HTML page");
    }

    const html = await response.text();
    const pageTitle = titleFromHtml(html);
    const description =
      metaContent(html, "description") ?? metaContent(html, "title");
    const excerpt = stripHtml(html).slice(0, MAX_TEXT_LENGTH);

    return {
      url: parsed.toString(),
      pageTitle,
      description,
      excerpt: excerpt || undefined,
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function fileToDataUrl(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const mime = file.type || "image/png";
  return `data:${mime};base64,${buffer.toString("base64")}`;
}

export function isSupportedReferenceImage(file: File): boolean {
  return ["image/png", "image/jpeg", "image/webp", "image/gif"].includes(file.type);
}
