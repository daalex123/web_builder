"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { PageLayout, PageSection } from "@cms/shared/layouts";
import type { NestedSection, NestedSectionType } from "@cms/shared/nested-sections";
import { NESTABLE_WIDGET_TYPES, WIDGET_LABELS } from "@cms/shared/nested-sections";
import { getColumnGridStyle } from "@cms/shared/render-sections";
import { shouldFullBleed } from "@cms/shared/section-layout";
import { WidgetSlider } from "@cms/shared/widgets/slider";
import { WidgetVideo } from "@cms/shared/widgets/video";
import { ProductWidgetPreview } from "@/components/product-widget-preview";
import { BuilderImagePicker } from "@/components/builder-image-picker";
import { DeleteOutlined, HolderOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Dropdown, Typography } from "antd";
import { InlineEditable } from "@/components/inline-editable";
import {
  addNestedWidgetToColumn,
  getSectionLabel,
  moveSectionById,
  removeColumnAtIndex,
  reorderColumns,
  updateSectionById,
  updateSectionInTree,
} from "@/components/builder-section-utils";
import { getSectionShellStyle, resolveSectionMedia } from "@/components/widget-style-panel";

export type MediaPickTarget =
  | { sectionId: string; kind: "hero-image" | "image-src" | "video-poster" }
  | { sectionId: string; kind: "gallery"; index: number }
  | { sectionId: string; kind: "slider"; index: number }
  | { sectionId: string; kind: "testimonial-avatar"; index: number };

type BuilderCanvasProps = {
  layout: PageLayout;
  sections: PageSection[];
  selectedSectionId: string | null;
  onSelectSection: (id: string) => void;
  onChange: (sections: PageSection[]) => void;
  onDeleteSection: (id: string) => void;
  onRequestMediaPick: (target: MediaPickTarget) => void;
};

type DragItem =
  | { kind: "section"; id: string }
  | { kind: "column"; sectionId: string; index: number };

const NESTABLE_LABELS = WIDGET_LABELS;

