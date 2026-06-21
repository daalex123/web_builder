"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  createSectionId,
  defaultSection,
  MAX_PAGE_COLUMNS,
  type PageSection,
} from "@cms/shared/layouts";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  Select,
  Slider,
  Space,
  Typography,
} from "antd";
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  HolderOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { MediaPicker } from "@/components/media-library";
import { removeColumnAtIndex } from "@/components/builder-section-utils";

const { TextArea } = Input;

const SECTION_TYPES = [
  { value: "hero", label: "Hero" },
  { value: "text", label: "Text" },
  { value: "image", label: "Image" },
  { value: "slider", label: "Slider" },
  { value: "video", label: "Video" },
  { value: "columns", label: "Columns" },
  { value: "cta", label: "Call to Action" },
  { value: "features", label: "Features" },
  { value: "gallery", label: "Gallery" },
  { value: "testimonials", label: "Testimonials" },
  { value: "stats", label: "Stats" },
  { value: "faq", label: "FAQ" },
  { value: "spacer", label: "Spacer" },
  { value: "divider", label: "Divider" },
  { value: "featured-products", label: "Featured Products" },
  { value: "category-products", label: "Category Products" },
  { value: "product-slider", label: "Product Slider" },
] as const;

export function LayoutDesigner({
  sections,
  onChange,
}: {
  sections: PageSection[];
  onChange: (sections: PageSection[]) => void;
}) {
  const [pickerFor, setPickerFor] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function updateSection(index: number, next: PageSection) {
    const copy = [...sections];
    copy[index] = next;
    onChange(copy);
  }

  function removeSection(index: number) {
    onChange(sections.filter((_, i) => i !== index));
  }

  function moveSection(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= sections.length) return;
    const copy = [...sections];
    [copy[index], copy[target]] = [copy[target], copy[index]];
    onChange(copy);
  }

  function addSection(type: PageSection["type"]) {
    onChange([...sections, defaultSection(type)]);
  }

  function setImage(index: number, url: string) {
    const section = sections[index];
    if (section.type === "hero") updateSection(index, { ...section, image: url });
    if (section.type === "image") updateSection(index, { ...section, src: url });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sections.findIndex((s) => s.id === active.id);
    const newIndex = sections.findIndex((s) => s.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    onChange(arrayMove(sections, oldIndex, newIndex));
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <Typography.Text type="secondary">
          Build your page with sections. Drag the handle to reorder.
        </Typography.Text>
        <Select
          placeholder="Add section"
          style={{ width: 180 }}
          onSelect={(v) => addSection(v as PageSection["type"])}
          options={SECTION_TYPES.map((t) => ({ value: t.value, label: t.label }))}
          suffixIcon={<PlusOutlined />}
        />
      </div>

      {sections.length === 0 ? (
        <Card>
          <Typography.Text type="secondary">
            No sections yet. Add a Hero, Features, or Gallery block to get started.
          </Typography.Text>
        </Card>
      ) : null}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          <Space direction="vertical" style={{ width: "100%" }} size="middle">
            {sections.map((section, index) => (
              <SortableSectionCard
                key={section.id}
                section={section}
                index={index}
                total={sections.length}
                onChange={(next) => updateSection(index, next)}
                onRemove={() => removeSection(index)}
                onMoveUp={() => moveSection(index, -1)}
                onMoveDown={() => moveSection(index, 1)}
                onPickImage={() => setPickerFor(section.id)}
              />
            ))}
          </Space>
        </SortableContext>
      </DndContext>

      <MediaPicker
        open={pickerFor !== null}
        onClose={() => setPickerFor(null)}
        onSelect={(item) => {
          const index = sections.findIndex((s) => s.id === pickerFor);
          if (index >= 0) setImage(index, item.url);
          setPickerFor(null);
        }}
        filter="image"
      />
    </div>
  );
}

