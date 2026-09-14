import { filterCatalog, type FilterCatalog } from './catalog';
import type { BoundFilter } from './types';

/**
 * Selects which filters a `SystemsView` instance displays.
 * Receives the shared filter catalog of factories;
 *  @returns bound filters
 */
export type FilterSelector<TFilterParams = unknown> = (
  catalog: FilterCatalog,
) => readonly BoundFilter<TFilterParams>[];

/**
 * Default when `SystemsView` omits the `filters` prop: expose no filters.
 *  @returns An empty list; no filters for the toolbar.
 */
export const defaultFilterSelector = <
  TFilterParams = unknown,
>(): readonly BoundFilter<TFilterParams>[] => [];

export const resolveFilterSelector = <TFilterParams = unknown>(
  selector: FilterSelector<TFilterParams> = defaultFilterSelector,
): readonly BoundFilter<TFilterParams>[] => selector(filterCatalog);
