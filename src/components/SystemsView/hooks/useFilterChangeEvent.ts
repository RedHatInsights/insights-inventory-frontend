import { type MutableRefObject, useEffect, useMemo, useRef } from 'react';
import {
  getActiveFilterIds,
  isEmptyFilterValue,
} from '../filters/defaultValuesFrom';
import type { FilterSpec } from '../filters/types';
import type { LastSeenCustomRange, SystemsViewFilterState } from '../types';

interface UseFilterChangeEventParams {
  filters: SystemsViewFilterState;
  debouncedFilters: SystemsViewFilterState;
  resolvedFilters: readonly Pick<FilterSpec, 'filterId'>[];
  lastSeenCustomRange: LastSeenCustomRange;
  pendingUserFilterChangeRef: MutableRefObject<boolean>;
  userFilterChangeVersion: number;
  onFiltersChanged?: (filterIds: string[]) => void;
}

/**
 * Emits `onFiltersChanged` with all currently active `filterId`s once
 * user-initiated filter edits settle (after debounced filters catch up).
 * Ignores initial mount, default hydration, URL normalization, and `clearAllFilters`.
 */
export const useFilterChangeEvent = ({
  filters,
  debouncedFilters,
  resolvedFilters,
  lastSeenCustomRange,
  pendingUserFilterChangeRef,
  userFilterChangeVersion,
  onFiltersChanged,
}: UseFilterChangeEventParams) => {
  const onFiltersChangedRef = useRef(onFiltersChanged);
  onFiltersChangedRef.current = onFiltersChanged;

  const isFiltersSettled = useMemo(
    () =>
      resolvedFilters.every(
        (spec) =>
          JSON.stringify(filters[spec.filterId]) ===
          JSON.stringify(debouncedFilters[spec.filterId]),
      ),
    [filters, debouncedFilters, resolvedFilters],
  );

  const settledSignature = useMemo(
    () =>
      JSON.stringify({
        filters: resolvedFilters.map((spec) => {
          const value = debouncedFilters[spec.filterId];
          return [spec.filterId, isEmptyFilterValue(value) ? null : value];
        }),
        lastSeenCustomRange:
          debouncedFilters.last_seen === 'custom' ? lastSeenCustomRange : null,
      }),
    [resolvedFilters, debouncedFilters, lastSeenCustomRange],
  );

  const lastEmittedSignatureRef = useRef(settledSignature);

  useEffect(() => {
    if (!pendingUserFilterChangeRef.current) {
      lastEmittedSignatureRef.current = settledSignature;
      return;
    }

    if (!isFiltersSettled) {
      return;
    }

    pendingUserFilterChangeRef.current = false;
    if (settledSignature !== lastEmittedSignatureRef.current) {
      lastEmittedSignatureRef.current = settledSignature;
      onFiltersChangedRef.current?.(
        getActiveFilterIds(debouncedFilters, resolvedFilters),
      );
    }
  }, [
    settledSignature,
    isFiltersSettled,
    debouncedFilters,
    resolvedFilters,
    pendingUserFilterChangeRef,
    userFilterChangeVersion,
  ]);
};
