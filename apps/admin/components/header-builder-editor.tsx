"use client";

import type { NavigationSettings } from "@cms/shared/navigation";
import {
  HEADER_ELEMENT_LABELS,
  HEADER_ELEMENT_TYPES,
  HEADER_ZONES,
  createEmptyHeaderRow,
  defaultHeaderElement,
  findHeaderElement,
  presetToHeaderRows,
  removeHeaderElement,
  updateHeaderElement,
  updateZoneElements,
  type HeaderElement,
  type HeaderRow,
  type HeaderZone,
} from "@cms/shared/navigation";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  AppstoreOutlined,
  DeleteOutlined,
  FontSizeOutlined,
  HolderOutlined,
  Html5Outlined,
  MenuOutlined,
  PhoneOutlined,
  PlusOutlined,
  SearchOutlined,
  ShareAltOutlined,
  ShoppingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Button, Card, Col, Row, Segmented, Space, Switch, Tag, Typography } from "antd";
import { useMemo, useState } from "react";
import { HeaderElementInspector } from "@/components/header-element-inspector";

const { Text } = Typography;

const ELEMENT_ICONS: Partial<Record<HeaderElement["type"], React.ReactNode>> = {
  logo: <AppstoreOutlined />,
  menu: <MenuOutlined />,
  cta: <ShoppingOutlined />,
  text: <FontSizeOutlined />,
  html: <Html5Outlined />,
  social: <ShareAltOutlined />,
  phone: <PhoneOutlined />,
  search: <SearchOutlined />,
  "icon-link": <UserOutlined />,
};

function getBuilder(nav: NavigationSettings) {
  const rows = nav.headerBuilder?.rows?.length
    ? nav.headerBuilder.rows
    : presetToHeaderRows(nav.style ?? "classic", nav.showCta, nav.ctaLabel, nav.ctaHref);
  return {
    rows,
    showTopRow: nav.headerBuilder?.showTopRow ?? false,
  };
}

function SortableElementChip({
  element,
  selected,
  onSelect,
  onDelete,
}: {
  element: HeaderElement;
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: element.id,
    data: { kind: "element", elementId: element.id },
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }}
      className={`flex items-center gap-1 rounded-lg border px-2 py-1.5 text-xs ${
        selected ? "border-blue-500 bg-blue-50" : "border-neutral-200 bg-white"
      }`}
    >
      <button type="button" className="cursor-grab text-neutral-400" {...attributes} {...listeners}>
        <HolderOutlined />
      </button>
      <button type="button" className="font-medium" onClick={onSelect}>
        {HEADER_ELEMENT_LABELS[element.type]}
      </button>
      <button type="button" className="text-neutral-400 hover:text-red-500" onClick={onDelete}>
        <DeleteOutlined />
      </button>
    </div>
  );
}

