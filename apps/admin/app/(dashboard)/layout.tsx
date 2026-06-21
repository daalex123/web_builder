import { AdminShell } from "@/components/admin-shell";
import { getSiteSettings } from "@cms/db";
import { isEcommerceEnabled } from "@cms/shared/ecommerce";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  const ecommerceEnabled = settings ? isEcommerceEnabled(settings) : false;
  return <AdminShell ecommerceEnabled={ecommerceEnabled}>{children}</AdminShell>;
}