function SortableSectionCard({
  section,
  index,
  total,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  onPickImage,
}: {
  section: PageSection;
  index: number;
  total: number;
  onChange: (section: PageSection) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onPickImage: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.85 : 1,
    zIndex: isDragging ? 1 : undefined,
  };

  const label = SECTION_TYPES.find((t) => t.value === section.type)?.label ?? section.type;

  return (
    <div ref={setNodeRef} style={style}>
      <Card
        size="small"
        title={
          <Space>
            <Button
              type="text"
              size="small"
              icon={<HolderOutlined />}
              style={{ cursor: "grab" }}
              {...attributes}
              {...listeners}
            />
            <span>{label}</span>
          </Space>
        }
        extra={
          <Space>
            <Button size="small" icon={<ArrowUpOutlined />} onClick={onMoveUp} disabled={index === 0} />
            <Button size="small" icon={<ArrowDownOutlined />} onClick={onMoveDown} disabled={index === total - 1} />
            <Button size="small" danger icon={<DeleteOutlined />} onClick={onRemove} />
          </Space>
        }
      >
        <SectionFields section={section} onChange={onChange} onPickImage={onPickImage} />
      </Card>
    </div>
  );
}

function SectionFields({
  section,
  onChange,
  onPickImage,
}: {
  section: PageSection;
  onChange: (section: PageSection) => void;
  onPickImage: () => void;
}) {
  switch (section.type) {
    case "hero":
      return (
        <Form layout="vertical">
          <Form.Item label="Title"><Input value={section.title} onChange={(e) => onChange({ ...section, title: e.target.value })} /></Form.Item>
          <Form.Item label="Subtitle"><Input value={section.subtitle ?? ""} onChange={(e) => onChange({ ...section, subtitle: e.target.value })} /></Form.Item>
          <Form.Item label="Image URL">
            <Space.Compact style={{ width: "100%" }}>
              <Input value={section.image ?? ""} onChange={(e) => onChange({ ...section, image: e.target.value })} />
              <Button onClick={onPickImage}>Browse</Button>
            </Space.Compact>
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}><Form.Item label="CTA Label"><Input value={section.ctaLabel ?? ""} onChange={(e) => onChange({ ...section, ctaLabel: e.target.value })} /></Form.Item></Col>
            <Col span={12}><Form.Item label="CTA Link"><Input value={section.ctaHref ?? ""} onChange={(e) => onChange({ ...section, ctaHref: e.target.value })} /></Form.Item></Col>
          </Row>
        </Form>
      );
    case "text":
      return (
        <Form layout="vertical">
          <Form.Item label="Heading"><Input value={section.heading ?? ""} onChange={(e) => onChange({ ...section, heading: e.target.value })} /></Form.Item>
          <Form.Item label="Body"><TextArea rows={4} value={section.body} onChange={(e) => onChange({ ...section, body: e.target.value })} /></Form.Item>
        </Form>
      );
    case "image":
      return (
        <Form layout="vertical">
          <Form.Item label="Image URL">
            <Space.Compact style={{ width: "100%" }}>
              <Input value={section.src} onChange={(e) => onChange({ ...section, src: e.target.value })} />
              <Button onClick={onPickImage}>Browse</Button>
            </Space.Compact>
          </Form.Item>
          <Form.Item label="Alt text"><Input value={section.alt ?? ""} onChange={(e) => onChange({ ...section, alt: e.target.value })} /></Form.Item>
          <Form.Item label="Caption"><Input value={section.caption ?? ""} onChange={(e) => onChange({ ...section, caption: e.target.value })} /></Form.Item>
        </Form>
      );
    case "columns":
      const widths =
        section.widths && section.widths.length === section.columns.length
          ? [...section.widths]
          : new Array(section.columns.length).fill(100 / section.columns.length);
      return (
        <Space direction="vertical" style={{ width: "100%" }}>
          <Card size="small" type="inner" title="Column widths">
            <Space direction="vertical" style={{ width: "100%" }}>
              {section.columns.map((_, i) => (
                <div key={`width-${i}`}>
                  <Typography.Text type="secondary">Column {i + 1}</Typography.Text>
                  <Slider
                    min={10}
                    max={80}
                    value={Math.round(widths[i] ?? 0)}
                    onChange={(value) => {
                      const numeric = Array.isArray(value) ? value[0] : value;
                      const next = [...widths];
                      next[i] = numeric;
                      const total = next.reduce((sum, n) => sum + n, 0) || 1;
                      const normalized = next.map((n) => Number(((n / total) * 100).toFixed(2)));
                      onChange({ ...section, widths: normalized });
                    }}
                  />
                </div>
              ))}
            </Space>
          </Card>
          {section.columns.map((col, i) => (
            <Card
              key={col.id ?? i}
              size="small"
              type="inner"
              extra={
                <Button
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  disabled={section.columns.length <= 1}
                  onClick={() => onChange(removeColumnAtIndex(section, i))}
                />
              }
            >
              <Form.Item label="Title"><Input value={col.title ?? ""} onChange={(e) => {
                const columns = [...section.columns];
                columns[i] = { ...col, title: e.target.value };
                onChange({ ...section, columns });
              }} /></Form.Item>
              <Form.Item label="Body"><TextArea rows={2} value={col.body ?? ""} onChange={(e) => {
                const columns = [...section.columns];
                columns[i] = { ...col, body: e.target.value };
                onChange({ ...section, columns });
              }} /></Form.Item>
            </Card>
          ))}
          <Button
            disabled={section.columns.length >= MAX_PAGE_COLUMNS}
            onClick={() => {
              if (section.columns.length >= MAX_PAGE_COLUMNS) return;
              const nextColumns = [
                ...section.columns,
                { id: createSectionId(), title: "New column", body: "", widgets: [] as never[] },
              ];
              const nextWidths = new Array(nextColumns.length).fill(100 / nextColumns.length);
              onChange({ ...section, columns: nextColumns, widths: nextWidths });
            }}
          >
            Add column
          </Button>
        </Space>
      );
    case "cta":
      return (
        <Form layout="vertical">
          <Form.Item label="Title"><Input value={section.title} onChange={(e) => onChange({ ...section, title: e.target.value })} /></Form.Item>
          <Form.Item label="Body"><TextArea rows={2} value={section.body} onChange={(e) => onChange({ ...section, body: e.target.value })} /></Form.Item>
          <Row gutter={12}>
            <Col span={12}><Form.Item label="Button label"><Input value={section.buttonLabel} onChange={(e) => onChange({ ...section, buttonLabel: e.target.value })} /></Form.Item></Col>
            <Col span={12}><Form.Item label="Button link"><Input value={section.buttonHref} onChange={(e) => onChange({ ...section, buttonHref: e.target.value })} /></Form.Item></Col>
          </Row>
        </Form>
      );
    case "features":
      return (
        <Space direction="vertical" style={{ width: "100%" }}>
          {section.items.map((item, i) => (
            <Card key={i} size="small" type="inner">
              <Form.Item label="Title"><Input value={item.title} onChange={(e) => {
                const items = [...section.items];
                items[i] = { ...item, title: e.target.value };
                onChange({ ...section, items });
              }} /></Form.Item>
              <Form.Item label="Body"><TextArea rows={2} value={item.body} onChange={(e) => {
                const items = [...section.items];
                items[i] = { ...item, body: e.target.value };
                onChange({ ...section, items });
              }} /></Form.Item>
            </Card>
          ))}
          <Button onClick={() => onChange({ ...section, items: [...section.items, { title: "New feature", body: "" }] })}>Add feature</Button>
        </Space>
      );
    case "gallery":
      return (
        <Space direction="vertical" style={{ width: "100%" }}>
          {section.images.map((img, i) => (
            <Space.Compact key={i} style={{ width: "100%" }}>
              <Input value={img.src} onChange={(e) => {
                const images = [...section.images];
                images[i] = { ...img, src: e.target.value };
                onChange({ ...section, images });
              }} />
              <Input placeholder="Alt" value={img.alt ?? ""} onChange={(e) => {
                const images = [...section.images];
                images[i] = { ...img, alt: e.target.value };
                onChange({ ...section, images });
              }} />
            </Space.Compact>
          ))}
          <Button onClick={() => onChange({ ...section, images: [...section.images, { src: "", alt: "" }] })}>Add image</Button>
        </Space>
      );
    default:
      return (
        <Typography.Text type="secondary">
          Use the Visual Builder tab for full editing of this widget.
        </Typography.Text>
      );
  }
}
