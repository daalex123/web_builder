"use client";

import type { PageSection } from "@cms/shared/layouts";
import type { NestedSection } from "@cms/shared/nested-sections";
import type { SectionStyles } from "@cms/shared/section-styles";
import { sectionStylesToCss } from "@cms/shared/section-styles";
import { createSectionId, MAX_PAGE_COLUMNS } from "@cms/shared/layouts";
import { Button, Card, ColorPicker, Form, Input, Segmented, Slider, Space, Typography, Upload, message } from "antd";
import { DeleteOutlined, UploadOutlined } from "@ant-design/icons";
import { getMediaUrl } from "@/lib/utils";
import { MediaPicker } from "@/components/media-library";
import { removeColumnAtIndex, updateSectionStyles } from "@/components/builder-section-utils";
import { SliderEditor } from "@/components/slider-editor";
import { ProductWidgetFields } from "@/components/product-widget-fields";
import { uploadMediaFiles } from "@/lib/media-client";
import { useState } from "react";

export function WidgetStylePanel({
  section,
  onChange,
  onDelete,
}: {
  section: PageSection | NestedSection | null;
  onChange: (section: PageSection | NestedSection) => void;
  onDelete: () => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [sliderPickIndex, setSliderPickIndex] = useState<number | null>(null);

  if (!section) {
    return (
      <Card size="small" title="Widget settings">
        <Typography.Text type="secondary">Select a widget on the canvas to edit styles and content.</Typography.Text>
      </Card>
    );
  }

  const current = section;

  function patchStyles(patch: Partial<SectionStyles>) {
    onChange(updateSectionStyles(current, patch));
  }

  const styles = current.styles ?? {};

  return (
    <Space direction="vertical" style={{ width: "100%" }} size="middle">
      <Card
        size="small"
        title={`${current.type} widget`}
        extra={
          <Button size="small" danger icon={<DeleteOutlined />} onClick={onDelete}>
            Delete
          </Button>
        }
      >
        <WidgetContentFields
          section={current}
          onChange={onChange}
          onPickImage={() => setPickerOpen(true)}
          onPickSlideImage={(index) => {
            setSliderPickIndex(index);
            setPickerOpen(true);
          }}
        />
      </Card>

      <Card size="small" title="Spacing">
        <Form layout="vertical">
          <Form.Item label="Padding top">
            <Slider min={0} max={120} value={styles.paddingTop ?? 0} onChange={(v) => patchStyles({ paddingTop: v })} />
          </Form.Item>
          <Form.Item label="Padding bottom">
            <Slider min={0} max={120} value={styles.paddingBottom ?? 0} onChange={(v) => patchStyles({ paddingBottom: v })} />
          </Form.Item>
          <Form.Item label="Margin top">
            <Slider min={0} max={120} value={styles.marginTop ?? 0} onChange={(v) => patchStyles({ marginTop: v })} />
          </Form.Item>
          <Form.Item label="Margin bottom">
            <Slider min={0} max={120} value={styles.marginBottom ?? 0} onChange={(v) => patchStyles({ marginBottom: v })} />
          </Form.Item>
        </Form>
      </Card>

      <Card size="small" title="Typography & colors">
        <Form layout="vertical">
          <Form.Item label="Text align">
            <Segmented
              block
              value={styles.textAlign ?? "left"}
              onChange={(value) => patchStyles({ textAlign: value as SectionStyles["textAlign"] })}
              options={[
                { label: "Left", value: "left" },
                { label: "Center", value: "center" },
                { label: "Right", value: "right" },
              ]}
            />
          </Form.Item>
          <Form.Item label="Title size">
            <Segmented
              block
              value={styles.titleSize ?? "md"}
              onChange={(value) => patchStyles({ titleSize: value as SectionStyles["titleSize"] })}
              options={[
                { label: "S", value: "sm" },
                { label: "M", value: "md" },
                { label: "L", value: "lg" },
                { label: "XL", value: "xl" },
              ]}
            />
          </Form.Item>
          <Form.Item label="Text color">
            <ColorPicker
              value={styles.textColor ?? (current.type === "slider" ? "#ffffff" : "#111827")}
              onChange={(_, hex) => patchStyles({ textColor: hex })}
              showText
            />
          </Form.Item>
          {current.type === "slider" || current.type === "hero" ? (
            <Form.Item label="Subtitle color">
              <ColorPicker
                value={styles.subTextColor ?? styles.textColor ?? "#ffffff"}
                onChange={(_, hex) => patchStyles({ subTextColor: hex })}
                showText
              />
            </Form.Item>
          ) : null}
          <Form.Item label="Background">
            <ColorPicker
              value={styles.backgroundColor ?? "#ffffff"}
              onChange={(_, hex) => patchStyles({ backgroundColor: hex })}
              showText
            />
          </Form.Item>
          <Form.Item label="Border radius">
            <Slider min={0} max={48} value={styles.borderRadius ?? 0} onChange={(v) => patchStyles({ borderRadius: v })} />
          </Form.Item>
          {current.type === "hero" || current.type === "slider" || current.type === "video" ? (
            <Form.Item label="Section width">
              <Segmented
                block
                value={styles.width ?? "auto"}
                onChange={(value) =>
                  patchStyles({
                    width: value === "auto" ? undefined : (value as SectionStyles["width"]),
                  })
                }
                options={[
                  { label: "Auto", value: "auto" },
                  { label: "Full bleed", value: "full" },
                  { label: "Contained", value: "contained" },
                ]}
              />
            </Form.Item>
          ) : null}
        </Form>
      </Card>

      {current.type === "columns" ? (
        <Card size="small" title="Columns">
          <ColumnManageControls section={current} onChange={onChange} />
        </Card>
      ) : null}

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(item) => {
          if (current.type === "hero") onChange({ ...current, image: item.url });
          if (current.type === "image") onChange({ ...current, src: item.url });
          if (current.type === "video") onChange({ ...current, poster: item.url });
          if (current.type === "slider" && sliderPickIndex !== null) {
            const slides = current.slides.map((slide, i) =>
              i === sliderPickIndex ? { ...slide, image: item.url } : slide,
            );
            onChange({ ...current, slides });
            setSliderPickIndex(null);
          }
          setPickerOpen(false);
        }}
        filter="image"
      />
    </Space>
  );
}

