import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CMS",
  description: "WordPress-like CMS with admin dashboard and live preview",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
