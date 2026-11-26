import { useEffect, useMemo, useRef } from 'react';
import type { Column } from '../columns/types';
import type { SystemsViewItem } from '../types';

interface UseOnColumnsSettledParams<TItem extends SystemsViewItem> {
  onColumnsSettled?: (columns: readonly Column<TItem>[]) => void;
  columns: readonly Column<TItem>[];
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
 *  @param params.columns          - Live columns. Only their order, membership, and visibility gate the call.
 */
export const useOnColumnsSettled = <TItem extends SystemsViewItem>({
  onColumnsSettled,
  columns,
}: UseOnColumnsSettledParams<TItem>) => {
  const settledColumnsSignature = useMemo(
    () =>
      JSON.stringify(
        columns.map((column) => ({
          key: column.key,
          isShown: column.isShown,
        })),
      ),
    [columns],
  );
  const onColumnsSettledRef = useRef(onColumnsSettled);
  onColumnsSettledRef.current = onColumnsSettled;
  const columnsRef = useRef(columns);
  columnsRef.current = columns;

  useEffect(() => {
    onColumnsSettledRef.current?.(columnsRef.current);
  }, [settledColumnsSignature]);
};
