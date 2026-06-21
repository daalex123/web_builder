"use client";

import { useEffect, useMemo, useState } from "react";
import type { ContentDoc, PageLayout, PageSection } from "@cms/shared/schemas";
import type { NestedSection } from "@cms/shared/nested-sections";
import { defaultSection } from "@cms/shared/layouts";
import { isEcommerceEnabled } from "@cms/shared/ecommerce";
import { LayoutSwitcher } from "@/components/layout-switcher";
import { BuilderCanvas, type MediaPickTarget } from "@/components/builder-canvas";
import { WidgetStylePanel } from "@/components/widget-style-panel";
import { MediaPicker } from "@/components/media-library";
import {
  findSectionById,
  flattenSectionLayers,
  removeSectionById,
  updateSectionInTree,
} from "@/components/builder-section-utils";
import { Button, Card, Collapse, Segmented, Space, Tooltip, Typography } from "antd";
import {
  AppstoreOutlined,
  ColumnHeightOutlined,
  ColumnWidthOutlined,
  FileImageOutlined,
  FontSizeOutlined,
  LayoutOutlined,
  LineOutlined,
  PictureOutlined,
  PlayCircleOutlined,
  QuestionCircleOutlined,
  RocketOutlined,
  SlidersOutlined,
  StarOutlined,
  ShoppingOutlined,
  TagsOutlined,
  TrophyOutlined,
} from "@ant-design/icons";

const WIDGET_GROUPS: {
  label: string;
  widgets: { type: PageSection["type"]; label: string; icon: React.ReactNode }[];
}[] = [
  {
    label: "E-commerce",
    widgets: [
      { type: "featured-products", label: "Featured Products", icon: <StarOutlined /> },
      { type: "category-products", label: "Category Products", icon: <TagsOutlined /> },
      { type: "product-slider", label: "Product Slider", icon: <ShoppingOutlined /> },
    ],
  },
  {
    label: "Layout",
    widgets: [
      { type: "columns", label: "Columns", icon: <ColumnWidthOutlined /> },
      { type: "spacer", label: "Spacer", icon: <ColumnHeightOutlined /> },
      { type: "divider", label: "Divider", icon: <LineOutlined /> },
    ],
  },
  {
    label: "Content",
    widgets: [
      { type: "hero", label: "Hero", icon: <RocketOutlined /> },
      { type: "text", label: "Heading & Text", icon: <FontSizeOutlined /> },
      { type: "image", label: "Image", icon: <PictureOutlined /> },
      { type: "video", label: "Video", icon: <PlayCircleOutlined /> },
      { type: "cta", label: "Button / CTA", icon: <AppstoreOutlined /> },
    ],
  },
  {
    label: "Media & showcase",
    widgets: [
      { type: "slider", label: "Image Slider", icon: <SlidersOutlined /> },
      { type: "gallery", label: "Gallery", icon: <FileImageOutlined /> },
      { type: "features", label: "Features", icon: <StarOutlined /> },
      { type: "stats", label: "Stats", icon: <TrophyOutlined /> },
      { type: "testimonials", label: "Testimonials", icon: <StarOutlined /> },
      { type: "faq", label: "FAQ", icon: <QuestionCircleOutlined /> },
    ],
  },
];

