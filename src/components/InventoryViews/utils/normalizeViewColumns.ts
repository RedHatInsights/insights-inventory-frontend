import type { ViewConfiguration } from '../../../api/inventoryViewsApi';
import type { Column } from '../../SystemsView/columns/types';
import type { InventoryBindableItem } from '../../SystemsView/columns/inventory/columnDefinitions';

/**
 * Converts visible columns to ViewConfiguration format.
 * Backend validates column keys server-side against its field registry.
 *
 * Permission-locked columns render as "unauthorized" placeholders in the table;
 * they are excluded so saving a view (and later exporting by view_id) cannot
 * leak the data the table masks.
 */
export const normalizeViewColumns = (
  columns: readonly Column<InventoryBindableItem>[],
): ViewConfiguration['columns'] =>
  columns
    .filter(
      (c) =>
        c.isShown === true &&
        !c.isPermissionLocked &&
        typeof c.key === 'string',
    )
    .map((c) => ({ key: c.key }));
