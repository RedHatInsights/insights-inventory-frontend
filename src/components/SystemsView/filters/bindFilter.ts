import type { BoundFilter, FilterBinding, FilterSpec } from './types';

/**
 * Merges a shared filter spec with a per-app `updateQuery` binding. The only place
 * `TValue` is asserted when wrapping `updateQuery` for a mixed-filter toolbar.
 * Exposed to selectors as `catalog.custom`.
 *  @param spec    Shared filter identity and toolbar renderer.
 *  @param binding Consumer query reducer (`updateQuery`).
 *  @returns       Runtime filter with `TValue` erased and `TQuery` preserved.
 */
export const bindFilter = <TQuery, TValue>(
  spec: FilterSpec,
  binding: FilterBinding<TQuery, TValue>,
): BoundFilter<TQuery> => ({
  ...spec,
  updateQuery: (query, value) => binding.updateQuery(query, value as TValue),
});
