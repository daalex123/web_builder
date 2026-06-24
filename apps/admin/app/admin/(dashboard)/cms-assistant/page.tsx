"use client";

import { Card, Col, Row, Typography } from "antd";
import { PageHeader } from "@/components/page-header";
import { CmsAssistantChat } from "@/components/cms-assistant-chat";

export default function CmsAssistantPage() {
  return (
    <div>
      <PageHeader
        title="CMS Guide"
        description="Ask questions about pages, the visual builder, publishing, media, navigation, ecommerce, and AI tools. Answers are tailored to your current site content."
      />

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card styles={{ body: { padding: "16px 24px" } }}>
            <CmsAssistantChat />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="What I can help with">
            <ul style={{ paddingLeft: 20, margin: 0 }}>
              <li>Step-by-step workflows for common tasks</li>
              <li>Visual builder widgets and page layouts</li>
              <li>Homepage vs pages, drafts vs published</li>
              <li>SEO panel, media library, and menus</li>
              <li>AI Page Builder and Sales Assistant setup</li>
              <li>Live preview and production publish</li>
            </ul>
          </Card>
          <Card title="Tip" style={{ marginTop: 16 }}>
            <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
              Use the floating help button on any admin screen for quick questions without leaving
              your current task. The guide knows which admin page you are on and can give
              contextual advice.
            </Typography.Paragraph>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