function ColumnManageControls({
  section,
  onChange,
}: {
  section: Extract<PageSection, { type: "columns" }>;
  onChange: (section: PageSection | NestedSection) => void;
}) {
  const widths =
    section.widths && section.widths.length === section.columns.length
      ? [...section.widths]
      : new Array(section.columns.length).fill(100 / section.columns.length);

  return (
    <Space direction="vertical" style={{ width: "100%" }}>
      {section.columns.map((col, index) => (
        <Card key={col.id ?? index} size="small" type="inner">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <Typography.Text strong>Column {index + 1}</Typography.Text>
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              disabled={section.columns.length <= 1}
              onClick={() => onChange(removeColumnAtIndex(section, index))}
            >
              Remove
            </Button>
          </div>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {(col.widgets ?? []).length} nested widget{(col.widgets ?? []).length === 1 ? "" : "s"}
          </Typography.Text>
          <div style={{ marginTop: 8 }}>
            <Typography.Text type="secondary">Width</Typography.Text>
            <Slider
              min={10}
              max={80}
              value={Math.round(widths[index] ?? 0)}
              onChange={(value) => {
                const numeric = Array.isArray(value) ? value[0] : value;
                const next = [...widths];
                next[index] = numeric;
                const total = next.reduce((sum, n) => sum + n, 0) || 1;
                const normalized = next.map((n) => Number(((n / total) * 100).toFixed(2)));
                onChange({ ...section, widths: normalized });
              }}
            />
          </div>
        </Card>
      ))}
    </Space>
  );
}

