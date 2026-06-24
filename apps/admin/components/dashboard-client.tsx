"use client";

import Link from "next/link";
import { Button, Card, Col, List, Row, Statistic, Typography } from "antd";
import { PageHeader } from "@/components/page-header";

type DashboardData = {
  pagesCount: number;
  publishedPages: number;
  draftPages: number;
  lastPublish: {
    status: string;
    message: string | null;
    createdAt: string;
  } | null;
  draftPagesList: { id: string; title: string }[];
};

export function DashboardClient({ data }: { data: DashboardData }) {
  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of your site content"
        extra={
          <Link href="/admin/publish">
            <Button type="primary">Publish Site</Button>
          </Link>
        }
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic title="Total Pages" value={data.pagesCount} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic title="Published Pages" value={data.publishedPages} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic title="Draft Pages" value={data.draftPages} />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginTop: 24 }} title="Last publish">
        {data.lastPublish ? (
          <Typography.Text>
            {data.lastPublish.status} — {data.lastPublish.message} —{" "}
            {new Date(data.lastPublish.createdAt).toLocaleString()}
          </Typography.Text>
        ) : (
          <Typography.Text type="secondary">No publishes yet</Typography.Text>
        )}
      </Card>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="Quick actions">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <Link href="/admin/pages/new"><Button>New Page</Button></Link>
              <Link href="/admin/media"><Button>Upload Media</Button></Link>
              <Link href="/admin/settings"><Button>Site Settings</Button></Link>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Draft pages">
            {data.draftPagesList.length === 0 ? (
              <Typography.Text type="secondary">No drafts</Typography.Text>
            ) : (
              <List
                size="small"
                dataSource={data.draftPagesList}
                renderItem={(page) => (
                  <List.Item>
                    <Link href={`/admin/pages/${page.id}`}>{page.title}</Link>
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
