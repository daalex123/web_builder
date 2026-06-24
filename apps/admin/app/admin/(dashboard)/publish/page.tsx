"use client";

import { useEffect, useState } from "react";
import { Alert, Button, Card, List, Space, Typography } from "antd";
import {
  CloudDownloadOutlined,
  CloudUploadOutlined,
  ExportOutlined,
} from "@ant-design/icons";
import { getWebPreviewUrl } from "@/lib/paths";
import { PageHeader } from "@/components/page-header";

type PublishLog = {
  id: string;
  status: string;
  message: string | null;
  createdAt: string;
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function PublishPage() {
  const [logs, setLogs] = useState<PublishLog[]>([]);
  const [publishing, setPublishing] = useState(false);
  const [downloadSize, setDownloadSize] = useState<number | null>(null);
  const [result, setResult] = useState<{
    type: "success" | "error";
    message: string;
    downloadUrl?: string;
  } | null>(null);

  function loadLogs() {
    fetch("/api/publish")
      .then((r) => r.json())
      .then(setLogs);
  }

  async function checkDownload() {
    const res = await fetch("/api/publish/download", { method: "HEAD" });
    if (res.ok) {
      const size = res.headers.get("Content-Length");
      setDownloadSize(size ? Number(size) : null);
    } else {
      setDownloadSize(null);
    }
  }

  useEffect(() => {
    loadLogs();
    void checkDownload();
  }, []);

  async function publish(build: boolean) {
    setPublishing(true);
    setResult(null);

    const res = await fetch("/api/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ build }),
    });

    const data = await res.json();
    if (res.ok) {
      const sizeLabel =
        typeof data.zipSize === "number" ? ` (${formatBytes(data.zipSize)})` : "";
      const vercelNote = data.vercel
        ? " On Vercel, the live site is /web on this deployment. Downloadable static zip builds run locally only."
        : "";
      setResult({
        type: "success",
        message:
          data.message ??
          (build
            ? `Published ${data.pages} pages. Static HTML rebuilt and compressed${sizeLabel}.${vercelNote}`
            : `Exported ${data.pages} pages to JSON.${vercelNote}`),
        downloadUrl: data.downloadUrl,
      });
      if (typeof data.zipSize === "number") {
        setDownloadSize(data.zipSize);
      }
      loadLogs();
    } else {
      setResult({ type: "error", message: data.error });
    }
    setPublishing(false);
  }

  const downloadUrl = result?.downloadUrl ?? (downloadSize ? "/api/publish/download" : null);

  return (
    <div>
      <PageHeader
        title="Publish Site"
        description="Export published content for production, or use live preview during development"
      />

      <Card style={{ maxWidth: 720, marginBottom: 16 }}>
        <Typography.Title level={5}>Live preview (development)</Typography.Title>
        <Typography.Paragraph type="secondary" style={{ marginBottom: 8 }}>
          Live preview is served at <Typography.Text code>/web</Typography.Text> on the same
          deployment. Content is read from Supabase — refresh the browser after saving in admin.
        </Typography.Paragraph>
        <Button type="link" href={getWebPreviewUrl()} target="_blank" style={{ padding: 0 }}>
          Open preview site →
        </Button>
      </Card>

      <Card style={{ maxWidth: 720 }}>
        <Typography.Title level={5}>Production deploy</Typography.Title>
        <Typography.Paragraph>
          On Vercel, use <Typography.Text strong>Publish &amp; Build Site</Typography.Text> to mark
          content as published — your live site is already at{" "}
          <Typography.Text code>/web</Typography.Text>. For a downloadable static{" "}
          <Typography.Text code>site.zip</Typography.Text>, run the build locally with{" "}
          <Typography.Text code>npm run build</Typography.Text> in the monorepo.
        </Typography.Paragraph>

        <Space style={{ marginTop: 16 }} wrap>
          <Button icon={<ExportOutlined />} onClick={() => publish(false)} disabled={publishing}>
            Export JSON Only
          </Button>
          <Button
            type="primary"
            icon={<CloudUploadOutlined />}
            onClick={() => publish(true)}
            loading={publishing}
          >
            Publish & Build Site
          </Button>
          {downloadUrl ? (
            <Button
              icon={<CloudDownloadOutlined />}
              href={downloadUrl}
              download="site.zip"
            >
              Download site.zip
              {downloadSize ? ` (${formatBytes(downloadSize)})` : ""}
            </Button>
          ) : null}
        </Space>

        {result ? (
          <Alert
            type={result.type}
            message={result.message}
            showIcon
            style={{ marginTop: 16 }}
            action={
              result.downloadUrl ? (
                <Button
                  size="small"
                  type="primary"
                  href={result.downloadUrl}
                  download="site.zip"
                >
                  Download
                </Button>
              ) : undefined
            }
          />
        ) : null}
      </Card>

      <Card title="Publish History" style={{ maxWidth: 720, marginTop: 24 }}>
        {logs.length === 0 ? (
          <Typography.Text type="secondary">No publish history yet</Typography.Text>
        ) : (
          <List
            dataSource={logs}
            renderItem={(log) => (
              <List.Item>
                <Typography.Text type={log.status === "success" ? "success" : "danger"}>
                  {log.status}
                </Typography.Text>
                {" — "}
                {log.message} — {new Date(log.createdAt).toLocaleString()}
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
}
