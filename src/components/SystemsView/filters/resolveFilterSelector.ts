import { filterCatalog, type FilterCatalog } from './catalog';
import type { BoundFilter } from './types';

/**
 * Selects which filters a `SystemsView` instance displays.
 * Receives the shared filter catalog of factories;
 *  @returns bound filters
 */
export type FilterSelector<TQuery = unknown> = (
  catalog: FilterCatalog,
) => readonly BoundFilter<TQuery>[];

/**
 * Default when `SystemsView` omits the `filters` prop: expose no filters.
 *  @returns An empty list; no filters for the toolbar.
 */
export const defaultFilterSelector = <
  TQuery = unknown,
>(): readonly BoundFilter<TQuery>[] => [];

export const resolveFilterSelector = <TQuery = unknown>(
  selector: FilterSelector<TQuery> = defaultFilterSelector,
): readonly BoundFilter<TQuery>[] => selector(filterCatalog);
