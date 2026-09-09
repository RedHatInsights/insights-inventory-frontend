import type { SystemsViewFilterState } from '../types';
import type { BoundFilter, FilterSelectContext } from './types';

/**
 * Reduces bound filters into a backend query params. Each filter writes through
 * `updateFilterParams`
 *
 *  @param specs     Bound filters in toolbar order
 *  @param filters   Debounced toolbar UI bag
 *  @param ctx       Extra state not stored on the URL
 *  @param baseQuery Starting query; bindings only add filter fields
 *  @returns         Folded backend query
 */
export const buildFilterParams = <TFilterParams>(
  specs: readonly BoundFilter<TFilterParams>[],
  filters: SystemsViewFilterState,
  ctx: FilterSelectContext,
  baseQuery: TFilterParams,
): TFilterParams =>
  specs.reduce(
    (params, filter) =>
      filter.updateFilterParams(
        params,
        filter.getValue?.(filters, ctx) ?? filters[filter.filterId],
      ),
    baseQuery,
  );
