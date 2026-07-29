import allColumnDefinitions, { type Column } from './allColumnDefinitions';

/**
 * Picks which columns a `SystemsView` instance exposes to column
 * management and the table. It receives full catalog of predefined column definitions
 * `allColumnDefinitions`; return a (possibly reordered or filtered) list of columns
 *
 * The table only renders columns where `isShownByDefault` is true. map over `allColumns` and set this property
 * to true for columns you want to visible on load—see
 * `legacyInventoryColumnsSelector` in `InventoryViews/legacyInventoryColumnsSelector.ts`.
 */
export type ColumnSelector = (
  allColumns: readonly Column[],
) => readonly Column[];

/**
 * Default when `SystemsView` omits the `columns` prop: pass the entire catalog
 * into column management without changing visibility.
 *
 * Every catalog column remains available in the manage-columns UI, but none
 * appear in the table until the user toggles them or a custom selector sets
 * `isShownByDefault` (e.g. `{ ...col, isShownByDefault: true }`
 * for selected keys). Product views should pass an explicit selector instead of
 * relying on this default.
 *
 *  @param all - Full column catalog from `allColumnDefinitions`.
 *  @returns   The same columns; visibility flags unchanged (all hidden by default).
 */
export const defaultColumnSelector: ColumnSelector = (all) => all;

export const resolveColumnSelector = (
  selector: ColumnSelector = defaultColumnSelector,
): readonly Column[] => selector(allColumnDefinitions);
