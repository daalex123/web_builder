"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Spin } from "antd";

const PageEditor = dynamic(
  () => import("@/components/page-editor").then((m) => m.PageEditor),
  {
    ssr: false,
    loading: () => (
      <div style={{ padding: 64, textAlign: "center" }}>
        <Spin size="large" tip="Loading page editor..." />
      </div>
    ),
  },
);

export default function EditPagePage() {
  const { id } = useParams<{ id: string }>();
  const [page, setPage] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    fetch(`/api/pages/${id}`)
      .then((r) => r.json())
      .then(setPage);
  }, [id]);

  if (!page) {
    return (
      <div style={{ padding: 64, textAlign: "center" }}>
        <Spin size="large" tip="Loading page..." />
      </div>
    );
  }

  return <PageEditor initial={page} pageId={id} />;
}
