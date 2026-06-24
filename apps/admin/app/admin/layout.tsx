import "../globals.css";
import { AntdProvider } from "@/components/antd-provider";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AntdProvider>{children}</AntdProvider>;
}
