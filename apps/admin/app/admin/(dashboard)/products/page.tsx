"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { App, Button, Popconfirm, Space, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { PageHeader, StatusBadge } from "@/components/page-header";

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  price: string | null;
  status: string;
  updatedAt: string;
};

export default function ProductsListPage() {
  const { message } = App.useApp();
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      });
  }

  useEffect(() => {
    load();
  }, []);

  async function deleteProduct(id: string) {
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (res.ok) {
      message.success("Product deleted");
      load();
    } else {
      message.error("Failed to delete product");
    }
  }

  const columns: ColumnsType<ProductRow> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (name, record) => <Link href={`/admin/products/${record.id}`}>{name}</Link>,
    },
    {
      title: "Slug",
      dataIndex: "slug",
      key: "slug",
      render: (slug) => `/shop/${slug}/`,
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (category) => (category ? <Tag>{category}</Tag> : "—"),
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (price) => price ?? "—",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => <StatusBadge status={status} />,
    },
    {
      title: "Updated",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Link href={`/admin/products/${record.id}`}>
            <Button size="small">Edit</Button>
          </Link>
          <Popconfirm title="Delete this product?" onConfirm={() => deleteProduct(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Products"
        description="Manage your product catalog for the shop"
        extra={
          <Link href="/admin/products/new">
            <Button type="primary" icon={<PlusOutlined />}>
              Add Product
            </Button>
          </Link>
        }
      />
      <Table
        rowKey="id"
        columns={columns}
        dataSource={products}
        loading={loading}
        pagination={{ pageSize: 20 }}
      />
    </div>
  );
}
