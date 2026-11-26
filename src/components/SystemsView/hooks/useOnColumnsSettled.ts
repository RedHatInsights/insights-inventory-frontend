import { useEffect, useMemo, useRef } from 'react';
import type { Column } from '../columns/types';
import type { SystemsViewItem, SystemsViewStateSnapshot } from '../types';

interface UseOnColumnsSettledParams<TItem extends SystemsViewItem> {
  onColumnsSettled?: (columns: readonly Column<TItem>[]) => void;
  viewState: SystemsViewStateSnapshot<TItem>;
}

/**
 * Calls `onColumnsSettled` once on mount, and again when the column
 * configuration changes (order, membership, or visibility). The callback
 * receives the columns current at that moment.
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
  const columnsRef = useRef(viewState.columns);
  columnsRef.current = viewState.columns;

  useEffect(() => {
    onColumnsSettledRef.current?.(columnsRef.current);
  }, [settledColumnsSignature]);
};
