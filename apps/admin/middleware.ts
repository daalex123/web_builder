import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "cms_session";

let cachedSessionToken: string | null = null;

async function getSessionToken(): Promise<string> {
  if (cachedSessionToken) return cachedSessionToken;

  const secret = process.env.AUTH_SECRET ?? "cms-dev-secret";
  const password = process.env.ADMIN_PASSWORD ?? "admin123";
  const data = new TextEncoder().encode(`${password}:${secret}`);
  const hash = await crypto.subtle.digest("SHA-256", data);
  cachedSessionToken = Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return cachedSessionToken;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/assistant") ||
    pathname.startsWith("/uploads") ||
    pathname.startsWith("/_next")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;
  const expected = await getSessionToken();

  if (token !== expected) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
