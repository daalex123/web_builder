"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PAGE_LAYOUTS } from "@cms/shared/layouts";
import {
  Alert,
  App,
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  Select,
  Space,
  Typography,
  Upload,
} from "antd";
import type { UploadFile } from "antd";
import {
  CloudUploadOutlined,
  LinkOutlined,
  PictureOutlined,
  RobotOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { PageHeader } from "@/components/page-header";

type AiStatus =
  | { configured: false }
  | {
      configured: true;
      provider: "openai" | "nvidia";
      model: string;
      baseUrl: string;
    };

export default function AiPageBuilderPage() {
  const router = useRouter();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [status, setStatus] = useState<AiStatus | null>(null);
  const [generating, setGenerating] = useState(false);
  const [imageFile, setImageFile] = useState<UploadFile | null>(null);

  useEffect(() => {
    fetch("/api/ai/status")
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => setStatus({ configured: false }));
  }, []);

  async function onGenerate(values: {
    prompt: string;
    title?: string;
    slug?: string;
    layout?: string;
    referenceUrl?: string;
  }) {
    setGenerating(true);

    const formData = new FormData();
    formData.set("prompt", values.prompt);
    if (values.title) formData.set("title", values.title);
    if (values.slug) formData.set("slug", values.slug);
    if (values.layout) formData.set("layout", values.layout);
    if (values.referenceUrl) formData.set("referenceUrl", values.referenceUrl);

    const file = imageFile?.originFileObj;
    if (file) {
      formData.set("referenceImage", file);
    }

    try {
      const res = await fetch("/api/ai/generate-page", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        message.error(data.error ?? "Generation failed");
        return;
      }

      message.success("Page generated — opening editor");
      router.push(`/pages/${data.id}`);
    } catch {
      message.error("Generation failed");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="AI Page Builder"
        description="Describe the page you want, optionally add a reference website or design image, then refine in the visual editor."
        extra={
          <Link href="/pages">
            <Button>All Pages</Button>
          </Link>
        }
      />

      {status && !status.configured ? (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 24 }}
          message="AI API key required"
          description={
            <>
              Add <Typography.Text code>OPENAI_API_KEY</Typography.Text> to{" "}
              <Typography.Text code>apps/admin/.env.local</Typography.Text> and restart the admin
              server. Use an OpenAI <Typography.Text code>sk-...</Typography.Text> key or NVIDIA{" "}
              <Typography.Text code>nvapi-...</Typography.Text> key.
            </>
          }
        />
      ) : status?.configured ? (
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
          message={`Connected to ${status.provider === "nvidia" ? "NVIDIA NIM" : "OpenAI"}`}
          description={
            <>
              Model: <Typography.Text code>{status.model}</Typography.Text>
              {status.provider === "nvidia" ? (
                <>
                  {" "}
                  — reference images are not supported with Nemotron; use a reference URL instead.
                </>
              ) : null}
            </>
          }
        />
      ) : null}

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card>
            <Form
              form={form}
              layout="vertical"
              onFinish={onGenerate}
              disabled={!status?.configured || generating}
            >
              <Form.Item
                name="prompt"
                label="What kind of page do you want?"
                rules={[{ required: true, message: "Describe your page" }]}
                extra="Be specific: audience, sections, tone, industry, and calls to action."
              >
                <Input.TextArea
                  rows={6}
                  placeholder="Example: A landing page for a boutique interior design studio. Hero with bold headline, services grid, client testimonials, stats, and a contact CTA. Elegant, minimal tone."
                />
              </Form.Item>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item name="title" label="Page title (optional)">
                    <Input placeholder="e.g. Interior Design Services" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="slug" label="URL slug (optional)">
                    <Input placeholder="e.g. interior-design" addonBefore="/" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="layout" label="Layout preference (optional)">
                <Select
                  allowClear
                  placeholder="Let AI choose"
                  options={PAGE_LAYOUTS.map((l) => ({
                    value: l.id,
                    label: `${l.name} — ${l.description}`,
                  }))}
                />
              </Form.Item>

              <Form.Item
                name="referenceUrl"
                label="Reference website (optional)"
                extra="Public URL only. AI uses structure and tone as inspiration."
              >
                <Input
                  prefix={<LinkOutlined />}
                  placeholder="https://example.com/about"
                />
              </Form.Item>

              <Form.Item
                label="Reference design image (optional)"
                extra="Upload a screenshot or mockup. PNG, JPEG, WebP, or GIF up to 8 MB."
              >
                <Upload.Dragger
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  maxCount={1}
                  beforeUpload={() => false}
                  fileList={imageFile ? [imageFile] : []}
                  onChange={({ fileList }) => {
                    setImageFile(fileList[0] ?? null);
                  }}
                  onRemove={() => setImageFile(null)}
                >
                  <p className="ant-upload-drag-icon">
                    <PictureOutlined />
                  </p>
                  <p className="ant-upload-text">Click or drag a design reference</p>
                </Upload.Dragger>
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  icon={<ThunderboltOutlined />}
                  loading={generating}
                  disabled={!status?.configured}
                >
                  {generating ? "Generating page…" : "Generate page with AI"}
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="How it works">
            <Space direction="vertical" size="middle">
              <Typography.Paragraph style={{ margin: 0 }}>
                <RobotOutlined /> <strong>1. Describe</strong> — Tell the AI what page you need.
              </Typography.Paragraph>
              <Typography.Paragraph style={{ margin: 0 }}>
                <LinkOutlined /> <strong>2. Reference</strong> — Add a live URL and/or upload a
                design screenshot.
              </Typography.Paragraph>
              <Typography.Paragraph style={{ margin: 0 }}>
                <CloudUploadOutlined /> <strong>3. Generate</strong> — AI builds sections using
                your CMS widgets (hero, features, CTA, etc.).
              </Typography.Paragraph>
              <Typography.Paragraph style={{ margin: 0 }}>
                <ThunderboltOutlined /> <strong>4. Refine</strong> — Edit the draft in the visual
                page builder before publishing.
              </Typography.Paragraph>
            </Space>
          </Card>

          <Card title="Tips" style={{ marginTop: 16 }}>
            <ul style={{ paddingLeft: 20, margin: 0 }}>
              <li>Mention target audience and primary goal (leads, sales, info).</li>
              <li>List sections you want: hero, testimonials, FAQ, gallery, etc.</li>
              <li>Reference URLs work best for public marketing sites.</li>
              <li>Generated pages are saved as drafts.</li>
            </ul>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
