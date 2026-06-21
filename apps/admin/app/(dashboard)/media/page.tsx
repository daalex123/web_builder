"use client";

import { useEffect, useState } from "react";
import { App, Button, Card, Col, Form, Input, Radio, Row, Segmented, Space, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { AppstoreOutlined, CopyOutlined, DeleteOutlined, UnorderedListOutlined } from "@ant-design/icons";
import { formatFileSize } from "@/lib/upload";
import { getMediaUrl, getPublicMediaUrl } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { MediaUploader, type MediaItem } from "@/components/media-library";

export default function MediaPage() {
  const { message, modal } = App.useApp();
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "image" | "document">("all");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (filter !== "all") params.set("type", filter);
    fetch(`/api/media?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setMedia(data);
        setLoading(false);
      });
  }

  useEffect(() => {
    load();
  }, [search, filter]);

  async function updateAlt(id: string, alt: string) {
    await fetch(`/api/media/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alt }),
    });
    load();
    message.success("Alt text updated");
  }

  async function handleDelete(id: string) {
    modal.confirm({
      title: "Delete this file permanently?",
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        await fetch(`/api/media/${id}`, { method: "DELETE" });
        load();
        message.success("File deleted");
      },
    });
  }

  function copyUrl(url: string) {
    navigator.clipboard.writeText(getPublicMediaUrl(url));
    message.success("Public URL copied to clipboard");
  }

  const columns: ColumnsType<MediaItem> = [
    {
      title: "Preview",
      key: "preview",
      width: 80,
      render: (_, item) =>
        item.mimeType.startsWith("image/") ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={getMediaUrl(item.url)} alt="" style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 4 }} />
        ) : (
          <div style={{ width: 48, height: 48, background: "#fafafa", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 4, fontSize: 10 }}>
            FILE
          </div>
        ),
    },
    { title: "Filename", dataIndex: "filename", key: "filename" },
    {
      title: "Alt text",
      key: "alt",
      render: (_, item) => (
        <Input
          size="small"
          defaultValue={item.alt ?? ""}
          onBlur={(e) => updateAlt(item.id, e.target.value)}
          placeholder="Describe this image"
        />
      ),
    },
    {
      title: "Size",
      key: "size",
      render: (_, item) => (item.size ? formatFileSize(item.size) : "—"),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, item) => (
        <Space>
          <Button size="small" icon={<CopyOutlined />} onClick={() => copyUrl(item.url)}>
            Copy
          </Button>
          <Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(item.id)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Media Library" description="Upload, organize and manage files" />

      <Card style={{ marginBottom: 24 }}>
        <MediaUploader onUploaded={() => load()} />
      </Card>

      <Space wrap style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="Search files..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 240 }}
          allowClear
        />
        <Radio.Group value={filter} onChange={(e) => setFilter(e.target.value)}>
          <Radio.Button value="all">All files</Radio.Button>
          <Radio.Button value="image">Images</Radio.Button>
          <Radio.Button value="document">Documents</Radio.Button>
        </Radio.Group>
        <Segmented
          value={view}
          onChange={(v) => setView(v as "grid" | "list")}
          options={[
            { value: "grid", icon: <AppstoreOutlined /> },
            { value: "list", icon: <UnorderedListOutlined /> },
          ]}
        />
      </Space>

      {view === "grid" ? (
        <Row gutter={[16, 16]}>
          {media.map((item) => (
            <Col key={item.id} xs={24} sm={12} lg={6}>
              <Card
                cover={
                  item.mimeType.startsWith("image/") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={getMediaUrl(item.url)}
                      alt={item.alt ?? item.filename}
                      style={{ height: 180, objectFit: "cover" }}
                    />
                  ) : (
                    <div style={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center", background: "#fafafa" }}>
                      <Typography.Text type="secondary">
                        {item.mimeType.split("/")[1]?.toUpperCase() ?? "FILE"}
                      </Typography.Text>
                    </div>
                  )
                }
                size="small"
              >
                <Typography.Text ellipsis style={{ display: "block", fontWeight: 500 }}>
                  {item.filename}
                </Typography.Text>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  {item.size ? formatFileSize(item.size) : ""} · {item.mimeType}
                </Typography.Text>
                <Form.Item label="Alt text" style={{ marginTop: 8, marginBottom: 8 }}>
                  <Input
                    size="small"
                    defaultValue={item.alt ?? ""}
                    onBlur={(e) => updateAlt(item.id, e.target.value)}
                    placeholder="Describe this image"
                  />
                </Form.Item>
                <Space>
                  <Button size="small" icon={<CopyOutlined />} onClick={() => copyUrl(item.url)}>
                    Copy URL
                  </Button>
                  <Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(item.id)}>
                    Delete
                  </Button>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Table rowKey="id" columns={columns} dataSource={media} loading={loading} pagination={{ pageSize: 20 }} />
      )}
    </div>
  );
}
