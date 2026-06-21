"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { isEcommerceEnabled } from "@cms/shared/ecommerce";
import {
  CloudUploadOutlined,
  CustomerServiceOutlined,
  DashboardOutlined,
  FileTextOutlined,
  HomeOutlined,
  LayoutOutlined,
  LogoutOutlined,
  MenuOutlined,
  PictureOutlined,
  QuestionCircleOutlined,
  RobotOutlined,
  SettingOutlined,
  ShoppingOutlined,
  SkinOutlined,
} from "@ant-design/icons";
import { Button, Layout, Menu, Typography } from "antd";
import { CmsAssistantDrawer } from "./cms-assistant-drawer";
import { getWebPreviewUrl } from "@/lib/utils";

const { Sider, Content, Header } = Layout;

const baseNavItems = [
  { key: "/dashboard", icon: <DashboardOutlined />, label: <Link href="/dashboard">Dashboard</Link> },
  { key: "/pages", icon: <FileTextOutlined />, label: <Link href="/pages">Pages</Link> },
  { key: "/ai-page-builder", icon: <RobotOutlined />, label: <Link href="/ai-page-builder">AI Builder</Link> },
  { key: "/cms-assistant", icon: <QuestionCircleOutlined />, label: <Link href="/cms-assistant">CMS Guide</Link> },
  { key: "/templates", icon: <LayoutOutlined />, label: <Link href="/templates">Templates</Link> },
  { key: "/media", icon: <PictureOutlined />, label: <Link href="/media">Media</Link> },
  { key: "/menus", icon: <MenuOutlined />, label: <Link href="/menus">Menus</Link> },
  { key: "/navigation", icon: <SkinOutlined />, label: <Link href="/navigation">Navigation</Link> },
  { key: "/assistant", icon: <CustomerServiceOutlined />, label: <Link href="/assistant">Sales Assistant</Link> },
  { key: "/settings", icon: <SettingOutlined />, label: <Link href="/settings">Site Settings</Link> },
  { key: "/homepage", icon: <HomeOutlined />, label: <Link href="/homepage">Homepage</Link> },
  { key: "/publish", icon: <CloudUploadOutlined />, label: <Link href="/publish">Publish</Link> },
];

const productsNavItem = {
  key: "/products",
  icon: <ShoppingOutlined />,
  label: <Link href="/products">Products</Link>,
};

function getNavItems(ecommerceEnabled: boolean) {
  if (!ecommerceEnabled) return baseNavItems;
  const items = [...baseNavItems];
  const homepageIndex = items.findIndex((item) => item.key === "/homepage");
  items.splice(homepageIndex, 0, productsNavItem);
  return items;
}

function getSelectedKey(pathname: string, navItems: ReturnType<typeof getNavItems>) {
  const match = navItems.find(
    (item) => pathname === item.key || pathname.startsWith(`${item.key}/`),
  );
  return match?.key ?? "/dashboard";
}

export function AdminShell({
  children,
  ecommerceEnabled: initialEcommerceEnabled = false,
}: {
  children: React.ReactNode;
  ecommerceEnabled?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [ecommerceEnabled, setEcommerceEnabled] = useState(initialEcommerceEnabled);

  useEffect(() => {
    setEcommerceEnabled(initialEcommerceEnabled);
  }, [initialEcommerceEnabled]);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((settings) => {
        if (settings && !settings.error) {
          setEcommerceEnabled(isEcommerceEnabled(settings));
        }
      })
      .catch(() => {});
  }, [pathname]);

  const navItems = getNavItems(ecommerceEnabled);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        width={240}
        theme="dark"
        breakpoint="lg"
        collapsedWidth={0}
        style={{ position: "sticky", top: 0, height: "100vh" }}
      >
        <div style={{ padding: "20px 16px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <Typography.Title level={4} style={{ color: "#fff", margin: 0 }}>
            CMS Admin
          </Typography.Title>
          <Typography.Text style={{ color: "rgba(255,255,255,0.45)", fontSize: 12 }}>
            Content management
          </Typography.Text>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[getSelectedKey(pathname, navItems)]}
          items={navItems}
          style={{ border: 0, marginTop: 8 }}
        />
        <div style={{ padding: 16, position: "absolute", bottom: 0, width: "100%" }}>
          <Button
            block
            icon={<LogoutOutlined />}
            onClick={logout}
            ghost
          >
            Log out
          </Button>
        </div>
      </Sider>
      <Layout>
        <Header
          style={{
            background: "#fff",
            padding: "0 24px",
            borderBottom: "1px solid #f0f0f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography.Text type="secondary">Manage your static website content</Typography.Text>
          <Button type="link" href={getWebPreviewUrl()} target="_blank">
            View live preview
          </Button>
        </Header>
        <Content style={{ margin: 24, minHeight: 280 }}>{children}</Content>
      </Layout>
      <CmsAssistantDrawer />
    </Layout>
  );
}
