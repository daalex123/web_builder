"use client";

import { useEffect, useState } from "react";
import { Select } from "antd";

type ProductOption = {
  id: string;
  slug: string;
  name: string;
  category: string | null;
};

export function ProductPicker({
  value,
  onChange,
  placeholder = "Select products",
}: {
  value: string[];
  onChange: (slugs: string[]) => void;
  placeholder?: string;
}) {
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products?status=published")
      .then((r) => r.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      });
  }, []);

  return (
    <Select
      mode="multiple"
      style={{ width: "100%" }}
      placeholder={placeholder}
      loading={loading}
      value={value}
      onChange={onChange}
      optionFilterProp="label"
      options={products.map((p) => ({
        value: p.slug,
        label: p.category ? `${p.name} (${p.category})` : p.name,
      }))}
    />
  );
}