function ZoneDropArea({
  rowId,
  zone,
  elements,
  selectedId,
  onSelect,
  onDelete,
}: {
  rowId: string;
  zone: HeaderZone;
  elements: HeaderElement[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `${rowId}:${zone}`,
    data: { kind: "zone", rowId, zone },
  });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[72px] flex-1 rounded-lg border border-dashed p-3 transition ${
        isOver ? "border-blue-400 bg-blue-50/50" : "border-neutral-200 bg-neutral-50/80"
      }`}
    >
      <Text type="secondary" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em" }}>
        {zone}
      </Text>
      <SortableContext items={elements.map((e) => e.id)} strategy={horizontalListSortingStrategy}>
        <div className="mt-2 flex min-h-[36px] flex-wrap gap-2">
          {elements.length === 0 ? (
            <Text type="secondary" style={{ fontSize: 12 }}>
              Drop elements here
            </Text>
          ) : (
            elements.map((element) => (
              <SortableElementChip
                key={element.id}
                element={element}
                selected={selectedId === element.id}
                onSelect={() => onSelect(element.id)}
                onDelete={() => onDelete(element.id)}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}

export function HeaderBuilderEditor({
  nav,
  onChange,
}: {
  nav: NavigationSettings;
  onChange: (patch: Partial<NavigationSettings>) => void;
}) {
  const builder = getBuilder(nav);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeRow, setActiveRow] = useState<"top" | "main">("main");
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const mainRowIndex = builder.rows.length - 1;
  const topRowIndex = builder.showTopRow && builder.rows.length > 1 ? 0 : null;
  const editingRowIndex = activeRow === "top" && topRowIndex !== null ? topRowIndex : mainRowIndex;
  const editingRow = builder.rows[editingRowIndex];

  const selected = useMemo(
    () => (selectedId ? findHeaderElement(builder.rows, selectedId) : null),
    [builder.rows, selectedId],
  );

  function commitRows(rows: HeaderRow[], showTopRow = builder.showTopRow) {
    onChange({ headerBuilder: { rows, showTopRow } });
  }

  function addElement(type: HeaderElement["type"], zone: HeaderZone = "right") {
    const element = defaultHeaderElement(type);
    const rows = builder.rows.map((row, index) => {
      if (index !== editingRowIndex) return row;
      return updateZoneElements(row, zone, [...row.zones[zone], element]);
    });
    commitRows(rows);
    setSelectedId(element.id);
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveDragId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveDragId(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const found = findHeaderElement(builder.rows, activeId);
    if (!found) return;

    const overData = over.data.current as
      | { kind: "zone"; rowId: string; zone: HeaderZone }
      | { kind: "element"; elementId: string }
      | undefined;

    let targetRowId = found.row.id;
    let targetZone = found.zone;
    let targetIndex = found.row.zones[found.zone].findIndex((e) => e.id === activeId);

    if (overData?.kind === "zone") {
      targetRowId = overData.rowId;
      targetZone = overData.zone;
      targetIndex = builder.rows
        .find((r) => r.id === targetRowId)!
        .zones[targetZone].length;
    } else if (over.id !== active.id) {
      const overFound = findHeaderElement(builder.rows, String(over.id));
      if (overFound) {
        targetRowId = overFound.row.id;
        targetZone = overFound.zone;
        targetIndex = overFound.row.zones[overFound.zone].findIndex((e) => e.id === overFound.element.id);
      }
    }

    const sourceRow = found.row;
    const sourceZone = found.zone;
    const sourceElements = [...sourceRow.zones[sourceZone]];
    const movingIndex = sourceElements.findIndex((e) => e.id === activeId);
    if (movingIndex < 0) return;

    const [moving] = sourceElements.splice(movingIndex, 1);
    let rows = builder.rows.map((row) => {
      if (row.id === sourceRow.id) {
        return updateZoneElements(row, sourceZone, sourceElements);
      }
      return row;
    });

    const targetRow = rows.find((r) => r.id === targetRowId);
    if (!targetRow) return;

    const targetElements = [...targetRow.zones[targetZone]];
    if (sourceRow.id === targetRowId && sourceZone === targetZone) {
      const reordered = arrayMove(
        [...targetRow.zones[targetZone]],
        movingIndex,
        targetIndex,
      );
      rows = rows.map((row) =>
        row.id === targetRowId ? updateZoneElements(row, targetZone, reordered) : row,
      );
    } else {
      targetElements.splice(targetIndex, 0, moving);
      rows = rows.map((row) =>
        row.id === targetRowId ? updateZoneElements(row, targetZone, targetElements) : row,
      );
    }

    commitRows(rows);
  }

  function toggleTopRow(checked: boolean) {
    if (checked) {
      const top = createEmptyHeaderRow();
      top.zones.center.push(defaultHeaderElement("text"));
      const rows = builder.rows.length > 1 ? builder.rows : [top, ...builder.rows];
      commitRows(rows, true);
      setActiveRow("top");
    } else {
      const rows = builder.rows.length > 1 ? builder.rows.slice(-1) : builder.rows;
      commitRows(rows, false);
      setActiveRow("main");
    }
  }

  function importFromPreset() {
    const rows = presetToHeaderRows(nav.style ?? "classic", nav.showCta, nav.ctaLabel, nav.ctaHref);
    commitRows(rows, false);
    setSelectedId(null);
  }

  return (
    <Row gutter={16}>
      <Col xs={24} lg={6}>
        <Card size="small" title="Elements" style={{ marginBottom: 16 }}>
          <Space direction="vertical" style={{ width: "100%" }} size={8}>
            {HEADER_ELEMENT_TYPES.map((type) => (
              <Button
                key={type}
                block
                icon={ELEMENT_ICONS[type]}
                onClick={() => addElement(type)}
                style={{ textAlign: "left" }}
              >
                {HEADER_ELEMENT_LABELS[type]}
              </Button>
            ))}
          </Space>
        </Card>
        <Button block onClick={importFromPreset}>
          Import from current preset
        </Button>
      </Col>

      <Col xs={24} lg={10}>
        <Card
          size="small"
          title="Header canvas"
          extra={
            <Space>
              <Switch
                checked={builder.showTopRow}
                onChange={toggleTopRow}
                size="small"
              />
              <Text type="secondary" style={{ fontSize: 12 }}>
                Top bar row
              </Text>
            </Space>
          }
        >
          <Segmented
            block
            style={{ marginBottom: 12 }}
            value={activeRow}
            onChange={(v) => setActiveRow(v as "top" | "main")}
            options={[
              ...(builder.showTopRow ? [{ label: "Top bar", value: "top" as const }] : []),
              { label: "Main header", value: "main" as const },
            ]}
          />

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="flex flex-col gap-3 lg:flex-row">
              {HEADER_ZONES.map((zone) => (
                <ZoneDropArea
                  key={zone}
                  rowId={editingRow.id}
                  zone={zone}
                  elements={editingRow.zones[zone]}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                  onDelete={(id) => {
                    commitRows(removeHeaderElement(builder.rows, editingRow.id, id));
                    if (selectedId === id) setSelectedId(null);
                  }}
                />
              ))}
            </div>
            <DragOverlay>
              {activeDragId ? (
                <Tag color="blue">{findHeaderElement(builder.rows, activeDragId)?.element.type}</Tag>
              ) : null}
            </DragOverlay>
          </DndContext>

          <Text type="secondary" style={{ display: "block", marginTop: 12, fontSize: 12 }}>
            Drag elements between left, center, and right zones. Click an element to edit its settings.
          </Text>
        </Card>
      </Col>

      <Col xs={24} lg={8}>
        <HeaderElementInspector
          element={selected?.element ?? null}
          onChange={(patch) => {
            if (!selected) return;
            commitRows(
              updateHeaderElement(builder.rows, selected.row.id, selected.element.id, patch),
            );
          }}
          onDelete={() => {
            if (!selected) return;
            commitRows(removeHeaderElement(builder.rows, selected.row.id, selected.element.id));
            setSelectedId(null);
          }}
        />
      </Col>
    </Row>
  );
}
