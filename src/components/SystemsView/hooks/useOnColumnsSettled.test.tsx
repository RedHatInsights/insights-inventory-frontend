import { renderHook } from '@testing-library/react';
import { expect, jest } from '@jest/globals';
import type { Column } from '../columns/types';
import type { SystemsViewItem, SystemsViewStateSnapshot } from '../types';
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

const snapshot = (
  overrides: Partial<SystemsViewStateSnapshot<SystemsViewItem>> = {},
): SystemsViewStateSnapshot<SystemsViewItem> => ({
  filters: { name: 'web' },
  lastSeenCustomRange: null,
  columns: [column('display_name', true), column('operating_system', false)],
  page: 2,
  perPage: 50,
  sortBy: 'display_name',
  direction: 'asc',
  ...overrides,
});

describe('useOnColumnsSettled', () => {
  it('emits the columns on mount', () => {
    const onColumnsSettled = jest.fn();
    const viewState = snapshot();

    renderHook(() =>
      useOnColumnsSettled({
        onColumnsSettled,
        viewState,
      }),
    );

    expect(onColumnsSettled).toHaveBeenCalledTimes(1);
    expect(onColumnsSettled).toHaveBeenCalledWith(viewState.columns);
  });

  it('does not emit when only filters, sort, or page change', () => {
    const onColumnsSettled = jest.fn();

    const { rerender } = renderHook(
      ({ viewState }) =>
        useOnColumnsSettled({
          onColumnsSettled,
          viewState,
        }),
      { initialProps: { viewState: snapshot() } },
    );

    rerender({
      viewState: snapshot({
        filters: { name: 'db' },
        page: 4,
        sortBy: 'status',
      }),
    });

    expect(onColumnsSettled).toHaveBeenCalledTimes(1);
  });

  it('does not emit when columns are re-annotated without a configuration change', () => {
    const onColumnsSettled = jest.fn();
    const initial = snapshot();

    const { rerender } = renderHook(
      ({ viewState }) =>
        useOnColumnsSettled({
          onColumnsSettled,
          viewState,
        }),
      { initialProps: { viewState: initial } },
    );

    rerender({
      viewState: snapshot({
        columns: initial.columns.map((col) => ({
          ...col,
          isPermissionLocked: true,
          renderCell: () => null,
        })),
      }),
    });

    expect(onColumnsSettled).toHaveBeenCalledTimes(1);
  });

  it('emits the current columns when column visibility or order changes', () => {
    const onColumnsSettled = jest.fn();

    const { rerender } = renderHook(
      ({ viewState }) =>
        useOnColumnsSettled({
          onColumnsSettled,
          viewState,
        }),
      { initialProps: { viewState: snapshot() } },
    );

    const next = snapshot({
      columns: [column('operating_system', true), column('display_name', true)],
      page: 1,
    });
    rerender({ viewState: next });

    expect(onColumnsSettled).toHaveBeenCalledTimes(2);
    expect(onColumnsSettled).toHaveBeenLastCalledWith(next.columns);
  });

  it('does not emit again when only the callback identity changes', () => {
    const first = jest.fn();
    const second = jest.fn();
    const viewState = snapshot();

    const { rerender } = renderHook(
      ({ onColumnsSettled }) =>
        useOnColumnsSettled({
          onColumnsSettled,
          viewState,
        }),
      { initialProps: { onColumnsSettled: first } },
    );

    rerender({ onColumnsSettled: second });

    expect(first).toHaveBeenCalledTimes(1);
    expect(second).not.toHaveBeenCalled();
  });
});
