"use client";

import { useEffect, useState } from "react";
import { Alert, Button, Card, List, Space, Typography } from "antd";
import { CloudUploadOutlined, ExportOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/page-header";

type PublishLog = {
  id: string;
  status: string;
  message: string | null;
  createdAt: string;
};

export default function PublishPage() {
  const [logs, setLogs] = useState<PublishLog[]>([]);
  const [publishing, setPublishing] = useState(false);
  const [result, setResult] = useState<{ type: "success" | "error"; message: string } | null>(null);

  function loadLogs() {
    fetch("/api/publish")
      .then((r) => r.json())
      .then(setLogs);
  }

  useEffect(() => {
    loadLogs();
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
      setResult({
        type: "success",
        message: `Published ${data.pages} pages to static site.${
          build ? " Static HTML rebuilt." : ""
        }`,
      });
      loadLogs();
    } else {
      setResult({ type: "error", message: data.error });
    }
    setPublishing(false);
  }

  return (
    <div>
      <PageHeader
        title="Publish Site"
        description="Export published content for production, or use live preview during development"
      />

      <Card style={{ maxWidth: 720, marginBottom: 16 }}>
        <Typography.Title level={5}>Live preview (development)</Typography.Title>
        <Typography.Paragraph type="secondary" style={{ marginBottom: 8 }}>
          Run <Typography.Text code>npm run dev:web</Typography.Text> in a second terminal.
          When you save in admin, content syncs automatically to{" "}
          <Typography.Text code>apps/web/content/</Typography.Text> — refresh the browser to see
          changes. No build required.
        </Typography.Paragraph>
        <Button type="link" href={process.env.NEXT_PUBLIC_WEB_URL ?? "http://localhost:3000"} target="_blank" style={{ padding: 0 }}>
          Open preview site →
        </Button>
      </Card>

      <Card style={{ maxWidth: 720 }}>
        <Typography.Title level={5}>Production deploy</Typography.Title>
        <Typography.Paragraph>
          This exports all <Typography.Text strong>published</Typography.Text> pages from
          the database to <Typography.Text code>apps/web/content/</Typography.Text> and optionally
          rebuilds the static HTML site.
        </Typography.Paragraph>

        <Space style={{ marginTop: 16 }}>
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
        </Space>

        {result ? (
          <Alert
            type={result.type}
            message={result.message}
            showIcon
            style={{ marginTop: 16 }}
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