function ImageWidgetFields({
  section,
  onChange,
  onPickImage,
}: {
  section: Extract<PageSection | NestedSection, { type: "image" }>;
  onChange: (section: PageSection | NestedSection) => void;
  onPickImage: () => void;
}) {
  const [uploading, setUploading] = useState(false);

  async function handleUpload(file: File) {
    setUploading(true);
    try {
      const { uploaded, errors } = await uploadMediaFiles([file]);
      const item = uploaded[0];
      if (item) {
        onChange({
          ...section,
          src: item.url,
          alt: item.alt ?? section.alt ?? item.filename,
        });
      } else {
        message.error(errors[0] ?? "Upload failed");
      }
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <Form layout="vertical">
      {section.src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={getMediaUrl(section.src)}
          alt={section.alt ?? ""}
          style={{ maxWidth: "100%", maxHeight: 160, borderRadius: 8, marginBottom: 12, objectFit: "cover" }}
        />
      ) : null}
      <Form.Item label="Image">
        <Space wrap>
          <Upload
            accept="image/*"
            showUploadList={false}
            beforeUpload={(file) => {
              void handleUpload(file);
              return false;
            }}
          >
            <Button icon={<UploadOutlined />} loading={uploading}>
              Upload
            </Button>
          </Upload>
          <Button onClick={onPickImage}>Browse library</Button>
        </Space>
      </Form.Item>
      <Form.Item label="Image URL">
        <Input value={section.src} onChange={(e) => onChange({ ...section, src: e.target.value })} />
      </Form.Item>
      <Form.Item label="Alt text">
        <Input value={section.alt ?? ""} onChange={(e) => onChange({ ...section, alt: e.target.value })} />
      </Form.Item>
    </Form>
  );
}