export function VisualPageBuilder({
  title,
  content: _content,
  layout,
  sections,
  onLayoutChange,
  onSectionsChange,
}: {
  title: string;
  content: ContentDoc;
  layout: PageLayout;
  sections: PageSection[];
  onLayoutChange: (layout: PageLayout) => void;
  onSectionsChange: (sections: PageSection[]) => void;
}) {
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [mediaTarget, setMediaTarget] = useState<MediaPickTarget | null>(null);
  const [ecommerceEnabled, setEcommerceEnabled] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((settings) => {
        if (settings && !settings.error) {
          setEcommerceEnabled(isEcommerceEnabled(settings));
        }
      })
      .catch(() => {});
  }, []);

  const selected = useMemo(
    () => (selectedSectionId ? findSectionById(sections, selectedSectionId) : null),
    [sections, selectedSectionId],
  );

  const layers = useMemo(() => flattenSectionLayers(sections), [sections]);

  const previewWidth =
    device === "desktop" ? "100%" : device === "tablet" ? 768 : 390;

  function addWidget(type: PageSection["type"]) {
    const next = [...sections, defaultSection(type)];
    onSectionsChange(next);
    setSelectedSectionId(next[next.length - 1]?.id ?? null);
  }

  function updateSelected(section: PageSection | NestedSection) {
    onSectionsChange(updateSectionInTree(sections, section.id, () => section));
  }

  function deleteSelected() {
    if (!selectedSectionId) return;
    onSectionsChange(removeSectionById(sections, selectedSectionId));
    setSelectedSectionId(null);
  }

  function applyMedia(url: string) {
    if (!mediaTarget) return;

    onSectionsChange(
      updateSectionInTree(sections, mediaTarget.sectionId, (section) => {
        if (mediaTarget.kind === "hero-image" && section.type === "hero") {
          return { ...section, image: url };
        }
        if (mediaTarget.kind === "image-src" && section.type === "image") {
          return { ...section, src: url };
        }
        if (mediaTarget.kind === "gallery" && section.type === "gallery") {
          const images = [...section.images];
          images[mediaTarget.index] = { ...images[mediaTarget.index], src: url };
          return { ...section, images };
        }
        if (mediaTarget.kind === "slider" && section.type === "slider") {
          const slides = [...section.slides];
          slides[mediaTarget.index] = { ...slides[mediaTarget.index], image: url };
          return { ...section, slides };
        }
        if (mediaTarget.kind === "testimonial-avatar" && section.type === "testimonials") {
          const items = [...section.items];
          items[mediaTarget.index] = { ...items[mediaTarget.index], avatar: url };
          return { ...section, items };
        }
        if (mediaTarget.kind === "video-poster" && section.type === "video") {
          return { ...section, poster: url };
        }
        return section;
      }),
    );
    setMediaTarget(null);
  }

  return (
    <div className="elementor-builder">
      <Card size="small" className="elementor-toolbar" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", justifyContent: "space-between" }}>
          <Space>
            <LayoutOutlined />
            <Typography.Text strong>Page Builder</Typography.Text>
            <Typography.Text type="secondary">
              Widgets panel on the left — E-commerce group has product blocks (requires E-commerce enabled)
            </Typography.Text>
          </Space>
          <Segmented
            size="small"
            value={device}
            onChange={(value) => setDevice(value as "desktop" | "tablet" | "mobile")}
            options={[
              { label: "Desktop", value: "desktop" },
              { label: "Tablet", value: "tablet" },
              { label: "Mobile", value: "mobile" },
            ]}
          />
        </div>
        <div style={{ marginTop: 12 }}>
          <LayoutSwitcher value={layout} onChange={onLayoutChange} />
        </div>
      </Card>

      <div className="elementor-workspace">
        <aside className="elementor-sidebar elementor-widgets">
          <Card size="small" title="Widgets" bordered={false}>
            {!ecommerceEnabled ? (
              <Typography.Text type="secondary" style={{ display: "block", fontSize: 12, marginBottom: 8 }}>
                Enable E-commerce in Site Settings to use product widgets.
              </Typography.Text>
            ) : null}
            <Collapse
              ghost
              size="small"
              defaultActiveKey={["E-commerce", "Layout", "Content", "Media & showcase"]}
              items={WIDGET_GROUPS.map((group) => ({
                key: group.label,
                label: group.label,
                children: (
                  <Space direction="vertical" style={{ width: "100%" }} size="small">
                    {group.widgets.map((widget) => {
                      const isProductWidget =
                        widget.type === "featured-products" ||
                        widget.type === "category-products" ||
                        widget.type === "product-slider";
                      const disabled = isProductWidget && !ecommerceEnabled;
                      const button = (
                        <Button
                          key={widget.type}
                          block
                          icon={widget.icon}
                          disabled={disabled}
                          onClick={() => addWidget(widget.type)}
                          style={{ textAlign: "left", justifyContent: "flex-start" }}
                        >
                          {widget.label}
                        </Button>
                      );
                      return disabled ? (
                        <Tooltip key={widget.type} title="Enable E-commerce in Site Settings">
                          <span style={{ display: "block" }}>{button}</span>
                        </Tooltip>
                      ) : (
                        button
                      );
                    })}
                  </Space>
                ),
              }))}
            />
          </Card>

          <Card size="small" title="Layers" bordered={false} style={{ marginTop: 12 }}>
            <Space direction="vertical" style={{ width: "100%" }} size={4}>
              {layers.length === 0 ? (
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  No widgets yet
                </Typography.Text>
              ) : (
                layers.map((layer) => (
                  <Button
                    key={layer.id}
                    block
                    size="small"
                    type={selectedSectionId === layer.id ? "primary" : "text"}
                    onClick={() => setSelectedSectionId(layer.id)}
                    style={{
                      textAlign: "left",
                      justifyContent: "flex-start",
                      paddingLeft: layer.depth ? 20 : 8,
                    }}
                  >
                    {layer.label}
                  </Button>
                ))
              )}
            </Space>
          </Card>
        </aside>

        <main className="elementor-canvas-wrap">
          <Card
            size="small"
            title={title || "Untitled page"}
            bordered={false}
            className="elementor-canvas-card"
            onClick={() => setSelectedSectionId(null)}
          >
            <div
              className="elementor-canvas-device"
              style={{ width: previewWidth, maxWidth: "100%", marginInline: "auto" }}
            >
              <BuilderCanvas
                layout={layout}
                sections={sections}
                selectedSectionId={selectedSectionId}
                onSelectSection={setSelectedSectionId}
                onChange={onSectionsChange}
                onDeleteSection={(id) => {
                  onSectionsChange(removeSectionById(sections, id));
                  if (selectedSectionId === id) setSelectedSectionId(null);
                }}
                onRequestMediaPick={setMediaTarget}
              />
            </div>
          </Card>
        </main>

        <aside className="elementor-sidebar elementor-inspector">
          <WidgetStylePanel section={selected} onChange={updateSelected} onDelete={deleteSelected} />
        </aside>
      </div>

      <MediaPicker
        open={mediaTarget !== null}
        onClose={() => setMediaTarget(null)}
        onSelect={(item) => applyMedia(item.url)}
        filter="image"
      />
    </div>
  );
}
