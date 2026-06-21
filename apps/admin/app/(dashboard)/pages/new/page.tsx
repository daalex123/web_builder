"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
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

export default function NewPagePage() {
  const router = useRouter();

  return (
    <PageEditor
      onSaved={(id) => router.push(`/pages/${id}`)}
    />
  );
}
