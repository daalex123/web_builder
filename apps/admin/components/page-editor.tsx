"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ContentDoc, PageLayout, PageSection } from "@cms/shared/schemas";
import { normalizePageSections } from "@cms/shared/layouts";
import { PAGE_LAYOUTS } from "@cms/shared/layouts";
import { LayoutDesigner } from "@/components/layout-designer";
import { LayoutSwitcher } from "@/components/layout-switcher";
import { VisualPageBuilder } from "@/components/visual-page-builder";
import { Alert, Button, Card, Checkbox, Col, Form, Input, Radio, Row, Space, Tabs, Typography } from "antd";
import dynamic from "next/dynamic";
import { Spin } from "antd";
import { CopyOutlined } from "@ant-design/icons";
import { MediaPicker, type MediaItem } from "@/components/media-library";
import { SeoPreview } from "@/components/seo-preview";
import { PageHeader, StatusBadge } from "@/components/page-header";
import { getMediaUrl, slugify } from "@/lib/utils";

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

type PageData = {
  id?: string;
  title?: string;
  slug?: string;
  template?: string;
  layout?: string;
  sections?: string | null;
  status?: string;
  content?: string;
  seo?: string | null;
};

const TEMPLATES = [
  { value: "page", label: "Standard Page", desc: "Generic content page with title and body" },
  { value: "home", label: "Homepage", desc: "Marks this page as the site homepage (/) when using custom builder mode" },
];