function WidgetContentFields({
  section,
  onChange,
  onPickImage,
  onPickSlideImage,
}: {
  section: PageSection | NestedSection;
  onChange: (section: PageSection | NestedSection) => void;
  onPickImage: () => void;
  onPickSlideImage: (index: number) => void;
}) {
  switch (section.type) {
    case "hero":
      return (
        <Form layout="vertical">
          <Form.Item label="CTA label">
            <Input value={section.ctaLabel ?? ""} onChange={(e) => onChange({ ...section, ctaLabel: e.target.value })} />
          </Form.Item>
          <Form.Item label="CTA link">
            <Input value={section.ctaHref ?? ""} onChange={(e) => onChange({ ...section, ctaHref: e.target.value })} />
          </Form.Item>
          <Form.Item label="Background image">
            <Space.Compact style={{ width: "100%" }}>
              <Input value={section.image ?? ""} onChange={(e) => onChange({ ...section, image: e.target.value })} />
              <Button onClick={onPickImage}>Browse</Button>
            </Space.Compact>
          </Form.Item>
        </Form>
      );
    case "image":
      return (
        <ImageWidgetFields section={section} onChange={onChange} onPickImage={onPickImage} />
      );
    case "cta":
      return (
        <Form layout="vertical">
          <Form.Item label="Button label">
            <Input value={section.buttonLabel} onChange={(e) => onChange({ ...section, buttonLabel: e.target.value })} />
          </Form.Item>
          <Form.Item label="Button link">
            <Input value={section.buttonHref} onChange={(e) => onChange({ ...section, buttonHref: e.target.value })} />
          </Form.Item>
        </Form>
      );
    case "columns":
      return (
        <Button
          block
          disabled={section.columns.length >= MAX_PAGE_COLUMNS}
          onClick={() => {
            const columns = [
              ...section.columns,
              { id: createSectionId(), title: "New column", body: "", widgets: [] },
            ];
            onChange({
              ...section,
              columns,
              widths: new Array(columns.length).fill(100 / columns.length),
            });
          }}
        >
          Add column
        </Button>
      );
    case "features":
      return (
        <Button
          block
          onClick={() =>
            onChange({
              ...section,
              items: [...section.items, { title: "New feature", body: "" }],
            })
          }
        >
          Add feature
        </Button>
      );
    case "gallery":
      return (
        <Button
          block
          onClick={() =>
            onChange({
              ...section,
              images: [...section.images, { src: "", alt: "" }],
            })
          }
        >
          Add image
        </Button>
      );
    case "slider":
      return (
        <SliderEditor
          section={section}
          onChange={onChange}
          onPickSlideImage={onPickSlideImage}
        />
      );
    case "testimonials":
      return (
        <Button
          block
          onClick={() =>
            onChange({
              ...section,
              items: [...section.items, { quote: "Great experience!", author: "Client name", role: "Customer" }],
            })
          }
        >
          Add testimonial
        </Button>
      );
    case "stats":
      return (
        <Button
          block
          onClick={() =>
            onChange({
              ...section,
              items: [...section.items, { value: "100+", label: "Happy clients" }],
            })
          }
        >
          Add stat
        </Button>
      );
    case "video":
      return (
        <Form layout="vertical">
          <Form.Item label="Video URL (YouTube, Vimeo, or MP4)">
            <Input value={section.url} onChange={(e) => onChange({ ...section, url: e.target.value })} />
          </Form.Item>
          <Form.Item label="Poster image">
            <Space.Compact style={{ width: "100%" }}>
              <Input value={section.poster ?? ""} onChange={(e) => onChange({ ...section, poster: e.target.value })} />
              <Button onClick={onPickImage}>Browse</Button>
            </Space.Compact>
          </Form.Item>
        </Form>
      );
    case "spacer":
      return (
        <Form.Item label={`Height (${section.height ?? 48}px)`}>
          <Slider
            min={8}
            max={240}
            value={section.height ?? 48}
            onChange={(height) => onChange({ ...section, height })}
          />
        </Form.Item>
      );
    case "divider":
      return (
        <Segmented
          block
          value={section.variant ?? "line"}
          onChange={(variant) => onChange({ ...section, variant: variant as "line" | "dots" })}
          options={[
            { label: "Line", value: "line" },
            { label: "Dots", value: "dots" },
          ]}
        />
      );
    case "faq":
      return (
        <Button
          block
          onClick={() =>
            onChange({
              ...section,
              items: [...section.items, { question: "New question?", answer: "Answer here." }],
            })
          }
        >
          Add FAQ item
        </Button>
      );
    case "featured-products":
    case "category-products":
    case "product-slider":
      return <ProductWidgetFields section={section} onChange={onChange} />;
    default:
      return <Typography.Text type="secondary">Click text directly on the canvas to edit.</Typography.Text>;
  }
}

export function resolveSectionMedia(section: PageSection | NestedSection): PageSection | NestedSection {
  switch (section.type) {
    case "hero":
      return section.image ? { ...section, image: getMediaUrl(section.image) } : section;
    case "image":
      return { ...section, src: getMediaUrl(section.src) };
    case "gallery":
      return {
        ...section,
        images: section.images.map((img) => ({ ...img, src: getMediaUrl(img.src) })),
      };
    case "slider":
      return {
        ...section,
        slides: section.slides.map((slide) => ({ ...slide, image: getMediaUrl(slide.image) })),
      };
    case "testimonials":
      return {
        ...section,
        items: section.items.map((item) =>
          item.avatar ? { ...item, avatar: getMediaUrl(item.avatar) } : item,
        ),
      };
    case "video":
      return section.poster ? { ...section, poster: getMediaUrl(section.poster) } : section;
    default:
      return section;
  }
}

export function getSectionShellStyle(section: PageSection | NestedSection) {
  return sectionStylesToCss(section.styles);
}
