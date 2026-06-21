import { createHash, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "cms_session";

function getSessionToken(): string {
  const secret = process.env.AUTH_SECRET ?? "cms-dev-secret";
  const password = process.env.ADMIN_PASSWORD ?? "admin123";
  return createHash("sha256").update(`${password}:${secret}`).digest("hex");
}

export async function createSession() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, getSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return false;

  try {
    const expected = Buffer.from(getSessionToken());
    const actual = Buffer.from(token);
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}

export function verifyPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD ?? "admin123";
  return password === expected;
}

export function getSessionTokenForMiddleware(): string {
  return getSessionToken();
}
