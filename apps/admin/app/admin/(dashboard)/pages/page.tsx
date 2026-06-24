"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { App, Button, Popconfirm, Space, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { PageHeader, StatusBadge } from "@/components/page-header";

type PageRow = {
  id: string;
  title: string;
  slug: string;
  layout: string;
  template: string;
  status: string;
  updatedAt: string;
};

export default function PagesListPage() {
  const { message } = App.useApp();
  const [pages, setPages] = useState<PageRow[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    fetch("/api/pages")
      .then((r) => r.json())
      .then((data) => {
        setPages(data);
        setLoading(false);
      });
  }

  useEffect(() => {
    load();
  }, []);

  async function deletePage(id: string) {
    const res = await fetch(`/api/pages/${id}`, { method: "DELETE" });
    if (res.ok) {
      message.success("Page deleted");
      load();
    } else {
      message.error("Failed to delete page");
    }
  }

  async function setAsHome(id: string) {
    const res = await fetch(`/api/pages/${id}/set-as-home`, { method: "POST" });
    if (res.ok) {
      message.success("Page set as homepage. Publish to update the live site.");
      load();
    } else {
      message.error("Failed to set as homepage");
    }
  }

  const columns: ColumnsType<PageRow> = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (title, record) => (
        <Space>
          <Link href={`/admin/pages/${record.id}`}>{title}</Link>
          {record.template === "home" ? <Tag color="gold">Home</Tag> : null}
        </Space>
      ),
    },
    {
      title: "Slug",
      dataIndex: "slug",
      key: "slug",
      render: (slug) => `/${slug}/`,
    },
    {
      title: "Layout",
      dataIndex: "layout",
      key: "layout",
      render: (layout) => <Tag>{layout ?? "standard"}</Tag>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => <StatusBadge status={status} />,
    },
    {
      title: "Updated",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Link href={`/admin/pages/${record.id}`}>
            <Button size="small">Edit</Button>
          </Link>
          {record.template !== "home" ? (
            <Button size="small" onClick={() => setAsHome(record.id)}>
              Set as Home
            </Button>
          ) : null}
          <Popconfirm title="Delete this page?" onConfirm={() => deletePage(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Pages"
        description="Manage static pages with layouts and sections"
        extra={
          <Space>
            <Link href="/admin/templates">
              <Button>Templates</Button>
            </Link>
            <Link href="/admin/pages/new">
              <Button type="primary" icon={<PlusOutlined />}>
                Add Page
              </Button>
            </Link>
          </Space>
        }
      />
      <Table
        rowKey="id"
        columns={columns}
        dataSource={pages}
        loading={loading}
        pagination={{ pageSize: 20 }}
      />
    </div>
  );
}
