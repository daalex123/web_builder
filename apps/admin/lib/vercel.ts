/** True when running on Vercel (server or build). */
export function isVercel(): boolean {
  return process.env.VERCEL === "1";
}

/** Public site URL for this deployment (no trailing slash). */
export function getDeploymentUrl(): string | null {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) {
    return /^https?:\/\//i.test(explicit)
      ? explicit.replace(/\/$/, "")
      : `https://${explicit.replace(/\/$/, "")}`;
  }

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    return `https://${vercel.replace(/\/$/, "")}`;
  }

  return null;
}

/** Static HTML zip build requires a writable filesystem — not available on Vercel. */
export function canRunStaticBuild(): boolean {
  return !isVercel();
}
