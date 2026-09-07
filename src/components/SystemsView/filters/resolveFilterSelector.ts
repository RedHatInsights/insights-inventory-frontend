import type { ApiHostGetHostListParams } from '@redhat-cloud-services/host-inventory-client/ApiHostGetHostList';
import { filterCatalog, type FilterCatalog } from './catalog';
import { bindInventoryHostListFilters } from './inventory/bindInventoryFilters';
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
 * Default when `SystemsView` omits a filter selector: the full inventory toolbar
 * bound to host-list `updateQuery`. Unlike columns, omitting filters does not
 * mean an empty list.
 *  @param catalog - Shared filter catalog of named factories
 *  @returns       Bound inventory host-list filters, in display order
 */
export const defaultFilterSelector: FilterSelector<ApiHostGetHostListParams> =
  bindInventoryHostListFilters;

/**
 * Resolves the toolbar to bound filters. When `selector` is omitted, uses the
 * full inventory catalog with host-list `updateQuery`.
 *
 *  @param selector - Optional selector; defaults to {@link defaultFilterSelector}
 *  @returns        Bound filters in toolbar order
 */
export const resolveFilterSelector = <TQuery = unknown>(
  selector: FilterSelector<TQuery> = defaultFilterSelector as unknown as FilterSelector<TQuery>,
): readonly BoundFilter<TQuery>[] => selector(filterCatalog);
