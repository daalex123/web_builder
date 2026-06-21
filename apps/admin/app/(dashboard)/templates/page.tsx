"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { SamplePageTemplate } from "@cms/shared/sample-templates";
import { PAGE_LAYOUTS } from "@cms/shared/layouts";
import {
  App,
  Button,
  Card,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Space,
  Table,
  Tabs,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/page-header";

type SavedTemplate = {
  id: string;
  name: string;
  description: string | null;
  layout: string;
  updatedAt: string;
};

export default function TemplatesPage() {
  const router = useRouter();
  const { message, modal } = App.useApp();
  const [samples, setSamples] = useState<SamplePageTemplate[]>([]);
  const [saved, setSaved] = useState<SavedTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm] = Form.useForm();

  function load() {
    setLoading(true);
    Promise.all([
      fetch("/api/samples").then((r) => r.json()),
      fetch("/api/page-templates").then((r) => r.json()),
    ]).then(([sampleData, savedData]) => {
      setSamples(sampleData);
      setSaved(savedData);
      setLoading(false);
    });
  }

  useEffect(() => {
    load();
  }, []);

  async function useTemplate(source: "sample" | "saved", sourceId: string) {
    const res = await fetch("/api/pages/from-template", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source, sourceId }),
    });
    if (res.ok) {
      const page = await res.json();
      message.success("Page created from template");
      router.push(`/pages/${page.id}`);
    } else {
      message.error("Failed to create page");
    }
  }

  async function deleteTemplate(id: string) {
    modal.confirm({
      title: "Delete this template?",
      okType: "danger",
      onOk: async () => {
        await fetch(`/api/page-templates/${id}`, { method: "DELETE" });
        load();
        message.success("Template deleted");
      },
    });
  }

  async function createTemplate(values: { name: string; description?: string; layout: string }) {
    const res = await fetch("/api/page-templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: values.name,
        description: values.description,
        layout: values.layout,
        content: { type: "doc", content: [] },
        sections: [],
      }),
    });
    if (res.ok) {
      setCreateOpen(false);
      createForm.resetFields();
      load();
      message.success("Template created");
    }
  }

  const savedColumns: ColumnsType<SavedTemplate> = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Layout", dataIndex: "layout", key: "layout", render: (l) => <Tag>{l}</Tag> },
    {
      title: "Updated",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (d) => new Date(d).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button size="small" type="primary" onClick={() => useTemplate("saved", record.id)}>
            Use
          </Button>
          <Button size="small" danger icon={<DeleteOutlined />} onClick={() => deleteTemplate(record.id)} />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Page Templates"
        description="Start from sample designs or your saved templates"
        extra={
          <Space>
            <Link href="/pages/new">
              <Button>Blank Page</Button>
            </Link>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
              New Template
            </Button>
          </Space>
        }
      />

      <Tabs
        items={[
          {
            key: "samples",
            label: `Sample Templates (${samples.length})`,
            children: (
              <Row gutter={[16, 16]}>
                {samples.map((sample) => {
                  const layoutMeta = PAGE_LAYOUTS.find((l) => l.id === sample.layout);
                  return (
                    <Col key={sample.id} xs={24} sm={12} lg={8}>
                      <Card
                        hoverable
                        title={sample.name}
                        extra={<Tag color="blue">{sample.category}</Tag>}
                        actions={[
                          <Button key="use" type="link" onClick={() => useTemplate("sample", sample.id)}>
                            Use template
                          </Button>,
                        ]}
                      >
                        <div className={layoutMeta?.preview} style={{ height: 80, borderRadius: 8, marginBottom: 12, border: "1px solid #f0f0f0" }} />
                        <Typography.Text type="secondary">{sample.description}</Typography.Text>
                        <div style={{ marginTop: 8 }}>
                          <Tag>{layoutMeta?.name ?? sample.layout}</Tag>
                        </div>
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            ),
          },
          {
            key: "saved",
            label: `My Templates (${saved.length})`,
            children: (
              <Table rowKey="id" columns={savedColumns} dataSource={saved} loading={loading} pagination={{ pageSize: 10 }} />
            ),
          },
        ]}
      />

      <Modal
        title="Create blank template"
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        onOk={() => createForm.submit()}
        okText="Create"
      >
        <Form form={createForm} layout="vertical" onFinish={createTemplate}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="layout" label="Default layout" initialValue="standard">
            <Input placeholder="standard, landing, contact..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
