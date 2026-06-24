import Link from "next/link";
import { webPath } from "@/lib/paths";

export default function WebNotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 text-center">
      <h1 className="text-4xl font-light text-neutral-900">404</h1>
      <p className="mt-4 text-neutral-600">This page could not be found.</p>
      <Link
        href={webPath("/")}
        className="mt-6 text-xs font-semibold tracking-[0.15em] text-neutral-900"
      >
        ← BACK TO HOME
      </Link>
    </main>
  );
}
