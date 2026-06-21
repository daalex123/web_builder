import { z } from "zod";
import { nestedSectionSchema, type NestedSection } from "./widget-schemas";

function createCellId() {
  return `sec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export { nestedSectionSchema, NESTABLE_WIDGET_TYPES, WIDGET_LABELS } from "./widget-schemas";
export type { NestedSection, NestedSectionType } from "./widget-schemas";

export const columnCellSchema = z.object({
  id: z.string().optional(),
  title: z.string().optional(),
  body: z.string().optional(),
  widgets: z.array(nestedSectionSchema).optional(),
});

export type ColumnCellInput = z.infer<typeof columnCellSchema>;

export type ColumnCell = {
  id: string;
  title?: string;
  body?: string;
  widgets: NestedSection[];
};

export function normalizeColumnCell(cell: ColumnCellInput): ColumnCell {
  return {
    id: cell.id ?? createCellId(),
    title: cell.title,
    body: cell.body,
    widgets: cell.widgets ?? [],
  };
}

export function normalizeColumnCells(cells: ColumnCellInput[]): ColumnCell[] {
  return cells.map(normalizeColumnCell);
}
