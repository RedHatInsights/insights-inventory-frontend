import { renderHook } from '@testing-library/react';
import { expect, jest } from '@jest/globals';
import type { SystemsViewItem, SystemsViewStateSnapshot } from '../types';
import { useOnFiltersSettled } from './useOnFiltersSettled';

const snapshot = (
  overrides: Partial<SystemsViewStateSnapshot<SystemsViewItem>> = {},
): SystemsViewStateSnapshot<SystemsViewItem> => ({
  filters: { name: 'web' },
  lastSeenCustomRange: null,
  columns: [],
  page: 2,
  perPage: 50,
  sortBy: 'display_name',
  direction: 'asc',
  ...overrides,
});

describe('useOnFiltersSettled', () => {
  it('emits the full snapshot once filters are hydrated', () => {
    const onFiltersSettled = jest.fn();
    const viewState = snapshot();

    renderHook(() =>
      useOnFiltersSettled({
        onFiltersSettled,
        viewState,
        filtersHydrated: true,
      }),
    );

    expect(onFiltersSettled).toHaveBeenCalledTimes(1);
    expect(onFiltersSettled).toHaveBeenCalledWith(viewState);
  });

  it('waits to emit until filters have hydrated', () => {
    const onFiltersSettled = jest.fn();
    const viewState = snapshot({ page: 1 });

    const { rerender } = renderHook(
      ({ filtersHydrated }) =>
        useOnFiltersSettled({
          onFiltersSettled,
          viewState,
          filtersHydrated,
        }),
      { initialProps: { filtersHydrated: false } },
    );

    expect(onFiltersSettled).not.toHaveBeenCalled();

    rerender({ filtersHydrated: true });

    expect(onFiltersSettled).toHaveBeenCalledTimes(1);
    expect(onFiltersSettled).toHaveBeenCalledWith(viewState);
  });

  it('does not emit when only sort or page change', () => {
    const onFiltersSettled = jest.fn();

    const { rerender } = renderHook(
      ({ viewState }) =>
        useOnFiltersSettled({
          onFiltersSettled,
          viewState,
          filtersHydrated: true,
        }),
      { initialProps: { viewState: snapshot() } },
    );

    rerender({
      viewState: snapshot({ page: 4, sortBy: 'status' }),
    });

    expect(onFiltersSettled).toHaveBeenCalledTimes(1);
  });

  it('emits the current snapshot when debounced filters change', () => {
    const onFiltersSettled = jest.fn();

    const { rerender } = renderHook(
      ({ viewState }) =>
        useOnFiltersSettled({
          onFiltersSettled,
          viewState,
          filtersHydrated: true,
        }),
      { initialProps: { viewState: snapshot() } },
    );

    const next = snapshot({
      filters: { name: 'db' },
      page: 1,
    });
    rerender({ viewState: next });

    expect(onFiltersSettled).toHaveBeenCalledTimes(2);
    expect(onFiltersSettled).toHaveBeenLastCalledWith(next);
  });
});
