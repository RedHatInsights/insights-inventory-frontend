import { renderHook } from '@testing-library/react';
import { expect, jest } from '@jest/globals';
import type { Column } from '../columns/types';
import type { SystemsViewItem } from '../types';
import { useOnColumnsSettled } from './useOnColumnsSettled';

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
    expect(onColumnsSettled).toHaveBeenCalledWith(initial);
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
    expect(onColumnsSettled).toHaveBeenLastCalledWith(next);
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