export function BuilderCanvas({
  layout,
  sections,
  selectedSectionId,
  onSelectSection,
  onChange,
  onDeleteSection,
  onRequestMediaPick,
}: BuilderCanvasProps) {
  const [activeDrag, setActiveDrag] = useState<DragItem | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function patchSection(id: string, updater: (section: PageSection) => PageSection) {
    onChange(updateSectionById(sections, id, updater));
  }

  function patchAnySection(id: string, next: PageSection | NestedSection) {
    onChange(updateSectionInTree(sections, id, () => next));
  }

  function handleDragStart(event: DragStartEvent) {
    const data = event.active.data.current as DragItem | undefined;
    if (data) setActiveDrag(data);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveDrag(null);
    if (!over || active.id === over.id) return;

    const activeData = active.data.current as DragItem | undefined;
    const overData = over.data.current as DragItem | undefined;

    if (activeData?.kind === "section" && overData?.kind === "section") {
      onChange(moveSectionById(sections, String(active.id), String(over.id)));
      return;
    }

    if (activeData?.kind === "column" && overData?.kind === "column" && activeData.sectionId === overData.sectionId) {
      const section = sections.find((s) => s.id === activeData.sectionId);
      if (!section || section.type !== "columns") return;
      const next = reorderColumns(section, activeData.index, overData.index);
      onChange(updateSectionById(sections, section.id, () => next));
    }
  }

  function addNestedWidget(columnsSectionId: string, columnIndex: number, type: NestedSectionType) {
    const result = addNestedWidgetToColumn(sections, columnsSectionId, columnIndex, type);
    onChange(result.sections);
    onSelectSection(result.widgetId);
  }

  return (
    <div className="builder-canvas-root">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          <div className="builder-canvas-stack">
            {sections.length === 0 ? (
              <div className="builder-canvas-empty">
                <Typography.Text type="secondary">
                  Drag widgets from the left panel or click a widget button to start building.
                </Typography.Text>
              </div>
            ) : (
              sections.map((section) => (
                <SortableSection
                  key={section.id}
                  layout={layout}
                  section={resolveSectionMedia(section)}
                  selected={selectedSectionId === section.id}
                  selectedSectionId={selectedSectionId}
                  onSelectSection={onSelectSection}
                  onChange={(next) => patchSection(section.id, () => next)}
                  onPatchById={patchAnySection}
                  onDelete={() => onDeleteSection(section.id)}
                  onDeleteById={onDeleteSection}
                  onRequestMediaPick={onRequestMediaPick}
                  onAddNestedWidget={addNestedWidget}
                />
              ))
            )}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeDrag?.kind === "section" ? (
            <div className="builder-drag-ghost">{getSectionLabel(sections.find((s) => s.id === activeDrag.id)!)}</div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

function SortableSection({
  layout,
  section,
  selected,
  selectedSectionId,
  onSelectSection,
  onChange,
  onPatchById,
  onDelete,
  onDeleteById,
  onRequestMediaPick,
  onAddNestedWidget,
}: {
  layout: PageLayout;
  section: PageSection;
  selected: boolean;
  selectedSectionId: string | null;
  onSelectSection: (id: string) => void;
  onChange: (section: PageSection) => void;
  onPatchById: (id: string, next: PageSection | NestedSection) => void;
  onDelete: () => void;
  onDeleteById: (id: string) => void;
  onRequestMediaPick: (target: MediaPickTarget) => void;
  onAddNestedWidget: (columnsSectionId: string, columnIndex: number, type: NestedSectionType) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
    data: { kind: "section", id: section.id } satisfies DragItem,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const fullBleed = shouldFullBleed(section, layout);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`builder-section-wrap ${selected ? "is-selected" : ""} ${fullBleed ? "is-full-bleed" : ""}`}
      onClick={(event) => {
        event.stopPropagation();
        onSelectSection(section.id);
      }}
    >
      <div className="builder-section-toolbar">
        <Button
          type="text"
          size="small"
          icon={<HolderOutlined />}
          className="builder-drag-handle"
          {...attributes}
          {...listeners}
          onClick={(event) => event.stopPropagation()}
        />
        <span className="builder-section-label">{section.type}</span>
        <Button
          type="text"
          size="small"
          danger
          icon={<DeleteOutlined />}
          onClick={(event) => {
            event.stopPropagation();
            onDelete();
          }}
        />
      </div>
      <div style={getSectionShellStyle(section)}>
        <EditableSectionBlock
          section={section}
          fullBleed={fullBleed}
          selectedSectionId={selectedSectionId}
          onSelectSection={onSelectSection}
          onChange={onChange}
          onPatchById={onPatchById}
          onDeleteById={onDeleteById}
          onRequestMediaPick={onRequestMediaPick}
          onAddNestedWidget={onAddNestedWidget}
        />
      </div>
    </div>
  );
}

type BlockProps = {
  section: PageSection | NestedSection;
  fullBleed?: boolean;
  selectedSectionId: string | null;
  onSelectSection: (id: string) => void;
  onChange: (section: PageSection | NestedSection) => void;
  onPatchById: (id: string, next: PageSection | NestedSection) => void;
  onDeleteById: (id: string) => void;
  onRequestMediaPick: (target: MediaPickTarget) => void;
  onAddNestedWidget?: (columnsSectionId: string, columnIndex: number, type: NestedSectionType) => void;
  nested?: boolean;
};

function NestedWidgetWrap({
  widget,
  selected,
  onSelect,
  onDelete,
  children,
}: {
  widget: NestedSection;
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`builder-nested-wrap ${selected ? "is-selected" : ""}`}
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
      }}
    >
      <div className="builder-nested-toolbar">
        <span className="builder-section-label">{widget.type}</span>
        <Button
          type="text"
          size="small"
          danger
          icon={<DeleteOutlined />}
          onClick={(event) => {
            event.stopPropagation();
            onDelete();
          }}
        />
      </div>
      {children}
    </div>
  );
}

