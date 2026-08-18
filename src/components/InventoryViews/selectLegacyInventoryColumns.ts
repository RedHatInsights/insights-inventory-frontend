import type { ColumnSelector } from '../SystemsView/columns/resolveColumnSelector';

/** Default visible column keys for Inventory Views (not stored on catalog columns). */
export const COLS_SHOWN_BY_DEFAULT = [
  'display_name',
  'group_name',
  'tags',
  'operating_system',
  'last_check_in',
] as const;

const defaultShownKeys = new Set<string>(COLS_SHOWN_BY_DEFAULT);

export const selectLegacyInventoryColumns: ColumnSelector = (all) =>
  all.map((col) => {
    const showByDefault = defaultShownKeys.has(col.key);
    return {
      ...col,
      isShown: showByDefault,
      isShownByDefault: showByDefault,
    };
  });
