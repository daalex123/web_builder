"use client";

import { useRouter } from "next/navigation";
import { ProductEditor } from "@/components/product-editor";

export default function NewProductPage() {
  const router = useRouter();

  return <ProductEditor onSaved={(id) => router.push(`/admin/products/${id}`)} />;
}
