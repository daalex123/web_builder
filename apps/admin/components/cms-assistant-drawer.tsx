"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { Button, Drawer, FloatButton } from "antd";
import Link from "next/link";
import { CmsAssistantChat } from "./cms-assistant-chat";

export function CmsAssistantDrawer() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (pathname === "/cms-assistant" || pathname.startsWith("/login")) {
    return null;
  }

  return (
    <>
      <FloatButton
        type="primary"
        icon={<QuestionCircleOutlined />}
        tooltip="CMS Guide — ask for help"
        onClick={() => setOpen(true)}
        style={{ insetInlineEnd: 24, insetBlockEnd: 24 }}
      />
      <Drawer
        title="CMS Guide"
        placement="right"
        width={420}
        open={open}
        onClose={() => setOpen(false)}
        extra={
          <Link href="/admin/cms-assistant">
            <Button type="link" size="small" onClick={() => setOpen(false)}>
              Open full page
            </Button>
          </Link>
        }
        styles={{ body: { paddingTop: 8, display: "flex", flexDirection: "column", height: "100%" } }}
      >
        <CmsAssistantChat compact showSuggestedTopics={false} />
      </Drawer>
    </>
  );
}
