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
import { adminPath, getWebPreviewUrl } from "@/lib/paths";

const { Sider, Content, Header } = Layout;

function navLink(path: string, label: string) {
  const href = adminPath(path);
  return { key: href, href, label: <Link href={href}>{label}</Link> };
}

const baseNavItems = [
  { ...navLink("/dashboard", "Dashboard"), icon: <DashboardOutlined /> },
  { ...navLink("/pages", "Pages"), icon: <FileTextOutlined /> },
  { ...navLink("/ai-page-builder", "AI Builder"), icon: <RobotOutlined /> },
  { ...navLink("/cms-assistant", "CMS Guide"), icon: <QuestionCircleOutlined /> },
  { ...navLink("/templates", "Templates"), icon: <LayoutOutlined /> },
  { ...navLink("/media", "Media"), icon: <PictureOutlined /> },
  { ...navLink("/menus", "Menus"), icon: <MenuOutlined /> },
  { ...navLink("/navigation", "Navigation"), icon: <SkinOutlined /> },
  { ...navLink("/assistant", "Sales Assistant"), icon: <CustomerServiceOutlined /> },
  { ...navLink("/settings", "Site Settings"), icon: <SettingOutlined /> },
  { ...navLink("/homepage", "Homepage"), icon: <HomeOutlined /> },
  { ...navLink("/publish", "Publish"), icon: <CloudUploadOutlined /> },
];

const productsNavItem = {
  ...navLink("/products", "Products"),
  icon: <ShoppingOutlined />,
};

function getNavItems(ecommerceEnabled: boolean) {
  if (!ecommerceEnabled) return baseNavItems;
  const items = [...baseNavItems];
  const homepageIndex = items.findIndex((item) => item.key === adminPath("/homepage"));
  items.splice(homepageIndex, 0, productsNavItem);
  return items;
}

function getSelectedKey(pathname: string, navItems: ReturnType<typeof getNavItems>) {
  const match = navItems.find(
    (item) => pathname === item.key || pathname.startsWith(`${item.key}/`),
  );
  return match?.key ?? adminPath("/dashboard");
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
    router.push(adminPath("/login"));
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
