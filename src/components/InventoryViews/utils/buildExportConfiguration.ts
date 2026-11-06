import type { ViewConfiguration } from '../../../api/inventoryViewsApi';
import { buildViewConfigFilters } from './viewConfigFilters';
import { normalizeViewColumns } from './normalizeViewColumns';

import type { Column } from '../../SystemsView/columns/types';
import type {
  LastSeenCustomRange,
  SortDirection,
  SystemsViewFilterState,
  SystemsViewItem,
} from '../../SystemsView/types';

// The Status column sorts by 'status' in the UI, but the backend's view
// configuration contract has no ORDER BY for that key — the table's own
// query maps it to 'last_check_in' (buildHostViewsParams), and the export
// must serialize the same value.
const SORT_KEY_TO_EXPORT_SORT_KEY: Record<string, string> = {
  status: 'last_check_in',
};

const normalizeColumns = <TItem extends SystemsViewItem>(
  columns: readonly Column<TItem>[],
): ViewConfiguration['columns'] =>
  // Permission-locked columns render as "unauthorized" placeholders in the
  // table and must not leak their data through the export. Unlike the save
  // path (normalizeViewColumns), which keeps them so saved views stay valid
  // across users with different permissions, the export strips them
  // according to the exporter's own permissions.
  normalizeViewColumns(columns.filter((column) => !column.isPermissionLocked));

const normalizeSort = (
  sortBy: string | undefined,
  direction: SortDirection | undefined,
): ViewConfiguration['sort'] | undefined => {
  if (!sortBy || (direction !== 'asc' && direction !== 'desc'))
    return undefined;
  const key = SORT_KEY_TO_EXPORT_SORT_KEY[sortBy] ?? sortBy;
  return { key, direction };
};

/**
 *  @param root0                     Current table state
 *  @param root0.filters             Toolbar filter state (DataViewFiltersContext)
 *  @param root0.lastSeenCustomRange Custom "Last seen" date range, when active
 *  @param root0.columns             Runtime table columns (visible flags applied)
 *  @param root0.sortBy              Active sort column key
 *  @param root0.direction           Active sort direction
 *  @returns                         ViewConfiguration for the export request
 */
export const buildExportConfiguration = <TItem extends SystemsViewItem>({
  filters,
  lastSeenCustomRange,
  columns,
  sortBy,
  direction,
}: {
  filters: SystemsViewFilterState;
  lastSeenCustomRange?: LastSeenCustomRange;
  columns: readonly Column<TItem>[];
  sortBy: string | undefined;
  direction: SortDirection | undefined;
}): ViewConfiguration => {
  const configFilters = buildViewConfigFilters(
    filters,
    lastSeenCustomRange ?? undefined,
  );
  const sort = normalizeSort(sortBy, direction);

  return {
    columns: normalizeColumns(columns),
    ...(sort && { sort }),
    ...(configFilters && { filters: configFilters }),
  };
};