export function PageEditor({
  initial,
  pageId,
  onSaved,
  siteUrl = "https://example.com",
}: {
  initial?: PageData;
  pageId?: string;
  onSaved?: (id: string) => void;
  siteUrl?: string;
}) {
  const router = useRouter();
  const parsedContent: ContentDoc = initial?.content
    ? JSON.parse(initial.content as string)
    : { type: "doc", content: [] };
  const parsedSeo = initial?.seo ? JSON.parse(initial.seo as string) : {};

  const parsedSections: PageSection[] = normalizePageSections(
    initial?.sections ? JSON.parse(initial.sections as string) : [],
  ) ?? [];

  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [template, setTemplate] = useState(initial?.template ?? "page");
  const [layout, setLayout] = useState<PageLayout>((initial?.layout as PageLayout) ?? "standard");
  const [sections, setSections] = useState<PageSection[]>(parsedSections);
  const [status, setStatus] = useState(initial?.status ?? "draft");
  const [content, setContent] = useState<ContentDoc>(parsedContent);
  const [metaTitle, setMetaTitle] = useState(parsedSeo.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(parsedSeo.metaDescription ?? "");
  const [canonicalUrl, setCanonicalUrl] = useState(parsedSeo.canonicalUrl ?? "");
  const [ogImage, setOgImage] = useState(parsedSeo.ogImage ?? "");
  const [noIndex, setNoIndex] = useState(parsedSeo.noIndex ?? false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [ogPickerOpen, setOgPickerOpen] = useState(false);

  const pageUrl = `${siteUrl.replace(/\/$/, "")}/${slug || slugify(title)}/`;

  async function save(newStatus?: string) {
    setSaving(true);
    setMessage(null);

    const payload = {
      title,
      slug: slug || slugify(title),
      template,
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

    const res = await fetch(pageId ? `/api/pages/${pageId}` : "/api/pages", {
      method: pageId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      setStatus(payload.status);
      setMessage({ type: "success", text: "Saved successfully" });
      onSaved?.(data.id);
    } else {
      setMessage({ type: "error", text: "Failed to save" });
    }
    setSaving(false);
  }

  async function duplicate() {
    if (!pageId) return;
    const res = await fetch(`/api/pages/${pageId}/duplicate`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      router.push(`/admin/pages/${data.id}`);
    }
  }

  async function setAsHome() {
    if (!pageId) return;
    const res = await fetch(`/api/pages/${pageId}/set-as-home`, { method: "POST" });
    if (res.ok) {
      setTemplate("home");
      setStatus("published");
      setMessage({ type: "success", text: "Set as homepage. Publish to update the live site." });
    } else {
      setMessage({ type: "error", text: "Failed to set as homepage" });
    }
  }

  async function saveAsTemplate() {
    const name = prompt("Template name", title);
    if (!name) return;
    const res = await fetch("/api/page-templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description: `Saved from ${title}`, layout, sections, content }),
    });
    if (res.ok) setMessage({ type: "success", text: "Saved as template" });
  }

  const layoutName = PAGE_LAYOUTS.find((l) => l.id === layout)?.name ?? layout;

  return (
    <div>
      <PageHeader
        title={pageId ? "Edit Page" : "New Page"}
        description={pageId ? `/${slug}/` : "Create a new page"}
        extra={
          <>
            {pageId ? (
              <Button onClick={saveAsTemplate}>Save as Template</Button>
            ) : null}
            {pageId ? (
              <Button icon={<CopyOutlined />} onClick={duplicate}>
                Duplicate
              </Button>
            ) : null}
            {pageId && template !== "home" ? (
              <Button onClick={setAsHome}>Set as Home</Button>
            ) : null}
            <Button onClick={() => save("draft")} loading={saving}>
              Save Draft
            </Button>
            <Button type="primary" onClick={() => save("published")} loading={saving}>
              Publish
            </Button>
          </>
        }
      />

      <Space style={{ marginBottom: 16 }}>
        <StatusBadge status={status} />
        <Typography.Text type="secondary">Layout: {layoutName}</Typography.Text>
        {message ? <Alert type={message.type} message={message.text} showIcon style={{ padding: "4px 12px" }} /> : null}
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
              <Card title="Choose page layout" style={{ marginBottom: 24 }}>
                <LayoutSwitcher value={layout} onChange={setLayout} />
              </Card>
            ),
          },
          {
            key: "designer",
            label: "Sections",
            children: (
              <Card title="Page sections">
                <LayoutDesigner sections={sections} onChange={setSections} />
              </Card>
            ),
          },
          {
            key: "content",
            label: "Content",
            children: (
              <Row gutter={[24, 24]}>
                <Col xs={24} lg={16}>
                  <Card>
                    <Form layout="vertical">
                      <Form.Item label="Page Title">
                        <Input
                          value={title}
                          onChange={(e) => {
                            setTitle(e.target.value);
                            if (!pageId && !slug) setSlug(slugify(e.target.value));
                          }}
                          placeholder="Enter page title"
                        />
                      </Form.Item>
                      <Form.Item
                        label="URL Slug"
                        extra={<Typography.Text type="secondary">Preview: {pageUrl}</Typography.Text>}
                      >
                        <Input
                          addonBefore="/"
                          addonAfter="/"
                          value={slug}
                          onChange={(e) => setSlug(slugify(e.target.value))}
                          placeholder="page-slug"
                        />
                      </Form.Item>
                      <Form.Item label="Page Content">
                        <TipTapEditor content={content} onChange={setContent} />
                      </Form.Item>
                    </Form>
                  </Card>
                </Col>
                <Col xs={24} lg={8}>
                  <Card title="Page Template">
                    <Radio.Group
                      value={template}
                      onChange={(e) => setTemplate(e.target.value)}
                      style={{ width: "100%" }}
                    >
                      <Space direction="vertical" style={{ width: "100%" }}>
                        {TEMPLATES.map((t) => (
                          <Radio key={t.value} value={t.value} style={{ width: "100%" }}>
                            <div>
                              <div style={{ fontWeight: 500 }}>{t.label}</div>
                              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                                {t.desc}
                              </Typography.Text>
                            </div>
                          </Radio>
                        ))}
                      </Space>
                    </Radio.Group>
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
                          placeholder="Brief description for search engines"
                        />
                      </Form.Item>
                      <Form.Item label="Canonical URL (optional)">
                        <Input value={canonicalUrl} onChange={(e) => setCanonicalUrl(e.target.value)} placeholder={pageUrl} />
                      </Form.Item>
                      <Form.Item label="Social / OG Image">
                        <Space.Compact style={{ width: "100%" }}>
                          <Input value={ogImage} onChange={(e) => setOgImage(e.target.value)} placeholder="/uploads/..." />
                          <Button onClick={() => setOgPickerOpen(true)}>Browse</Button>
                        </Space.Compact>
                        {ogImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={getMediaUrl(ogImage)} alt="OG preview" style={{ marginTop: 8, height: 96, borderRadius: 6, objectFit: "cover" }} />
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
                    url={canonicalUrl || pageUrl}
                  />
                </Col>
              </Row>
            ),
          },
        ]}
      />

      <MediaPicker open={ogPickerOpen} onClose={() => setOgPickerOpen(false)} onSelect={(item) => setOgImage(item.url)} filter="image" />
    </div>
  );
}
