import type { ViewColumnConfig } from '@redhat-cloud-services/host-inventory-client/types';
import type { Column } from '../SystemsView/columns/types';
import type { InventoryBindableItem } from '../SystemsView/columns/inventory/columnDefinitions';
import { isTagColumnKey } from './tagKeys';

/** View column as stored. `shown` is omitted when the column is visible. */
export type SavedViewColumn = ViewColumnConfig & {
  shown?: boolean;
};

/**
 * Converts the table's column state into a saved view.
 * Service columns are stored only when shown. A tag column the user added and
 * then unchecked is stored with `shown: false`, so hiding it is different from
 * removing it.
 */
export const normalizeViewColumns = (
  columns: readonly Column<InventoryBindableItem>[],
): SavedViewColumn[] =>
  columns.flatMap((column) => {
    if (typeof column.key !== 'string') return [];
    if (column.isShown === true) return [{ key: column.key }];
    if (isTagColumnKey(column.key)) return [{ key: column.key, shown: false }];
    return [];
  });
