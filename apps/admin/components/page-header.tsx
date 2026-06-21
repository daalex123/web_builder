import type { ReactNode } from "react";
import { Space, Tag, Typography } from "antd";

export function PageHeader({
  title,
  description,
  extra,
  actions,
}: {
  title: string;
  description?: string;
  extra?: ReactNode;
  actions?: ReactNode;
}) {
  const headerExtra = extra ?? actions;
  return (
    <div
      style={{
        marginBottom: 24,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 16,
        flexWrap: "wrap",
      }}
    >
      <div>
        <Typography.Title level={3} style={{ margin: 0 }}>
          {title}
        </Typography.Title>
        {description ? (
          <Typography.Text type="secondary">{description}</Typography.Text>
        ) : null}
      </div>
      {headerExtra ? <Space wrap>{headerExtra}</Space> : null}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const color = status === "published" ? "success" : "warning";
  return <Tag color={color}>{status}</Tag>;
}
