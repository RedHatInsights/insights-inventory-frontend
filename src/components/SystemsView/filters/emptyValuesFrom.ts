import type { FilterSpec } from './types';

export type EmptyFilters = Record<string, FilterSpec['emptyValue']>;

/**
 * Builds the empty UI bag for a resolved spec list.
 * Keys are `filterId`; values are each spec's `emptyValue`.
 *
 *  @param specs - Resolved filter specs
 *  @returns     Empty filter values keyed by `filterId`, in spec order
 */
export const emptyValuesFrom = (
  specs: readonly Pick<FilterSpec, 'filterId' | 'emptyValue'>[],
): EmptyFilters =>
  Object.fromEntries(specs.map((spec) => [spec.filterId, spec.emptyValue]));
