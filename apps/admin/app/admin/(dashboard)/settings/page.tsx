"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { SiteSettings } from "@cms/shared/schemas";
import { THEME_OPTIONS, getThemeOption } from "@cms/shared/theme-presets/options";
import { Alert, Button, Card, Form, Input, Select, Space, Spin, Switch, Typography } from "antd";
import { PageHeader } from "@/components/page-header";
import { MediaPicker } from "@/components/media-library";
import { LogoSizeControls } from "@/components/logo-size-controls";
import { getMediaUrl } from "@/lib/utils";

const { TextArea } = Input;
const { Text } = Typography;

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadingPreset, setLoadingPreset] = useState(false);
  const [logoPickerOpen, setLogoPickerOpen] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then(setSettings);
  }, []);

  if (!settings) return <Spin style={{ display: "block", margin: "48px auto" }} />;

  const selectedTheme = getThemeOption(settings.theme);

  async function save() {
    setSaving(true);
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setMessage(res.ok ? { type: "success", text: "Settings saved" } : { type: "error", text: "Failed to save" });
    if (res.ok) {
      router.refresh();
    }
    setSaving(false);
  }

  async function loadThemePreset() {
    if (!settings) return;
    setLoadingPreset(true);
    setMessage(null);
    const res = await fetch("/api/settings/apply-theme-preset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ themeId: settings.theme }),
    });
    if (res.ok) {
      const data = await res.json();
      setSettings(data.settings);
      setMessage({
        type: "success",
        text: "Theme demo content loaded (homepage, menus, and site info). Publish to preview.",
      });
    } else {
      const data = await res.json().catch(() => ({}));
      setMessage({
        type: "error",
        text: data.error ?? "Failed to load theme preset",
      });
    }
    setLoadingPreset(false);
  }

  return (
    <div>
      <PageHeader
        title="Site Settings"
        description="Global site configuration"
        extra={
          <Button type="primary" onClick={save} loading={saving}>
            Save Settings
          </Button>
        }
      />

      {message ? (
        <Alert type={message.type} message={message.text} showIcon style={{ marginBottom: 16 }} />
      ) : null}

      <Card title="Logo & branding" style={{ maxWidth: 720, marginBottom: 24 }}>
        <Form layout="vertical">
          <Form.Item
            label="Site logo"
            extra="PNG or SVG with transparent background works best. Leave empty to show the site name as text."
          >
            <Space direction="vertical" style={{ width: "100%" }}>
              {settings.logo ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    padding: 16,
                    border: "1px solid #f0f0f0",
                    borderRadius: 8,
                    background: "#fafafa",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getMediaUrl(settings.logo)}
                    alt={settings.logoAlt ?? settings.name}
                    style={{ maxHeight: 56, maxWidth: 200, objectFit: "contain" }}
                  />
                  <Space>
                    <Button onClick={() => setLogoPickerOpen(true)}>Change logo</Button>
                    <Button danger onClick={() => setSettings({ ...settings, logo: undefined })}>
                      Remove
                    </Button>
                  </Space>
                </div>
              ) : (
                <Button type="dashed" block onClick={() => setLogoPickerOpen(true)}>
                  Upload logo image
                </Button>
              )}
            </Space>
          </Form.Item>
          <Form.Item label="Logo alt text" extra="For accessibility and SEO when using an image logo">
            <Input
              value={settings.logoAlt ?? ""}
              onChange={(e) => setSettings({ ...settings, logoAlt: e.target.value })}
              placeholder={settings.name}
            />
          </Form.Item>
          <Form.Item label="Logo display size">
            <LogoSizeControls
              nav={settings.navigation ?? {}}
              onChange={(patch) =>
                setSettings({
                  ...settings,
                  navigation: { ...(settings.navigation ?? {}), ...patch },
                })
              }
            />
          </Form.Item>
          <Alert
            type="info"
            showIcon
            message="Header layout styles"
            description={
              <>
                Choose from 7 header types (Classic, Underline, Pill, Centered, Minimal, Mega, Split) under{" "}
                <a href="/admin/navigation">Main Navigation</a>.
              </>
            }
          />
        </Form>
      </Card>

      <Card style={{ maxWidth: 720, marginBottom: 24 }}>
        <Form layout="vertical">
          <Form.Item label="Site Name">
            <Input
              value={settings.name}
              onChange={(e) => setSettings({ ...settings, name: e.target.value })}
            />
          </Form.Item>
          <Form.Item label="Description">
            <TextArea
              rows={3}
              value={settings.description}
              onChange={(e) => setSettings({ ...settings, description: e.target.value })}
            />
          </Form.Item>
          <Form.Item label="Site URL">
            <Input
              value={settings.url}
              onChange={(e) => setSettings({ ...settings, url: e.target.value })}
            />
          </Form.Item>
          <Form.Item
            label="Theme"
            extra={
              selectedTheme?.description ? (
                <Text type="secondary">{selectedTheme.description}</Text>
              ) : null
            }
          >
            <Select
              value={settings.theme}
              onChange={(theme) => setSettings({ ...settings, theme })}
              options={THEME_OPTIONS.map((t) => ({
                value: t.value,
                label: t.label,
              }))}
            />
          </Form.Item>
          {selectedTheme?.sourceUrl ? (
            <Form.Item label="Theme reference">
              <Space direction="vertical" style={{ width: "100%" }}>
                <a href={selectedTheme.sourceUrl} target="_blank" rel="noreferrer">
                  {selectedTheme.sourceUrl}
                </a>
                <Button onClick={loadThemePreset} loading={loadingPreset}>
                  Load theme demo content
                </Button>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Loads placeholder homepage, menus, and site copy for this theme. Existing
                  homepage data will be replaced.
                </Text>
              </Space>
            </Form.Item>
          ) : null}
          <Form.Item label="Meta Title">
            <Input
              value={settings.defaultSeo?.metaTitle ?? ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  defaultSeo: { ...settings.defaultSeo, metaTitle: e.target.value },
                })
              }
            />
          </Form.Item>
          <Form.Item label="Meta Description">
            <TextArea
              rows={2}
              value={settings.defaultSeo?.metaDescription ?? ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  defaultSeo: { ...settings.defaultSeo, metaDescription: e.target.value },
                })
              }
            />
          </Form.Item>
          <Form.Item label="Email">
            <Input
              value={settings.contact?.email ?? ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  contact: { ...settings.contact, email: e.target.value },
                })
              }
            />
          </Form.Item>
          <Form.Item label="Phone Numbers (comma separated)">
            <Input
              value={settings.contact?.phones?.join(", ") ?? ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  contact: {
                    ...settings.contact,
                    phones: e.target.value.split(",").map((p) => p.trim()).filter(Boolean),
                  },
                })
              }
            />
          </Form.Item>
        </Form>
      </Card>

      <Card title="Modules" style={{ maxWidth: 720 }}>
        <Form layout="vertical">
          <Form.Item
            label="Enable E-commerce"
            extra="Adds product catalog management and /shop/ pages on the public site"
          >
            <Switch
              checked={settings.modules?.ecommerce?.enabled ?? false}
              onChange={(enabled) =>
                setSettings({
                  ...settings,
                  modules: {
                    ...settings.modules,
                    ecommerce: { enabled },
                  },
                })
              }
            />
          </Form.Item>
        </Form>
      </Card>

      <MediaPicker
        open={logoPickerOpen}
        onClose={() => setLogoPickerOpen(false)}
        onSelect={(item) => {
          setSettings({ ...settings, logo: item.url });
          setLogoPickerOpen(false);
        }}
        filter="image"
      />
    </div>
  );
}
