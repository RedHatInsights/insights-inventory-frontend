import { useEffect, useMemo, useRef } from 'react';
import type { SystemsViewItem, SystemsViewStateSnapshot } from '../types';

interface UseOnFiltersSettledParams<TItem extends SystemsViewItem> {
  onFiltersSettled?: (state: SystemsViewStateSnapshot<TItem>) => void;
  viewState: SystemsViewStateSnapshot<TItem>;
  filtersHydrated: boolean;
}

/**
 * Calls `onFiltersSettled` once filters have hydrated on this mount, and again
 * when the debounced toolbar filters change. The callback receives the full
 * table snapshot current at that moment.
 *
 *  @param params.onFiltersSettled - Consumer callback. Identity changes do not notify.
 *  @param params.viewState        - Live table snapshot. Only its filters gate the call.
 *  @param params.filtersHydrated  - Gates the first call until defaults are written.
 */
export const useOnFiltersSettled = <TItem extends SystemsViewItem>({
  onFiltersSettled,
  viewState,
  filtersHydrated,
}: UseOnFiltersSettledParams<TItem>) => {
  const settledFiltersSignature = useMemo(
    () =>
      JSON.stringify({
        filters: viewState.filters,
        lastSeenCustomRange: viewState.lastSeenCustomRange,
      }),
    [viewState.filters, viewState.lastSeenCustomRange],
  );
  const onFiltersSettledRef = useRef(onFiltersSettled);
  onFiltersSettledRef.current = onFiltersSettled;
  const viewStateRef = useRef(viewState);
  viewStateRef.current = viewState;

  useEffect(() => {
    if (!filtersHydrated) {
      return;
    }
    onFiltersSettledRef.current?.(viewStateRef.current);
  }, [filtersHydrated, settledFiltersSignature]);
};
