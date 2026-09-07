import type { SystemsViewFilterState } from '../types';
import type { BoundFilter, FilterSelectContext } from './types';

/**
 * Reduces bound filters into a backend query params. Each filter writes through
 * `updateQuery`
 *
 *  @param specs     Bound filters in toolbar order
 *  @param filters   Debounced toolbar UI bag
 *  @param ctx       Extra state not stored on the URL
 *  @param baseQuery Starting query; bindings only add filter fields
 *  @returns         Folded backend query
 */
export const buildFilterParams = <TQuery>(
  specs: readonly BoundFilter<TQuery>[],
  filters: SystemsViewFilterState,
  ctx: FilterSelectContext,
  baseQuery: TQuery,
): TQuery =>
  specs.reduce(
    (query, filter) =>
      filter.updateQuery(
        query,
        filter.getValue?.(filters, ctx) ?? filters[filter.filterId],
      ),
    baseQuery,
  );
