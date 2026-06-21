"use client";

import { PAGE_LAYOUTS, type PageLayout } from "@cms/shared/layouts";
import { Card, Col, Row, Typography } from "antd";
import { CheckOutlined } from "@ant-design/icons";

export function LayoutSwitcher({
  value,
  onChange,
}: {
  value: PageLayout;
  onChange: (layout: PageLayout) => void;
}) {
  return (
    <Row gutter={[12, 12]}>
      {PAGE_LAYOUTS.map((layout) => {
        const selected = value === layout.id;
        return (
          <Col key={layout.id} xs={24} sm={12} lg={8}>
            <Card
              hoverable
              size="small"
              onClick={() => onChange(layout.id)}
              style={{
                borderColor: selected ? "#1677ff" : undefined,
                background: selected ? "#e6f4ff" : undefined,
              }}
            >
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div
                  className={layout.preview}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 8,
                    flexShrink: 0,
                    border: "1px solid #e5e7eb",
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Typography.Text strong>{layout.name}</Typography.Text>
                    {selected ? <CheckOutlined style={{ color: "#1677ff" }} /> : null}
                  </div>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {layout.description}
                  </Typography.Text>
                </div>
              </div>
            </Card>
          </Col>
        );
      })}
    </Row>
  );
}
