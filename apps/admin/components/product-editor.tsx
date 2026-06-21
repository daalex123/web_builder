"use client";

import { useState } from "react";
import {
  Button,
  Card,
  Form,
  Input,
  Select,
  Space,
  Switch,
  Typography,
} from "antd";
import { PictureOutlined } from "@ant-design/icons";
import { PageHeader, StatusBadge } from "@/components/page-header";
import { MediaPicker, type MediaItem } from "@/components/media-library";
import { getMediaUrl } from "@/lib/utils";

const { TextArea } = Input;

type ProductData = {
  id?: string;
  slug: string;
  name: string;
  description?: string | null;
  shortDescription?: string | null;
  price?: string | null;
  priceFrom?: string | null;
  sale?: boolean;
  salePrice?: string | null;
  image: string;
  gallery?: string;
  category?: string | null;
  inStock?: boolean;
  seo?: string | null;
  status: string;
};

function parseGallery(gallery: string | undefined): string[] {
  if (!gallery) return [];
  try {
    return JSON.parse(gallery) as string[];
  } catch {
    return [];
  }
}

export function ProductEditor({
  initial,
  productId,
  onSaved,
}: {
  initial?: ProductData;
  productId?: string;
  onSaved?: (id: string) => void;
}) {
  const [product, setProduct] = useState<ProductData>(
    initial ?? {
      slug: "",
      name: "",
      image: "",
      status: "draft",
      inStock: true,
      sale: false,
    },
  );
  const [gallery, setGallery] = useState<string[]>(parseGallery(initial?.gallery));
  const [saving, setSaving] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<"image" | "gallery">("image");

  function openPicker(target: "image" | "gallery") {
    setPickerTarget(target);
    setPickerOpen(true);
  }

  function handleMediaSelect(item: MediaItem) {
    const url = getMediaUrl(item.url);
    if (pickerTarget === "image") {
      setProduct((p) => ({ ...p, image: url }));
    } else {
      setGallery((g) => [...g, url]);
    }
  }

  async function save() {
    setSaving(true);
    let seo: Record<string, string> | null = null;
    if (product.seo) {
      try {
        seo = JSON.parse(product.seo);
      } catch {
        seo = null;
      }
    }
    const payload = {
      ...product,
      gallery,
      seo,
    };
    const res = productId
      ? await fetch(`/api/products/${productId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      : await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
    if (res.ok) {
      const data = await res.json();
      onSaved?.(data.id);
    }
    setSaving(false);
  }

  return (
    <div>
      <PageHeader
        title={productId ? "Edit Product" : "New Product"}
        description="Catalog product for the shop"
        extra={
          <Space>
            <StatusBadge status={product.status} />
            <Button type="primary" onClick={save} loading={saving}>
              Save Product
            </Button>
          </Space>
        }
      />

      <Card style={{ maxWidth: 800 }}>
        <Form layout="vertical">
          <Form.Item label="Name" required>
            <Input
              value={product.name}
              onChange={(e) => setProduct({ ...product, name: e.target.value })}
            />
          </Form.Item>
          <Form.Item label="Slug" required extra="Used in /shop/your-slug/">
            <Input
              value={product.slug}
              onChange={(e) => setProduct({ ...product, slug: e.target.value })}
            />
          </Form.Item>
          <Form.Item label="Category">
            <Input
              value={product.category ?? ""}
              onChange={(e) => setProduct({ ...product, category: e.target.value || null })}
              placeholder="e.g. Living Room"
            />
          </Form.Item>
          <Form.Item label="Short Description">
            <Input
              value={product.shortDescription ?? ""}
              onChange={(e) =>
                setProduct({ ...product, shortDescription: e.target.value || null })
              }
            />
          </Form.Item>
          <Form.Item label="Description">
            <TextArea
              rows={4}
              value={product.description ?? ""}
              onChange={(e) =>
                setProduct({ ...product, description: e.target.value || null })
              }
            />
          </Form.Item>

          <Form.Item label="Main Image" required>
            <Space direction="vertical" style={{ width: "100%" }}>
              {product.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.image}
                  alt={product.name}
                  style={{ maxWidth: 200, borderRadius: 8 }}
                />
              ) : null}
              <Button icon={<PictureOutlined />} onClick={() => openPicker("image")}>
                Pick Image
              </Button>
            </Space>
          </Form.Item>

          <Form.Item label="Gallery">
            <Space direction="vertical" style={{ width: "100%" }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {gallery.map((url) => (
                  <div key={url} style={{ position: "relative" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt=""
                      style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8 }}
                    />
                    <Button
                      size="small"
                      danger
                      style={{ position: "absolute", top: 2, right: 2 }}
                      onClick={() => setGallery((g) => g.filter((u) => u !== url))}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
              <Button icon={<PictureOutlined />} onClick={() => openPicker("gallery")}>
                Add Gallery Image
              </Button>
            </Space>
          </Form.Item>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Form.Item label="Price">
              <Input
                value={product.price ?? ""}
                onChange={(e) => setProduct({ ...product, price: e.target.value || null })}
                placeholder="e.g. $299"
              />
            </Form.Item>
            <Form.Item label="Price From">
              <Input
                value={product.priceFrom ?? ""}
                onChange={(e) => setProduct({ ...product, priceFrom: e.target.value || null })}
                placeholder="e.g. $199"
              />
            </Form.Item>
          </div>

          <Form.Item label="On Sale">
            <Switch
              checked={product.sale ?? false}
              onChange={(sale) => setProduct({ ...product, sale })}
            />
          </Form.Item>
          {product.sale ? (
            <Form.Item label="Sale Price">
              <Input
                value={product.salePrice ?? ""}
                onChange={(e) => setProduct({ ...product, salePrice: e.target.value || null })}
              />
            </Form.Item>
          ) : null}

          <Form.Item label="In Stock">
            <Switch
              checked={product.inStock ?? true}
              onChange={(inStock) => setProduct({ ...product, inStock })}
            />
          </Form.Item>

          <Form.Item label="Status">
            <Select
              value={product.status}
              onChange={(status) => setProduct({ ...product, status })}
              options={[
                { value: "draft", label: "Draft" },
                { value: "published", label: "Published" },
              ]}
            />
          </Form.Item>

          <Typography.Title level={5}>SEO</Typography.Title>
          <Form.Item label="Meta Title">
            <Input
              value={(() => {
                try {
                  return product.seo ? JSON.parse(product.seo).metaTitle ?? "" : "";
                } catch {
                  return "";
                }
              })()}
              onChange={(e) => {
                const seo = product.seo ? JSON.parse(product.seo) : {};
                setProduct({ ...product, seo: JSON.stringify({ ...seo, metaTitle: e.target.value }) });
              }}
            />
          </Form.Item>
          <Form.Item label="Meta Description">
            <TextArea
              rows={2}
              value={(() => {
                try {
                  return product.seo ? JSON.parse(product.seo).metaDescription ?? "" : "";
                } catch {
                  return "";
                }
              })()}
              onChange={(e) => {
                const seo = product.seo ? JSON.parse(product.seo) : {};
                setProduct({
                  ...product,
                  seo: JSON.stringify({ ...seo, metaDescription: e.target.value }),
                });
              }}
            />
          </Form.Item>
        </Form>
      </Card>

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleMediaSelect}
        filter="image"
      />
    </div>
  );
}
