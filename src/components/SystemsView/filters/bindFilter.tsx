import React from 'react';
import type { BoundFilter, FilterBinding, FilterSpec } from './types';

/**
 * Merges a shared filter spec with a per-app `updateFilterParams` binding. The only place
 * `TValue` is asserted when wrapping `updateFilterParams` for a mixed-filter toolbar.
 * Exposed to selectors as `catalog.custom`.
 *  @param spec    Shared filter identity and toolbar renderer.
 *  @param binding Consumer query reducer and optional filter props.
 *  @returns       Runtime filter with `TValue` erased and `TFilterParams` preserved.
 */
export const bindFilter = <
  TFilterParams,
  TValue,
  TFilterProps extends object = Record<string, never>,
>(
  spec: FilterSpec,
  binding: FilterBinding<TFilterParams, TValue, TFilterProps>,
): BoundFilter<TFilterParams> => {
  const updateFilterParams = (params: TFilterParams, value: unknown) =>
    binding.updateFilterParams(params, value as TValue);

  if (spec.type !== 'custom' || binding.filterProps === undefined) {
    return { ...spec, updateFilterParams };
  }

  return {
    ...spec,
    filterComponent: (props: Record<string, unknown>) => (
      <spec.filterComponent {...binding.filterProps} {...props} />
    ),
    updateFilterParams,
  };
};
