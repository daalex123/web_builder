import "./globals.css";
import type { Metadata } from "next";
import { loadPreviewContent } from "@preview/preview-content";
import { resolveMetadataBase } from "@cms/shared";

export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  const { site } = loadPreviewContent();
  return {
    metadataBase: resolveMetadataBase(site.url),
    title: {
      default: site.defaultSeo?.metaTitle ?? site.name,
      template: `%s | ${site.name}`,
    },
    description: site.defaultSeo?.metaDescription ?? site.description,
  };
}

export default function WebPreviewLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="min-h-screen antialiased">{children}</div>;
}
