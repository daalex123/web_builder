"use client";

import { useEffect, useState } from "react";
import type { SiteSettings } from "@cms/shared/schemas";
import type { NavigationSettings } from "@cms/shared/navigation";
import { Alert, Button, Card, Spin } from "antd";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { NavigationSettingsForm } from "@/components/navigation-settings-form";
import { getMediaUrl } from "@/lib/utils";

export default function NavigationPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then(setSettings);
  }, []);

  if (!settings) return <Spin style={{ display: "block", margin: "48px auto" }} />;

  const nav: NavigationSettings = settings.navigation ?? {};

  function updateNav(patch: Partial<NavigationSettings>) {
    setSettings((prev) => {
      if (!prev) return prev;
      return { ...prev, navigation: { ...(prev.navigation ?? {}), ...patch } };
    });
  }

  async function save() {
    setSaving(true);
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setMessage(
      res.ok
        ? { type: "success", text: "Navigation settings saved. Refresh the preview site to see changes." }
        : { type: "error", text: "Failed to save navigation settings" },
    );
    setSaving(false);
  }

  function resetToThemeDefault() {
    setSettings((prev) => {
      if (!prev) return prev;
      const { navigation: _removed, ...rest } = prev;
      return rest as SiteSettings;
    });
    setMessage({ type: "success", text: "Cleared overrides — theme defaults will apply after save." });
  }

  return (
    <div>
      <PageHeader
        title="Main Navigation"
        description="Header layout, menu styles, dropdowns, mobile menu, and top bar"
        extra={
          <>
            <Button onClick={resetToThemeDefault} style={{ marginRight: 8 }}>
              Use theme defaults
            </Button>
            <Button type="primary" onClick={save} loading={saving}>
              Save navigation
            </Button>
          </>
        }
      />

      {message ? (
        <Alert type={message.type} message={message.text} showIcon style={{ marginBottom: 16 }} />
      ) : null}

      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16, maxWidth: 900 }}
        message="Header types & logo"
        description={
          <span>
            Pick a <strong>header layout style</strong> below (Classic, Underline, Pill, Centered, Minimal, Mega, Split).
            Upload your logo under <Link href="/admin/settings">Site Settings → Logo & branding</Link>.
            {settings.logo ? (
              <>
                {" "}
                Current logo:{" "}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getMediaUrl(settings.logo)}
                  alt=""
                  style={{ height: 24, verticalAlign: "middle", marginLeft: 4 }}
                />
              </>
            ) : (
              <> Using text logo: <strong>{settings.name}</strong></>
            )}
          </span>
        }
      />

      <Card style={{ maxWidth: nav.headerMode === "builder" ? "100%" : 900 }}>
        <NavigationSettingsForm nav={nav} onChange={updateNav} siteName={settings.name} hasLogo={Boolean(settings.logo)} />
      </Card>
    </div>
  );
}