function EditableSectionBlock({
  section,
  fullBleed = false,
  selectedSectionId,
  onSelectSection,
  onChange,
  onPatchById,
  onDeleteById,
  onRequestMediaPick,
  onAddNestedWidget,
}: BlockProps) {
  const selected = selectedSectionId === section.id;

  switch (section.type) {
    case "hero":
      return (
        <section
          className={
            fullBleed
              ? "relative flex min-h-[320px] items-center overflow-hidden bg-gradient-to-br from-slate-900 to-slate-700 px-6 py-16 text-white md:min-h-[420px]"
              : "relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 px-8 py-16 text-white"
          }
        >
          <button
            type="button"
            className="builder-image-picker absolute inset-0 z-0 bg-cover bg-center opacity-30"
            style={{ backgroundImage: section.image ? `url(${section.image})` : undefined }}
            onClick={(event) => {
              event.stopPropagation();
              onSelectSection(section.id);
              onRequestMediaPick({ sectionId: section.id, kind: "hero-image" });
            }}
          >
            <span className="builder-image-picker-label">Click to change image</span>
          </button>
          <div className={`relative z-10 ${fullBleed ? "mx-auto w-full max-w-4xl text-center" : "max-w-2xl"}`}>
            <InlineEditable
              tag={fullBleed ? "h1" : "h2"}
              className={fullBleed ? "text-4xl font-bold md:text-5xl" : "text-3xl font-bold md:text-4xl"}
              value={section.title}
              onChange={(title) => onChange({ ...section, title })}
              placeholder="Hero title"
            />
            <InlineEditable
              tag="p"
              className="mt-4 text-lg text-slate-200"
              value={section.subtitle ?? ""}
              onChange={(subtitle) => onChange({ ...section, subtitle })}
              placeholder="Subtitle"
            />
            {section.ctaLabel ? (
              <span className="mt-6 inline-block rounded-lg bg-white px-6 py-3 text-sm font-semibold text-slate-900">
                {section.ctaLabel}
              </span>
            ) : null}
          </div>
        </section>
      );

    case "text":
      return (
        <section>
          <InlineEditable
            tag="h2"
            className="mb-4 text-2xl font-semibold text-gray-900"
            value={section.heading ?? ""}
            onChange={(heading) => onChange({ ...section, heading })}
            placeholder="Heading"
          />
          <InlineEditable
            tag="p"
            className="whitespace-pre-wrap text-gray-600 leading-relaxed"
            value={section.body}
            onChange={(body) => onChange({ ...section, body })}
            placeholder="Write your content..."
            multiline
          />
        </section>
      );

    case "image":
      return (
        <figure>
          <BuilderImagePicker
            src={section.src}
            alt={section.alt ?? ""}
            label="Upload or choose image"
            onPickFromLibrary={() => {
              onSelectSection(section.id);
              onRequestMediaPick({ sectionId: section.id, kind: "image-src" });
            }}
            onImageUrl={(src, alt) => {
              onSelectSection(section.id);
              onChange({ ...section, src, ...(alt ? { alt } : {}) });
            }}
          />
          <InlineEditable
            tag="p"
            className="mt-2 text-center text-sm text-gray-500"
            value={section.caption ?? ""}
            onChange={(caption) => onChange({ ...section, caption })}
            placeholder="Caption"
          />
        </figure>
      );

    case "columns":
      return (
        <section className="grid gap-8" style={getColumnGridStyle(section)}>
          <SortableContext
            items={section.columns.map((_, index) => `${section.id}-col-${index}`)}
            strategy={horizontalListSortingStrategy}
          >
            {section.columns.map((col, index) => (
              <SortableColumn
                key={col.id ?? `${section.id}-col-${index}`}
                id={`${section.id}-col-${index}`}
                sectionId={section.id}
                index={index}
                title={col.title ?? ""}
                body={col.body ?? ""}
                widgets={col.widgets ?? []}
                selectedSectionId={selectedSectionId}
                onSelectSection={onSelectSection}
                onChange={(title, body) => {
                  const columns = [...section.columns];
                  columns[index] = { ...col, title, body };
                  onChange({ ...section, columns });
                }}
                onPatchById={onPatchById}
                onDeleteById={onDeleteById}
                onRequestMediaPick={onRequestMediaPick}
                onAddNestedWidget={(type) => onAddNestedWidget?.(section.id, index, type)}
                canRemoveColumn={section.columns.length > 1}
                onRemoveColumn={() => onChange(removeColumnAtIndex(section, index))}
              />
            ))}
          </SortableContext>
        </section>
      );

    case "cta":
      return (
        <section className="rounded-2xl bg-blue-600 px-8 py-12 text-center text-white">
          <InlineEditable
            tag="h2"
            className="text-2xl font-bold"
            value={section.title}
            onChange={(title) => onChange({ ...section, title })}
            placeholder="CTA title"
          />
          <InlineEditable
            tag="p"
            className="mx-auto mt-3 max-w-xl text-blue-100"
            value={section.body}
            onChange={(body) => onChange({ ...section, body })}
            placeholder="CTA body"
            multiline
          />
          <span className="mt-6 inline-block rounded-lg bg-white px-6 py-3 text-sm font-semibold text-blue-700">
            {section.buttonLabel}
          </span>
        </section>
      );

    case "features":
      return (
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {section.items.map((item, index) => (
            <div key={index} className="builder-item-card rounded-xl bg-gray-50 p-6">
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
                className="builder-item-delete"
                onClick={(event) => {
                  event.stopPropagation();
                  onChange({
                    ...section,
                    items: section.items.filter((_, i) => i !== index),
                  });
                }}
              />
              <InlineEditable
                tag="h3"
                className="font-semibold text-gray-900"
                value={item.title}
                onChange={(title) => {
                  const items = [...section.items];
                  items[index] = { ...item, title };
                  onChange({ ...section, items });
                }}
                placeholder="Feature title"
              />
              <InlineEditable
                tag="p"
                className="mt-2 text-sm text-gray-600"
                value={item.body}
                onChange={(body) => {
                  const items = [...section.items];
                  items[index] = { ...item, body };
                  onChange({ ...section, items });
                }}
                placeholder="Feature description"
                multiline
              />
            </div>
          ))}
        </section>
      );

    case "gallery":
      return (
        <section className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {section.images.map((img, index) => (
            <div key={index} className="builder-item-card relative">
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
                className="builder-item-delete"
                onClick={(event) => {
                  event.stopPropagation();
                  onChange({
                    ...section,
                    images: section.images.filter((_, i) => i !== index),
                  });
                }}
              />
              <button
                type="button"
                className="builder-image-picker block w-full"
                onClick={(event) => {
                  event.stopPropagation();
                  onSelectSection(section.id);
                  onRequestMediaPick({ sectionId: section.id, kind: "gallery", index });
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.src} alt={img.alt ?? ""} className="aspect-square w-full rounded-lg object-cover" />
                <span className="builder-image-picker-label">Change</span>
              </button>
            </div>
          ))}
        </section>
      );

    case "slider":
      return (
        <WidgetSlider
          slides={section.slides}
          effect={section.effect}
          autoplay={section.autoplay}
          interval={section.interval}
          pauseOnHover={section.pauseOnHover}
          loop={section.loop}
          showArrows={section.showArrows}
          showDots={section.showDots}
          showProgress={section.showProgress}
          height={section.height}
          kenBurns={section.kenBurns}
          overlay={section.overlay}
          arrowStyle={section.arrowStyle}
          dotStyle={section.dotStyle}
          fullBleed={fullBleed}
          styles={section.styles}
        />
      );

    case "testimonials":
      return (
        <section>
          <InlineEditable
            tag="h2"
            className="mb-6 text-center text-2xl font-semibold text-gray-900"
            value={section.heading ?? ""}
            onChange={(heading) => onChange({ ...section, heading })}
            placeholder="Section heading"
          />
          <div className="grid gap-4 md:grid-cols-2">
            {section.items.map((item, index) => (
              <div key={index} className="builder-item-card rounded-xl border border-gray-200 p-4">
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  className="builder-item-delete"
                  onClick={(event) => {
                    event.stopPropagation();
                    onChange({ ...section, items: section.items.filter((_, i) => i !== index) });
                  }}
                />
                <InlineEditable
                  tag="p"
                  className="text-gray-700 italic"
                  value={item.quote}
                  onChange={(quote) => {
                    const items = [...section.items];
                    items[index] = { ...item, quote };
                    onChange({ ...section, items });
                  }}
                  placeholder="Testimonial quote"
                  multiline
                />
                <InlineEditable
                  tag="p"
                  className="mt-3 font-semibold text-gray-900"
                  value={item.author}
                  onChange={(author) => {
                    const items = [...section.items];
                    items[index] = { ...item, author };
                    onChange({ ...section, items });
                  }}
                  placeholder="Author name"
                />
                <Button
                  size="small"
                  className="mt-2"
                  onClick={(event) => {
                    event.stopPropagation();
                    onSelectSection(section.id);
                    onRequestMediaPick({ sectionId: section.id, kind: "testimonial-avatar", index });
                  }}
                >
                  {item.avatar ? "Change avatar" : "Add avatar"}
                </Button>
              </div>
            ))}
          </div>
        </section>
      );

    case "stats":
      return (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {section.items.map((item, index) => (
            <div key={index} className="builder-item-card rounded-xl bg-slate-900 p-4 text-center text-white">
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
                className="builder-item-delete"
                onClick={(event) => {
                  event.stopPropagation();
                  onChange({ ...section, items: section.items.filter((_, i) => i !== index) });
                }}
              />
              <InlineEditable
                tag="p"
                className="text-3xl font-bold"
                value={item.value}
                onChange={(value) => {
                  const items = [...section.items];
                  items[index] = { ...item, value };
                  onChange({ ...section, items });
                }}
                placeholder="100+"
              />
              <InlineEditable
                tag="p"
                className="mt-2 text-sm text-slate-300"
                value={item.label}
                onChange={(label) => {
                  const items = [...section.items];
                  items[index] = { ...item, label };
                  onChange({ ...section, items });
                }}
                placeholder="Label"
              />
            </div>
          ))}
        </section>
      );

    case "video":
      return (
        <div>
          <WidgetVideo url={section.url} poster={section.poster} caption={section.caption} />
          <div className="mt-2 flex gap-2">
            <Button
              size="small"
              onClick={(event) => {
                event.stopPropagation();
                onSelectSection(section.id);
                onRequestMediaPick({ sectionId: section.id, kind: "video-poster" });
              }}
            >
              Set poster
            </Button>
          </div>
        </div>
      );

    case "spacer":
      return (
        <div
          className="flex items-center justify-center rounded border border-dashed border-gray-300 bg-gray-50 text-xs text-gray-400"
          style={{ height: section.height ?? 48 }}
        >
          Spacer ({section.height ?? 48}px)
        </div>
      );

    case "divider":
      return section.variant === "dots" ? (
        <div className="flex justify-center gap-2 py-4">
          <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />
          <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />
          <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />
        </div>
      ) : (
        <hr className="border-gray-200" />
      );

    case "faq":
      return (
        <section>
          <InlineEditable
            tag="h2"
            className="mb-4 text-2xl font-semibold text-gray-900"
            value={section.heading ?? ""}
            onChange={(heading) => onChange({ ...section, heading })}
            placeholder="FAQ heading"
          />
          <div className="space-y-3">
            {section.items.map((item, index) => (
              <div key={index} className="builder-item-card rounded-xl border border-gray-200 p-4">
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  className="builder-item-delete"
                  onClick={(event) => {
                    event.stopPropagation();
                    onChange({ ...section, items: section.items.filter((_, i) => i !== index) });
                  }}
                />
                <InlineEditable
                  tag="p"
                  className="font-medium text-gray-900"
                  value={item.question}
                  onChange={(question) => {
                    const items = [...section.items];
                    items[index] = { ...item, question };
                    onChange({ ...section, items });
                  }}
                  placeholder="Question"
                />
                <InlineEditable
                  tag="p"
                  className="mt-2 text-gray-600"
                  value={item.answer}
                  onChange={(answer) => {
                    const items = [...section.items];
                    items[index] = { ...item, answer };
                    onChange({ ...section, items });
                  }}
                  placeholder="Answer"
                  multiline
                />
              </div>
            ))}
          </div>
        </section>
      );

    case "featured-products":
      return (
        <section>
          <InlineEditable
            tag="h2"
            className="mb-6 text-center text-2xl font-light text-gray-900"
            value={section.heading ?? ""}
            onChange={(heading) => onChange({ ...section, heading })}
            placeholder="Featured products"
          />
          <ProductWidgetPreview slugs={section.productSlugs} />
        </section>
      );

    case "category-products":
      return (
        <section>
          <InlineEditable
            tag="h2"
            className="text-3xl font-light text-gray-900"
            value={section.title}
            onChange={(title) => onChange({ ...section, title })}
            placeholder="Category title"
          />
          <InlineEditable
            tag="p"
            className="mt-4 text-sm text-gray-600"
            value={section.subtitle}
            onChange={(subtitle) => onChange({ ...section, subtitle })}
            placeholder="Category description"
            multiline
          />
          <ProductWidgetPreview slugs={section.productSlugs} />
        </section>
      );

    case "product-slider":
      return (
        <section>
          <InlineEditable
            tag="h2"
            className="mb-6 text-center text-2xl font-light text-gray-900"
            value={section.heading ?? ""}
            onChange={(heading) => onChange({ ...section, heading })}
            placeholder="Product slider"
          />
          <ProductWidgetPreview slugs={section.productSlugs} />
        </section>
      );
  }
}

function SortableColumn({
  id,
  sectionId,
  index,
  title,
  body,
  widgets,
  selectedSectionId,
  onSelectSection,
  onChange,
  onPatchById,
  onDeleteById,
  onRequestMediaPick,
  onAddNestedWidget,
  canRemoveColumn,
  onRemoveColumn,
}: {
  id: string;
  sectionId: string;
  index: number;
  title: string;
  body: string;
  widgets: NestedSection[];
  selectedSectionId: string | null;
  onSelectSection: (id: string) => void;
  onChange: (title: string, body: string) => void;
  onPatchById: (id: string, next: PageSection | NestedSection) => void;
  onDeleteById: (id: string) => void;
  onRequestMediaPick: (target: MediaPickTarget) => void;
  onAddNestedWidget: (type: NestedSectionType) => void;
  canRemoveColumn: boolean;
  onRemoveColumn: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    data: { kind: "column", sectionId, index } satisfies DragItem,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  const nestMenu = {
    items: NESTABLE_WIDGET_TYPES.map((type) => ({
      key: type,
      label: `Add ${NESTABLE_LABELS[type]}`,
      onClick: () => onAddNestedWidget(type),
    })),
  };

  return (
    <div ref={setNodeRef} style={style} className="builder-column-card rounded-xl border border-gray-200 p-6">
      <div className="builder-column-toolbar">
        <Button
          type="text"
          size="small"
          icon={<HolderOutlined />}
          className="builder-drag-handle"
          {...attributes}
          {...listeners}
        />
        <span className="builder-section-label">Column {index + 1}</span>
        <Dropdown menu={nestMenu} trigger={["click"]}>
          <Button type="text" size="small" icon={<PlusOutlined />} onClick={(e) => e.stopPropagation()}>
            Add
          </Button>
        </Dropdown>
        <Button
          type="text"
          size="small"
          danger
          icon={<DeleteOutlined />}
          disabled={!canRemoveColumn}
          title={canRemoveColumn ? "Remove column" : "At least one column is required"}
          onClick={(event) => {
            event.stopPropagation();
            onRemoveColumn();
          }}
        />
      </div>
      <InlineEditable
        tag="h3"
        className="text-lg font-semibold text-gray-900"
        value={title}
        onChange={(nextTitle) => onChange(nextTitle, body)}
        placeholder="Column title"
      />
      <InlineEditable
        tag="p"
        className="mt-2 text-gray-600"
        value={body}
        onChange={(nextBody) => onChange(title, nextBody)}
        placeholder="Column content"
        multiline
      />
      {widgets.length > 0 ? (
        <div className="mt-4 space-y-4">
          {widgets.map((widget) => (
            <NestedWidgetWrap
              key={widget.id}
              widget={widget}
              selected={selectedSectionId === widget.id}
              onSelect={() => onSelectSection(widget.id)}
              onDelete={() => onDeleteById(widget.id)}
            >
              <EditableSectionBlock
                section={resolveSectionMedia(widget)}
                selectedSectionId={selectedSectionId}
                onSelectSection={onSelectSection}
                onChange={(next) => onPatchById(widget.id, next)}
                onPatchById={onPatchById}
                onDeleteById={onDeleteById}
                onRequestMediaPick={onRequestMediaPick}
                nested
              />
            </NestedWidgetWrap>
          ))}
        </div>
      ) : null}
    </div>
  );
}
