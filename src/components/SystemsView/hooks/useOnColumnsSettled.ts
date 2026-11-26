import { useEffect, useMemo, useRef } from 'react';
import type { Column } from '../columns/types';
import type { SettledColumn, SystemsViewItem } from '../types';

const toSettledColumns = <TItem>(
  columns: readonly Column<TItem>[],
): SettledColumn[] =>
  columns.map(({ getValue, renderCell, ...column }) => column);

interface UseOnColumnsSettledParams<TItem extends SystemsViewItem> {
  onColumnsSettled?: (columns: readonly SettledColumn[]) => void;
  columns: readonly Column<TItem>[];
}

/**
 * Calls `onColumnsSettled` once on mount, and again when the column
 * configuration changes (order, membership, or visibility). The callback
 * receives a copy of the column data with render functions removed.
 * Writes to that copy do not change the columns the table renders.
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
    () => JSON.stringify(columns.map(({ key, isShown }) => ({ key, isShown }))),
    [columns],
  );
  const onColumnsSettledRef = useRef(onColumnsSettled);
  onColumnsSettledRef.current = onColumnsSettled;
  const columnsRef = useRef(columns);
  columnsRef.current = columns;

  useEffect(() => {
    onColumnsSettledRef.current?.(toSettledColumns(columnsRef.current));
  }, [settledColumnsSignature]);
};
