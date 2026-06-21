import "./globals.css";
import type { Metadata } from "next";
import { AntdProvider } from "@/components/antd-provider";

export const metadata: Metadata = {
  title: "CMS Admin",
  description: "WordPress-like CMS admin dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AntdProvider>{children}</AntdProvider>
      </body>
    </html>
  );
}
