import type { ViewConfiguration } from '../../../api/inventoryViewsApi';
import type { Column } from '../../SystemsView/columns/types';
import type { SystemsViewItem } from '../../SystemsView/types';

/**
 * Converts visible columns to ViewConfiguration format.
 * Backend validates column keys server-side against its field registry.
 *
 * Permission-locked columns are intentionally KEPT here: permissions are
 * enforced per-viewer at render time (locked columns render as
 * "unauthorized" placeholders) and per-exporter at export time
 * (buildExportConfiguration strips them), so a saved view stays valid for
 * users whose permissions differ from the saver's.
 */
export const normalizeViewColumns = <TItem extends SystemsViewItem>(
  columns: readonly Column<TItem>[],
): ViewConfiguration['columns'] =>
  columns
    .filter((c) => c.isShown === true && typeof c.key === 'string')
    .map((c) => ({ key: c.key }));
