"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Spin } from "antd";
import { ProductEditor } from "@/components/product-editor";

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((r) => r.json())
      .then(setProduct);
  }, [id]);

  if (!product) {
    return (
      <div style={{ padding: 64, textAlign: "center" }}>
        <Spin size="large" tip="Loading product..." />
      </div>
    );
  }

  return <ProductEditor initial={product as Parameters<typeof ProductEditor>[0]["initial"]} productId={id} />;
}
