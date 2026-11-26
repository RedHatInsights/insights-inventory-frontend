import { useEffect, useMemo, useRef } from 'react';
import type { SystemsViewFilterState } from '../types';

interface UseOnFiltersSettledParams {
  onFiltersSettled?: (filters: Readonly<SystemsViewFilterState>) => void;
  filters: SystemsViewFilterState;
  filtersHydrated: boolean;
}

/**
 * Calls `onFiltersSettled` once filters have hydrated on this mount, and again
 * when the debounced toolbar filters change. The callback receives a read-only
 * structured clone of those filters. Writes to the clone do not change the
 * filters the table queries with.
 *
 *  @param params.onFiltersSettled - Consumer callback. Identity changes do not notify.
 *  @param params.filters          - Debounced toolbar filters. They gate the call.
 *  @param params.filtersHydrated  - Gates the first call until defaults are written.
 */
export const useOnFiltersSettled = ({
  onFiltersSettled,
  filters,
  filtersHydrated,
}: UseOnFiltersSettledParams) => {
  const settledFiltersSignature = useMemo(
    () => JSON.stringify(filters),
    [filters],
  );
  const onFiltersSettledRef = useRef(onFiltersSettled);
  onFiltersSettledRef.current = onFiltersSettled;
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  useEffect(() => {
    if (!filtersHydrated) {
      return;
    }
    onFiltersSettledRef.current?.(structuredClone(filtersRef.current));
  }, [filtersHydrated, settledFiltersSignature]);
};
