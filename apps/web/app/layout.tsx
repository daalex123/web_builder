import "./globals.css";
import type { Metadata } from "next";
import { loadContent, resolveMetadataBase } from "@cms/shared";

export function generateMetadata(): Metadata {
  const { site } = loadContent();
  return {
    metadataBase: resolveMetadataBase(site.url),
    title: {
      default: site.defaultSeo?.metaTitle ?? site.name,
      template: `%s | ${site.name}`,
    },
    description: site.defaultSeo?.metaDescription ?? site.description,
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
