import { columnCatalog, type ColumnCatalog } from './catalog';
import type { Column } from './types';

/**
 * Selects which columns a `SystemsView` instance displays.
 * Receives the shared column catalog of factories;
 *  @returns bound columns
 */
export type ColumnSelector<TItem = unknown> = (
  catalog: ColumnCatalog,
) => readonly Column<TItem>[];

/**
 * Default when `SystemsView` omits the `columns` prop: expose no columns.
 *  @returns An empty list; no columns for the table.
 */
export const defaultColumnSelector: ColumnSelector = () => [];

export const resolveColumnSelector = <TItem = unknown>(
  selector: ColumnSelector<TItem> = defaultColumnSelector,
): readonly Column<TItem>[] => selector(columnCatalog);
