import allColumnDefinitions, { type Column } from './allColumnDefinitions';

/**
 * Picks which columns a `SystemsView` instance displays in the table.
 * It receives full catalog of predefined column definitions `allColumnDefinitions`;
 * return a (possibly reordered or filtered) list of columns
 */
export type ColumnSelector = (
  allColumns: readonly Column[],
) => readonly Column[];

/**
 * Default when `SystemsView` omits the `columns` prop: expose no columns.
 *
 * Product views should pass an explicit selector (e.g. legacy inventory) that
 * returns the catalog subset they need.
 *
 *  @returns An empty list; no columns for the table.
 */
export const defaultColumnSelector: ColumnSelector = () => [];

export const resolveColumnSelector = (
  selector: ColumnSelector = defaultColumnSelector,
): readonly Column[] => selector(allColumnDefinitions);
