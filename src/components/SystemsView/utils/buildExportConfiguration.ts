import type { ViewConfiguration } from '../../../api/inventoryViewsApi';
import { buildViewConfigFilters } from '../../InventoryViews/utils/viewConfigFilters';
import type { Column } from '../columns/types';
import type {
  LastSeenCustomRange,
  SortDirection,
  SystemsViewFilterState,
  SystemsViewItem,
} from '../types';

const normalizeColumns = <TItem extends SystemsViewItem>(
  columns: readonly Column<TItem>[],
): ViewConfiguration['columns'] =>
  columns
    .filter(
      (c) =>
        c.isShown === true &&
        // Permission-locked columns render as "unauthorized" placeholders in the
        // table and must not leak their data through the export.
        !c.isPermissionLocked &&
        typeof c.key === 'string',
    )
    .map((c) => ({ key: c.key }));

const normalizeSort = (
  sortBy: string | undefined,
  direction: SortDirection | undefined,
): ViewConfiguration['sort'] | undefined => {
  if (!sortBy || (direction !== 'asc' && direction !== 'desc'))
    return undefined;
  return { key: sortBy, direction };
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
