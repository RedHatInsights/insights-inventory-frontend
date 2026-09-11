import type { SystemsViewFilterState } from '../types';
import type { BoundFilter, FilterSelectContext } from './types';

/**
 * Reduces bound filters into backend filter params. Each filter writes through
 * `updateFilterParams`. The fold always starts from `{}`.
 *
 *  @param specs   Bound filters in toolbar order
 *  @param filters Debounced toolbar UI bag
 *  @param ctx     Extra state not stored on the URL
 *  @returns       Folded filter params
 */
export const buildFilterParams = <TFilterParams>(
  specs: readonly BoundFilter<TFilterParams>[],
  filters: SystemsViewFilterState,
  ctx: FilterSelectContext,
): TFilterParams =>
  specs.reduce(
    (params, filter) =>
      filter.updateFilterParams(
        params,
        filter.getValue
          ? filter.getValue(filters, ctx)
          : filters[filter.filterId],
      ),
    {} as TFilterParams,
  );
