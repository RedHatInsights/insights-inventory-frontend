import { useEffect, useMemo, useState } from 'react';

type DebounceSpec = {
  filterId: string;
  debounceMs?: number;
};

const getDebouncedFiltersSignature = (
  filters: Record<string, unknown>,
  entries: readonly (readonly [string, number])[],
) =>
  entries
    .map(([filterId]) => {
      const value = filters[filterId];
      return `${filterId}:${JSON.stringify(value)}`;
    })
    .join('|');

/**
 * Delays values for `filters`.
 * Filter keys update immediately. Only those debounced values
 * restart the timer — changing a non-debounced key does not.
 *
 *  @param filters - Filters state
 *  @param specs   - Resolved filter specs
 *  @returns       Debounced Filter Query params
 */
export const useDebouncedFilters = <T extends Record<string, unknown>>(
  filters: T,
  specs: readonly DebounceSpec[],
): T => {
  const debouncedSpecsSignature = specs
    .map((spec) => `${spec.filterId}:${String(spec.debounceMs ?? '')}`)
    .join('|');

  const debouncedFilterIds = useMemo(
    () =>
      specs
        .filter(
          (spec): spec is DebounceSpec & { debounceMs: number } =>
            spec.debounceMs != null,
        )
        .map((spec) => [spec.filterId, spec.debounceMs] as const),
    // Depend on debouncedSpecsSignature instead of unstable specs identity
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [debouncedSpecsSignature],
  );

  const debouncedFiltersSignature = getDebouncedFiltersSignature(
    filters,
    debouncedFilterIds,
  );

  const debouncedFilters = useMemo(() => {
    const result: Record<string, unknown> = {};
    for (const [filterId] of debouncedFilterIds) {
      result[filterId] = filters[filterId];
    }
    return result;
    // Depend on debouncedFiltersSignature rather than all filters
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedFiltersSignature, debouncedFilterIds]);

  const [debounced, setDebounced] = useState(debouncedFilters);

  useEffect(() => {
    setDebounced((prev) => {
      const next: Record<string, unknown> = {};
      let changed = Object.keys(prev).length !== debouncedFilterIds.length;
      for (const [filterId] of debouncedFilterIds) {
        if (Object.prototype.hasOwnProperty.call(prev, filterId)) {
          next[filterId] = prev[filterId];
        } else {
          next[filterId] = debouncedFilters[filterId];
          changed = true;
        }
      }
      return changed ? next : prev;
    });

    const timeouts = debouncedFilterIds.map(([filterId, ms]) =>
      window.setTimeout(() => {
        setDebounced((prev) => {
          if (Object.is(prev[filterId], debouncedFilters[filterId])) {
            return prev;
          }
          return { ...prev, [filterId]: debouncedFilters[filterId] };
        });
      }, ms),
    );

    return () => {
      timeouts.forEach((timeoutId) => window.clearTimeout(timeoutId));
    };
  }, [debouncedFilters, debouncedFilterIds]);

  return useMemo(
    () => ({ ...filters, ...debounced }) as T,
    [filters, debounced],
  );
};
