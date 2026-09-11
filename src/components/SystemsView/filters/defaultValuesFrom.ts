import type { FilterSpec } from './types';

export type DefaultFilters = Record<string, FilterSpec['defaultValue']>;

type DefaultValueSpec = Pick<FilterSpec, 'filterId' | 'defaultValue'>;

/**
 * PatternFly text/checkbox filters write `''` / `[]` for chip-X and clear.
 *  @param value - Candidate toolbar value
 *  @returns     True when the value is PF's empty reset
 */
export const isEmptyFilterValue = (value: unknown): boolean =>
  value == null || value === '' || (Array.isArray(value) && value.length === 0);

const toSortedStrings = (value: unknown[]): string[] =>
  value.map(String).sort();

/**
 * Compares a live toolbar value to a spec `defaultValue`. Empty PF resets
 * (`''`, `[]`, nullish) match each other; checkbox arrays ignore order.
 *
 *  @param current      - Live toolbar value
 *  @param defaultValue - Spec `defaultValue` to compare against
 *  @returns            True when the values represent the same filter state
 */
export const filterValuesEqual = (
  current: unknown,
  defaultValue: unknown,
): boolean => {
  if (isEmptyFilterValue(current) && isEmptyFilterValue(defaultValue)) {
    return true;
  }
  if (Array.isArray(current) && Array.isArray(defaultValue)) {
    if (current.length !== defaultValue.length) {
      return false;
    }
    const currentSorted = toSortedStrings(current);
    const defaultSorted = toSortedStrings(defaultValue);
    return currentSorted.every(
      (value, index) => value === defaultSorted[index],
    );
  }
  return current === defaultValue;
};

/**
 * True when any resolved spec's live value differs from its `defaultValue`.
 * Extra keys on `filters` that are not in `specs` are ignored.
 *
 *  @param filters - Live toolbar bag keyed by `filterId`
 *  @param specs   - Resolved filter specs whose `defaultValue`s are the baseline
 *  @returns       True when at least one spec's live value differs from default
 */
export const filtersDifferFromDefaults = (
  filters: Record<string, unknown>,
  specs: readonly DefaultValueSpec[],
): boolean =>
  specs.some(
    (spec) => !filterValuesEqual(filters[spec.filterId], spec.defaultValue),
  );

/**
 * True when any resolved spec currently has a non-empty toolbar value (a chip).
 *
 *  @param filters - Live toolbar bag keyed by `filterId`
 *  @param specs   - Resolved filter specs to inspect
 *  @returns       True when at least one spec would render a chip
 */
export const hasActiveFilterChips = (
  filters: Record<string, unknown>,
  specs: readonly DefaultValueSpec[],
): boolean => specs.some((spec) => !isEmptyFilterValue(filters[spec.filterId]));

/**
 * Builds default values spec list.
 * Keys are `filterId`; values are each spec's `defaultValue`.
 *
 *  @param specs - Resolved filter specs
 *  @returns     Default filter values keyed by `filterId`, in spec order
 */
export const defaultValuesFrom = (
  specs: readonly DefaultValueSpec[],
): DefaultFilters =>
  Object.fromEntries(specs.map((spec) => [spec.filterId, spec.defaultValue]));
