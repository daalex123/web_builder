"use client";

import { useCallback, useEffect, useState } from "react";
import type { Homepage } from "@cms/shared/schemas";
import type { SiteSettings } from "@cms/shared/schemas";
import {
  HOMEPAGE_THEME_OPTIONS,
  getThemeOption,
  hasStructuredHomepage,
} from "@cms/shared/theme-presets/options";
import { Alert, Button, Card, Form, Input, Segmented, Space, Spin, Tag, Typography } from "antd";
import { CheckOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/page-header";
import { HomepageBuilderEditor } from "@/components/homepage-builder-editor";
import { ProductPicker } from "@/components/product-picker";
import { isEcommerceEnabled } from "@cms/shared/ecommerce";

const { TextArea } = Input;
const { Text, Link } = Typography;

export default function HomepageEditorPage() {
  const [homepage, setHomepage] = useState<Homepage | null>(null);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [mode, setMode] = useState<"builder" | "structured">("builder");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [applyingTheme, setApplyingTheme] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null,
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    const [homepageRes, settingsRes] = await Promise.all([
      fetch("/api/homepage"),
      fetch("/api/settings"),
    ]);
    const homepageData = await homepageRes.json();
    const settingsData = await settingsRes.json();
    setHomepage(homepageData && !homepageData.error ? homepageData : null);
    setSettings(settingsData);
    setMode(settingsData?.homepageSource === "structured" ? "structured" : "builder");
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function saveStructured() {
    if (!homepage) return;
    setSaving(true);
    const res = await fetch("/api/homepage", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(homepage),
    });
    if (res.ok) {
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...settings, homepageSource: "structured" }),
      });
      setMode("structured");
      setMessage({ type: "success", text: "Theme homepage saved" });
    } else {
      setMessage({ type: "error", text: "Failed to save" });
    }
    setSaving(false);
  }

  async function applyTheme(themeId: string) {
    setApplyingTheme(themeId);
    setMessage(null);
    const res = await fetch("/api/homepage/apply-theme", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ themeId }),
    });
    if (res.ok) {
      const data = await res.json();
      setHomepage(data.homepage);
      setSettings(data.settings);
      setMode("structured");
      const label = getThemeOption(themeId)?.label ?? themeId;
      setMessage({
        type: "success",
        text: `${label} applied. Publish to preview the live site.`,
      });
    } else {
      const data = await res.json().catch(() => ({}));
      setMessage({ type: "error", text: data.error ?? "Failed to apply theme" });
    }
    setApplyingTheme(null);
  }

  function updateHero(index: number, field: string, value: string) {
    setHomepage((current) => {
      if (!current) return current;
      const slides = [...current.heroSlides];
      slides[index] = { ...slides[index], [field]: value };
      return { ...current, heroSlides: slides };
    });
  }

  function updateFeature(index: number, field: string, value: string) {
    setHomepage((current) => {
      if (!current) return current;
      const features = [...current.features];
      features[index] = { ...features[index], [field]: value };
      return { ...current, features };
    });
  }

  if (loading) return <Spin style={{ display: "block", margin: "48px auto" }} />;

  const activeTheme = settings?.theme ?? "default";
  const themeSupportsHomepage = hasStructuredHomepage(activeTheme);
  const activeThemeOption = getThemeOption(activeTheme);
  const ecommerceEnabled = settings ? isEcommerceEnabled(settings) : false;

  return (
    <div>
      <PageHeader
        title="Homepage"
        description="Design a custom home page with the visual builder, or use a theme storefront layout"
        extra={
          mode === "structured" && homepage && themeSupportsHomepage ? (
            <Button type="primary" onClick={saveStructured} loading={saving}>
              Save Theme Homepage
            </Button>
          ) : null
        }
      />

      {message ? (
        <Alert type={message.type} message={message.text} showIcon style={{ marginBottom: 16 }} />
      ) : null}

      <Card style={{ marginBottom: 24 }}>
        <Typography.Text strong style={{ display: "block", marginBottom: 8 }}>
          Homepage mode
        </Typography.Text>
        <Segmented
          value={mode}
          onChange={(value) => setMode(value as "builder" | "structured")}
          options={[
            { label: "Custom page builder", value: "builder" },
            {
              label: "Theme storefront",
              value: "structured",
              disabled: !themeSupportsHomepage,
            },
          ]}
        />
        <Typography.Text type="secondary" style={{ display: "block", marginTop: 8, fontSize: 13 }}>
          {mode === "builder"
            ? "Drag-and-drop widgets from the left panel — including Featured Products, Category Products, and Product Slider under E-commerce."
            : "Theme storefront mode uses fixed theme sections. Switch to Custom page builder for drag-and-drop product widgets."}
        </Typography.Text>
      </Card>

      {mode === "structured" && ecommerceEnabled ? (
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
          message="Looking for product widgets?"
          description='Product widgets (Featured Products, Category Products, Product Slider) are in the Visual Builder. Switch homepage mode to "Custom page builder" above, or add them on any page via Pages → Edit → Visual Builder tab.'
        />
      ) : null}

      {mode === "builder" ? (
        <HomepageBuilderEditor />
      ) : (
        <>
          <Card title="Apply a homepage theme" style={{ marginBottom: 24 }}>
            <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
              Pick a theme below to load its demo homepage, navigation menus, and site styling.
            </Text>

            {activeThemeOption ? (
              <div style={{ marginBottom: 16 }}>
                Active theme:{" "}
                <Tag color={themeSupportsHomepage ? "blue" : "default"}>
                  {activeThemeOption.label}
                </Tag>
              </div>
            ) : null}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: 16,
              }}
            >
              {HOMEPAGE_THEME_OPTIONS.filter((t) => t.value !== "finez").map((theme) => {
                const isActive = activeTheme === theme.value;
                return (
                  <Card
                    key={theme.value}
                    size="small"
                    style={{
                      borderColor: isActive ? "#1677ff" : undefined,
                      background: isActive ? "#f0f5ff" : undefined,
                    }}
                  >
                    <Typography.Title level={5} style={{ marginTop: 0 }}>
                      {theme.label}
                      {isActive ? (
                        <CheckOutlined style={{ color: "#1677ff", marginLeft: 8 }} />
                      ) : null}
                    </Typography.Title>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      {theme.description}
                    </Text>
                    {theme.sourceUrl ? (
                      <div style={{ marginTop: 8 }}>
                        <Link href={theme.sourceUrl} target="_blank" style={{ fontSize: 12 }}>
                          View reference
                        </Link>
                      </div>
                    ) : null}
                    <Button
                      type={isActive ? "default" : "primary"}
                      block
                      style={{ marginTop: 12 }}
                      loading={applyingTheme === theme.value}
                      onClick={() => applyTheme(theme.value)}
                    >
                      {isActive ? "Re-apply demo content" : "Apply to homepage"}
                    </Button>
                  </Card>
                );
              })}
            </div>
          </Card>

          {!homepage || !themeSupportsHomepage ? (
            <Alert
              type="info"
              showIcon
              message="No structured homepage yet"
              description="Select a theme above and click Apply to homepage."
            />
          ) : (
            <>
              <Card title="Hero Slides" style={{ marginBottom: 24 }}>
                {homepage.heroSlides.map((slide, index) => (
                  <Card key={index} size="small" type="inner" style={{ marginBottom: 16 }}>
                    <Form layout="vertical">
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                        <Form.Item label="Title" style={{ marginBottom: 8 }}>
                          <Input
                            value={slide.title}
                            onChange={(e) => updateHero(index, "title", e.target.value)}
                          />
                        </Form.Item>
                        <Form.Item label="CTA Label" style={{ marginBottom: 8 }}>
                          <Input
                            value={slide.ctaLabel}
                            onChange={(e) => updateHero(index, "ctaLabel", e.target.value)}
                          />
                        </Form.Item>
                      </div>
                      <Form.Item label="Subtitle" style={{ marginBottom: 8 }}>
                        <Input
                          value={slide.subtitle}
                          onChange={(e) => updateHero(index, "subtitle", e.target.value)}
                        />
                      </Form.Item>
                      <Form.Item label="Image URL" style={{ marginBottom: 0 }}>
                        <Input
                          value={slide.image}
                          onChange={(e) => updateHero(index, "image", e.target.value)}
                        />
                      </Form.Item>
                    </Form>
                  </Card>
                ))}
              </Card>

              <Card title="Trust Badges" style={{ marginBottom: 24 }}>
                {homepage.features.map((feature, index) => (
                  <div
                    key={index}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 12,
                      marginBottom: 12,
                    }}
                  >
                    <Input
                      value={feature.title}
                      onChange={(e) => updateFeature(index, "title", e.target.value)}
                      placeholder="Title"
                    />
                    <Input
                      value={feature.subtitle}
                      onChange={(e) => updateFeature(index, "subtitle", e.target.value)}
                      placeholder="Subtitle"
                    />
                  </div>
                ))}
              </Card>

              {ecommerceEnabled ? (
                <Card title="Best Sellers" style={{ marginBottom: 24 }}>
                  <Text type="secondary" style={{ display: "block", marginBottom: 12 }}>
                    Pick published products to feature. Leave empty to use the inline demo products
                    from your theme preset.
                  </Text>
                  <ProductPicker
                    value={homepage.bestSellerSlugs ?? []}
                    onChange={(bestSellerSlugs) =>
                      setHomepage({ ...homepage, bestSellerSlugs })
                    }
                    placeholder="Select best seller products"
                  />
                </Card>
              ) : null}

              {ecommerceEnabled
                ? homepage.categorySections.map((section, index) => (
                    <Card
                      key={section.title}
                      title={`Category: ${section.title}`}
                      style={{ marginBottom: 24 }}
                    >
                      <ProductPicker
                        value={section.productSlugs ?? []}
                        onChange={(productSlugs) => {
                          const categorySections = [...homepage.categorySections];
                          categorySections[index] = { ...section, productSlugs };
                          setHomepage({ ...homepage, categorySections });
                        }}
                        placeholder="Select products for this section"
                      />
                    </Card>
                  ))
                : null}

              <Card title="CTA Banner" style={{ marginBottom: 24 }}>
                <Form layout="vertical">
                  <Form.Item label="Title">
                    <Input
                      value={homepage.ctaBanner.title}
                      onChange={(e) =>
                        setHomepage({
                          ...homepage,
                          ctaBanner: { ...homepage.ctaBanner, title: e.target.value },
                        })
                      }
                    />
                  </Form.Item>
                  <Form.Item label="Body">
                    <TextArea
                      rows={3}
                      value={homepage.ctaBanner.body}
                      onChange={(e) =>
                        setHomepage({
                          ...homepage,
                          ctaBanner: { ...homepage.ctaBanner, body: e.target.value },
                        })
                      }
                    />
                  </Form.Item>
                </Form>
              </Card>

              <Card title="Newsletter">
                <Input
                  value={homepage.newsletter.title}
                  onChange={(e) =>
                    setHomepage({
                      ...homepage,
                      newsletter: { ...homepage.newsletter, title: e.target.value },
                    })
                  }
                />
              </Card>
            </>
          )}
        </>
      )}
    </div>
  );
}
