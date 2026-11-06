import type { Column } from '../columns/types';
import type {
  LastSeenCustomRange,
  SortDirection,
  SystemsViewFilterState,
  SystemsViewItem,
} from '../types';

export type ExportFormat = 'csv' | 'json';

/**
 * Snapshot of the table state at export time. Passed to `onExport` so the
 * consumer — not the table — decides the export scope (filtered vs. all
 * systems, selection-only, …).
 */
export interface SystemsViewExportState<TItem extends SystemsViewItem> {
  /** Toolbar filter state (debounced to match the displayed rows). */
  filters: SystemsViewFilterState;
  /** Runtime table columns, with visible/permission-locked flags applied. */
  columns: readonly Column<TItem>[];
  /** Active sort column key, if any. */
  sortBy: string | undefined;
  /** Active sort direction, if any. */
  direction: SortDirection | undefined;
  /** Custom "Last seen" date range, when active. */
  lastSeenCustomRange?: LastSeenCustomRange;
  /** Currently selected rows, if row selection is enabled. */
  selectedItems: readonly TItem[];
  /** Total number of rows matching the current filters. */
  total: number;
}

/**
 * Export menu configuration. Provide via `<SystemsView exportConfig>` to
 * render the export menu; omit it to hide the menu entirely.
 *
 * The table owns the toast lifecycle around `onExport` (preparing →
 * downloaded / failed), so server-side and client-side exports get the
 * same experience.
 */
export interface SystemsViewExportConfig<TItem extends SystemsViewItem> {
  /**
   * Kick off the export. Receives the chosen format and the current table
   * state. Resolve once the download has started; reject on failure.
   *
   * May be omitted to export all systems through the inventory backend
   * (parity with the Gen 1 InventoryTable's `enableExport`): the federated
   * SystemsView module fills in this default, including the
   * "Export all systems …" menu labels. Omitting `onExport` on the raw
   * SystemsView component leaves the menu inert.
   */
  onExport?: (
    format: ExportFormat,
    state: SystemsViewExportState<TItem>,
  ) => Promise<void>;
  /**
   * Disable the menu — e.g. zero matching rows. Either a static boolean or a
   * predicate evaluated against the live table state. Defaults to enabled.
   */
  isDisabled?: boolean | ((state: SystemsViewExportState<TItem>) => boolean);
  /** Menu item labels. Default: "Export to CSV" / "Export to JSON". */
  itemTexts?: Partial<Record<ExportFormat, string>>;
}
