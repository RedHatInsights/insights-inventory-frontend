import type { BoundFilter, FilterBinding, FilterSpec } from './types';

/**
 * Merges a shared filter spec with a per-app `updateFilterParams` binding. The only place
 * `TValue` is asserted when wrapping `updateFilterParams` for a mixed-filter toolbar.
 * Exposed to selectors as `catalog.custom`.
 *  @param spec    Shared filter identity and toolbar renderer.
 *  @param binding Consumer query reducer (`updateFilterParams`).
 *  @returns       Runtime filter with `TValue` erased and `TFilterParams` preserved.
 */
export const bindFilter = <TFilterParams, TValue>(
  spec: FilterSpec,
  binding: FilterBinding<TFilterParams, TValue>,
): BoundFilter<TFilterParams> => ({
  ...spec,
  updateFilterParams: (params, value) =>
    binding.updateFilterParams(params, value as TValue),
});
