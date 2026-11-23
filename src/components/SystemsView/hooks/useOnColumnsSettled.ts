import { useEffect, useMemo, useRef } from 'react';
import type { SystemsViewItem, SystemsViewStateSnapshot } from '../types';

interface UseOnColumnsSettledParams<TItem extends SystemsViewItem> {
  onColumnsSettled?: (state: SystemsViewStateSnapshot<TItem>) => void;
  viewState: SystemsViewStateSnapshot<TItem>;
}

/**
 * Calls `onColumnsSettled` once on mount, and again when the column
 * configuration changes (order, membership, or visibility). The callback
 * receives the full table snapshot current at that moment.
 *
 * Permission annotation does not count as a new configuration: it rewrites
 * cell renderers without changing which columns are shown.
 *
 *  @param params.onColumnsSettled - Consumer callback. Identity changes do not notify.
 *  @param params.viewState        - Live table snapshot. Only its columns gate the call.
 */
export const useOnColumnsSettled = <TItem extends SystemsViewItem>({
  onColumnsSettled,
  viewState,
}: UseOnColumnsSettledParams<TItem>) => {
  const settledColumnsSignature = useMemo(
    () =>
      JSON.stringify(
        viewState.columns.map((column) => ({
          key: column.key,
          isShown: column.isShown,
        })),
      ),
    [viewState.columns],
  );
  const onColumnsSettledRef = useRef(onColumnsSettled);
  onColumnsSettledRef.current = onColumnsSettled;
  const viewStateRef = useRef(viewState);
  viewStateRef.current = viewState;

  useEffect(() => {
    onColumnsSettledRef.current?.(viewStateRef.current);
  }, [settledColumnsSignature]);
};
