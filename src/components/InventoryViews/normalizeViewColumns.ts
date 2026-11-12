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

/**
 * Puts stored tag columns back into a save payload that was built while the
 * tag-column flag was off. They stay next to the same preceding column.
 */
export const preserveTagColumns = (
  columns: readonly SavedViewColumn[],
  savedColumns: readonly { key?: string; shown?: boolean }[] | undefined,
): SavedViewColumn[] => {
  const saved = savedColumns ?? [];
  const present = new Set(columns.map((column) => column.key));
  const tags = saved.filter(
    (column): column is { key: string; shown?: boolean } => {
      if (typeof column.key !== 'string' || !isTagColumnKey(column.key)) {
        return false;
      }
      if (present.has(column.key)) return false;
      present.add(column.key);
      return true;
    },
  );
  if (tags.length === 0) return [...columns];

  const result = [...columns];
  for (const tag of [...tags].reverse()) {
    const savedIndex = saved.findIndex((column) => column.key === tag.key);
    const predecessor = saved
      .slice(0, savedIndex)
      .reverse()
      .find(
        (column) =>
          typeof column.key === 'string' &&
          !isTagColumnKey(column.key) &&
          result.some((next) => next.key === column.key),
      );
    const insertAt = predecessor
      ? result.findIndex((next) => next.key === predecessor.key) + 1
      : 0;
    result.splice(
      insertAt,
      0,
      tag.shown === false ? { key: tag.key, shown: false } : { key: tag.key },
    );
  }

  return result;
};
