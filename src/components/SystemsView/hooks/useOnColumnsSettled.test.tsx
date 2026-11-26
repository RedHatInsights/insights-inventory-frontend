import { renderHook } from '@testing-library/react';
import { expect, jest } from '@jest/globals';
import type { Column } from '../columns/types';
import type { SettledColumn, SystemsViewItem } from '../types';
import { useOnColumnsSettled } from './useOnColumnsSettled';

const settled = (cols: readonly Column<SystemsViewItem>[]): SettledColumn[] =>
  cols.map(({ getValue, renderCell, ...column }) => column);

const column = (key: string, isShown: boolean): Column<SystemsViewItem> =>
  ({
    key,
    isShown,
    title: key,
    appName: 'inventory',
    getValue: () => undefined,
    renderCell: () => null,
  }) as unknown as Column<SystemsViewItem>;

const columns = () => [
  column('display_name', true),
  column('operating_system', false),
];

describe('useOnColumnsSettled', () => {
  it('emits the columns on mount', () => {
    const onColumnsSettled = jest.fn();
    const initial = columns();

    renderHook(() =>
      useOnColumnsSettled({
        onColumnsSettled,
        columns: initial,
      }),
    );

    expect(onColumnsSettled).toHaveBeenCalledTimes(1);
    expect(onColumnsSettled).toHaveBeenCalledWith(settled(initial));
    const emitted = onColumnsSettled.mock.calls[0][0] as SettledColumn[];
    expect(emitted[0]).not.toHaveProperty('getValue');
    expect(emitted[0]).not.toHaveProperty('renderCell');
  });

  it('gives the callback a copy, so writes do not change the live columns', () => {
    const initial = columns();
    let received: readonly SettledColumn[] | undefined;

    renderHook(() =>
      useOnColumnsSettled({
        onColumnsSettled: (nextColumns) => {
          received = nextColumns;
        },
        columns: initial,
      }),
    );

    const copy = received as SettledColumn[];
    copy[0].isShown = false;
    copy.push(settled([column('groups', true)])[0]);

    expect(initial[0].isShown).toBe(true);
    expect(initial).toHaveLength(2);
    expect(copy[0]).not.toBe(initial[0]);
    expect(copy).not.toBe(initial);
  });

  it('does not emit when a new array keeps the same order and visibility', () => {
    const onColumnsSettled = jest.fn();

    const { rerender } = renderHook(
      ({ columns: nextColumns }) =>
        useOnColumnsSettled({
          onColumnsSettled,
          columns: nextColumns,
        }),
      { initialProps: { columns: columns() } },
    );

    rerender({ columns: columns() });

    expect(onColumnsSettled).toHaveBeenCalledTimes(1);
  });

  it('does not emit when columns are re-annotated without a configuration change', () => {
    const onColumnsSettled = jest.fn();
    const initial = columns();

    const { rerender } = renderHook(
      ({ columns: nextColumns }) =>
        useOnColumnsSettled({
          onColumnsSettled,
          columns: nextColumns,
        }),
      { initialProps: { columns: initial } },
    );

    rerender({
      columns: initial.map((col) => ({
        ...col,
        isPermissionLocked: true,
        renderCell: () => null,
      })),
    });

    expect(onColumnsSettled).toHaveBeenCalledTimes(1);
  });

  it('emits the current columns when column visibility or order changes', () => {
    const onColumnsSettled = jest.fn();

    const { rerender } = renderHook(
      ({ columns: nextColumns }) =>
        useOnColumnsSettled({
          onColumnsSettled,
          columns: nextColumns,
        }),
      { initialProps: { columns: columns() } },
    );

    const next = [
      column('operating_system', true),
      column('display_name', true),
    ];
    rerender({ columns: next });

    expect(onColumnsSettled).toHaveBeenCalledTimes(2);
    expect(onColumnsSettled).toHaveBeenLastCalledWith(settled(next));

    const visibilityOnly = [
      column('operating_system', true),
      column('display_name', false),
    ];
    rerender({ columns: visibilityOnly });

    expect(onColumnsSettled).toHaveBeenCalledTimes(3);
    expect(onColumnsSettled).toHaveBeenLastCalledWith(settled(visibilityOnly));
  });

  it('does not emit again when only the callback identity changes', () => {
    const first = jest.fn();
    const second = jest.fn();
    const initial = columns();

    const { rerender } = renderHook(
      ({ onColumnsSettled }) =>
        useOnColumnsSettled({
          onColumnsSettled,
          columns: initial,
        }),
      { initialProps: { onColumnsSettled: first } },
    );

    rerender({ onColumnsSettled: second });

    expect(first).toHaveBeenCalledTimes(1);
    expect(second).not.toHaveBeenCalled();
  });
});
