"use client";

import { useCallback, useEffect, useState } from "react";
import type { ContentDoc, PageLayout, PageSection } from "@cms/shared/schemas";
import { normalizePageSections } from "@cms/shared/layouts";
import { PAGE_LAYOUTS } from "@cms/shared/layouts";
import { VisualPageBuilder } from "@/components/visual-page-builder";
import { LayoutSwitcher } from "@/components/layout-switcher";
import { Alert, Button, Card, Checkbox, Col, Form, Input, Row, Space, Tabs, Typography } from "antd";
import dynamic from "next/dynamic";
import { Spin } from "antd";
import { MediaPicker } from "@/components/media-library";
import { SeoPreview } from "@/components/seo-preview";
import { getMediaUrl } from "@/lib/utils";

const TipTapEditor = dynamic(
  () => import("@/components/tiptap-editor").then((m) => m.TipTapEditor),
  {
    ssr: false,
    loading: () => (
      <div style={{ padding: 48, textAlign: "center" }}>
        <Spin tip="Loading editor..." />
      </div>
    ),
  },
);

const { TextArea } = Input;

type BuilderPage = {
  id: string;
  title?: string;
  layout?: string;
  sections?: string | null;
  status?: string;
  content?: string;
  seo?: string | null;
};

export function HomepageBuilderEditor() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [siteUrl, setSiteUrl] = useState("https://example.com");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [ogPickerOpen, setOgPickerOpen] = useState(false);

  const [pageId, setPageId] = useState<string | null>(null);
  const [title, setTitle] = useState("Home");
  const [layout, setLayout] = useState<PageLayout>("homepage");
  const [sections, setSections] = useState<PageSection[]>([]);
  const [status, setStatus] = useState("draft");
  const [content, setContent] = useState<ContentDoc>({ type: "doc", content: [] });
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [canonicalUrl, setCanonicalUrl] = useState("");
  const [ogImage, setOgImage] = useState("");
  const [noIndex, setNoIndex] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/homepage/builder");
    const data = await res.json();
    const page: BuilderPage = data.page;
    const parsedSections = normalizePageSections(
      page.sections ? JSON.parse(page.sections) : [],
    ) ?? [];
    const parsedContent: ContentDoc = page.content
      ? JSON.parse(page.content)
      : { type: "doc", content: [] };
    const parsedSeo = page.seo ? JSON.parse(page.seo) : {};

    setPageId(page.id);
    setTitle(page.title ?? "Home");
    setLayout((page.layout as PageLayout) ?? "homepage");
    setSections(parsedSections);
    setStatus(page.status ?? "draft");
    setContent(parsedContent);
    setMetaTitle(parsedSeo.metaTitle ?? "");
    setMetaDescription(parsedSeo.metaDescription ?? "");
    setCanonicalUrl(parsedSeo.canonicalUrl ?? "");
    setOgImage(parsedSeo.ogImage ?? "");
    setNoIndex(parsedSeo.noIndex ?? false);
    setSiteUrl(data.settings?.url ?? "https://example.com");
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function save(newStatus?: string) {
    setSaving(true);
    setMessage(null);

    const payload = {
      title,
      layout,
      sections: normalizePageSections(sections) ?? sections,
      status: newStatus ?? status,
      content,
      seo: {
        metaTitle: metaTitle || title,
        metaDescription,
        canonicalUrl: canonicalUrl || undefined,
        ogImage: ogImage || undefined,
        noIndex,
      },
    };

    const res = await fetch("/api/homepage/builder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      setPageId(data.page.id);
      setStatus(payload.status);
      setMessage({
        type: "success",
        text:
          payload.status === "published"
            ? "Homepage published. Run Publish to update the live site."
            : "Homepage saved as draft",
      });
    } else {
      setMessage({ type: "error", text: "Failed to save homepage" });
    }
    setSaving(false);
  }

  if (loading) return <Spin style={{ display: "block", margin: "48px auto" }} />;

  const layoutName = PAGE_LAYOUTS.find((l) => l.id === layout)?.name ?? layout;
  const homeUrl = `${siteUrl.replace(/\/$/, "")}/`;

  return (
    <div>
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="Custom homepage"
        description="Design your site home page (/) with the visual builder. Save & publish here, then use Publish in the sidebar to rebuild the static site."
      />

      <Space style={{ marginBottom: 16 }} wrap>
        <Typography.Text type="secondary">Layout: {layoutName}</Typography.Text>
        <Typography.Text type="secondary">URL: {homeUrl}</Typography.Text>
        <Typography.Text type={status === "published" ? "success" : "secondary"}>
          {status === "published" ? "Published" : "Draft"}
        </Typography.Text>
        {message ? (
          <Alert type={message.type} message={message.text} showIcon style={{ padding: "4px 12px" }} />
        ) : null}
        <Button onClick={() => save("draft")} loading={saving}>
          Save Draft
        </Button>
        <Button type="primary" onClick={() => save("published")} loading={saving}>
          Save & Set as Home
        </Button>
      </Space>

      <Tabs
        defaultActiveKey="builder"
        items={[
          {
            key: "builder",
            label: "Visual Builder",
            children: (
              <VisualPageBuilder
                title={title}
                content={content}
                layout={layout}
                sections={sections}
                onLayoutChange={setLayout}
                onSectionsChange={setSections}
              />
            ),
          },
          {
            key: "layout",
            label: "Layout",
            children: (
              <Card title="Homepage layout">
                <LayoutSwitcher value={layout} onChange={setLayout} />
              </Card>
            ),
          },
          {
            key: "content",
            label: "Settings",
            children: (
              <Row gutter={[24, 24]}>
                <Col xs={24} lg={16}>
                  <Card>
                    <Form layout="vertical">
                      <Form.Item label="Page title (browser tab / SEO)">
                        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                      </Form.Item>
                      <Form.Item label="Optional body content (below widgets)">
                        <TipTapEditor content={content} onChange={setContent} />
                      </Form.Item>
                    </Form>
                  </Card>
                </Col>
              </Row>
            ),
          },
          {
            key: "seo",
            label: "SEO",
            children: (
              <Row gutter={[24, 24]}>
                <Col xs={24} lg={12}>
                  <Card>
                    <Form layout="vertical">
                      <Form.Item label="Meta Title">
                        <Input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} placeholder={title} />
                      </Form.Item>
                      <Form.Item label="Meta Description">
                        <TextArea
                          value={metaDescription}
                          onChange={(e) => setMetaDescription(e.target.value)}
                          rows={4}
                        />
                      </Form.Item>
                      <Form.Item label="Canonical URL">
                        <Input value={canonicalUrl} onChange={(e) => setCanonicalUrl(e.target.value)} placeholder={homeUrl} />
                      </Form.Item>
                      <Form.Item label="Social / OG Image">
                        <Space.Compact style={{ width: "100%" }}>
                          <Input value={ogImage} onChange={(e) => setOgImage(e.target.value)} placeholder="/uploads/..." />
                          <Button onClick={() => setOgPickerOpen(true)}>Browse</Button>
                        </Space.Compact>
                        {ogImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={getMediaUrl(ogImage)}
                            alt="OG preview"
                            style={{ marginTop: 8, height: 96, borderRadius: 6, objectFit: "cover" }}
                          />
                        ) : null}
                      </Form.Item>
                      <Checkbox checked={noIndex} onChange={(e) => setNoIndex(e.target.checked)}>
                        Hide from search engines (noindex)
                      </Checkbox>
                    </Form>
                  </Card>
                </Col>
                <Col xs={24} lg={12}>
                  <SeoPreview
                    title={metaTitle || title}
                    description={metaDescription}
                    url={canonicalUrl || homeUrl}
                  />
                </Col>
              </Row>
            ),
          },
        ]}
      />

      <MediaPicker
        open={ogPickerOpen}
        onClose={() => setOgPickerOpen(false)}
        onSelect={(item) => setOgImage(item.url)}
        filter="image"
      />

      {pageId ? (
        <Typography.Text type="secondary" style={{ display: "block", marginTop: 16, fontSize: 12 }}>
          Home page record: {pageId}
        </Typography.Text>
      ) : null}
    </div>
  );
}
