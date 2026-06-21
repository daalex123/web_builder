"use client";

import { useEffect, useState } from "react";
import type { MenuItem } from "@cms/shared/schemas";
import { Alert, Button, Card, Col, Form, Input, Row, Space, Typography } from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/page-header";

export default function MenusPage() {
  const [header, setHeader] = useState<MenuItem[]>([]);
  const [footer, setFooter] = useState<MenuItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/menus")
      .then((r) => r.json())
      .then((data) => {
        setHeader(data.header ?? []);
        setFooter(data.footer ?? []);
      });
  }, []);

  async function save() {
    setSaving(true);
    const res = await fetch("/api/menus", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ header, footer }),
    });
    setMessage(res.ok ? { type: "success", text: "Menus saved" } : { type: "error", text: "Failed to save" });
    setSaving(false);
  }

  return (
    <div>
      <PageHeader
        title="Menus"
        description="Edit header and footer menu links. For header appearance, see Navigation."
        extra={
          <Button type="primary" onClick={save} loading={saving}>
            Save Menus
          </Button>
        }
      />

      {message ? (
        <Alert type={message.type} message={message.text} showIcon style={{ marginBottom: 16 }} />
      ) : null}

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <MenuEditor title="Header Menu" items={header} onChange={setHeader} />
        </Col>
        <Col xs={24} lg={12}>
          <MenuEditor title="Footer Menu" items={footer} onChange={setFooter} />
        </Col>
      </Row>
    </div>
  );
}

function MenuEditor({
  title,
  items,
  onChange,
}: {
  title: string;
  items: MenuItem[];
  onChange: (items: MenuItem[]) => void;
}) {
  function updateItem(index: number, field: keyof MenuItem, value: string) {
    const next = [...items];
    next[index] = { ...next[index], [field]: value };
    onChange(next);
  }

  function addItem() {
    onChange([...items, { label: "New Item", href: "/" }]);
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  function addChild(index: number) {
    const next = [...items];
    const children = next[index].children ?? [];
    next[index] = {
      ...next[index],
      children: [...children, { label: "Sub Item", href: "/" }],
    };
    onChange(next);
  }

  function updateChild(parentIndex: number, childIndex: number, field: keyof MenuItem, value: string) {
    const next = [...items];
    const children = [...(next[parentIndex].children ?? [])];
    children[childIndex] = { ...children[childIndex], [field]: value };
    next[parentIndex] = { ...next[parentIndex], children };
    onChange(next);
  }

  return (
    <Card
      title={title}
      extra={
        <Button icon={<PlusOutlined />} onClick={addItem}>
          Add Item
        </Button>
      }
    >
      <Space direction="vertical" style={{ width: "100%" }} size="middle">
        {items.map((item, index) => (
          <Card key={index} size="small" type="inner">
            <Row gutter={[12, 12]}>
              <Col span={12}>
                <Form.Item label="Label" style={{ marginBottom: 0 }}>
                  <Input value={item.label} onChange={(e) => updateItem(index, "label", e.target.value)} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="URL" style={{ marginBottom: 0 }}>
                  <Input value={item.href ?? ""} onChange={(e) => updateItem(index, "href", e.target.value)} />
                </Form.Item>
              </Col>
            </Row>
            <Space style={{ marginTop: 12 }}>
              <Button size="small" onClick={() => addChild(index)}>
                Add Submenu
              </Button>
              <Button size="small" danger icon={<DeleteOutlined />} onClick={() => removeItem(index)}>
                Remove
              </Button>
            </Space>
            {item.children?.map((child, childIndex) => (
              <Row key={childIndex} gutter={[12, 12]} style={{ marginTop: 12, paddingLeft: 12, borderLeft: "2px solid #f0f0f0" }}>
                <Col span={12}>
                  <Input
                    value={child.label}
                    onChange={(e) => updateChild(index, childIndex, "label", e.target.value)}
                    placeholder="Sub label"
                  />
                </Col>
                <Col span={12}>
                  <Input
                    value={child.href ?? ""}
                    onChange={(e) => updateChild(index, childIndex, "href", e.target.value)}
                    placeholder="Sub URL"
                  />
                </Col>
              </Row>
            ))}
          </Card>
        ))}
        {items.length === 0 ? (
          <Typography.Text type="secondary">No menu items yet</Typography.Text>
        ) : null}
      </Space>
    </Card>
  );
}
