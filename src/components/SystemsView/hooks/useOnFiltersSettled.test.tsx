import { renderHook } from '@testing-library/react';
import { expect, jest } from '@jest/globals';
import type { SystemsViewFilterState } from '../types';
import { useOnFiltersSettled } from './useOnFiltersSettled';

describe('useOnFiltersSettled', () => {
  it('emits the filters once filters are hydrated', () => {
    const onFiltersSettled = jest.fn();
    const filters = { name: 'web' };

    renderHook(() =>
      useOnFiltersSettled({
        onFiltersSettled,
        filters,
        filtersHydrated: true,
      }),
    );

    expect(onFiltersSettled).toHaveBeenCalledTimes(1);
    expect(onFiltersSettled).toHaveBeenCalledWith(filters);
  });

  it('waits to emit until filters have hydrated', () => {
    const onFiltersSettled = jest.fn();
    const filters = { name: 'web' };

    const { rerender } = renderHook(
      ({ filtersHydrated }) =>
        useOnFiltersSettled({
          onFiltersSettled,
          filters,
          filtersHydrated,
        }),
      { initialProps: { filtersHydrated: false } },
    );

    expect(onFiltersSettled).not.toHaveBeenCalled();

    rerender({ filtersHydrated: true });

    expect(onFiltersSettled).toHaveBeenCalledTimes(1);
    expect(onFiltersSettled).toHaveBeenCalledWith(filters);
  });

  it('gives the callback a copy, so writes do not change the table filters', () => {
    const hostnames = ['web-1'];
    const filters = { hostname_or_id: hostnames };
    let received: Readonly<SystemsViewFilterState> | undefined;

    renderHook(() =>
      useOnFiltersSettled({
        onFiltersSettled: (nextFilters) => {
          received = nextFilters;
        },
        filters,
        filtersHydrated: true,
      }),
    );

    const copy = received as SystemsViewFilterState;
    (copy.hostname_or_id as string[]).push('db-1');
    copy.name = 'mutated';

    expect(hostnames).toEqual(['web-1']);
    expect(filters).toEqual({ hostname_or_id: ['web-1'] });
    expect(copy).not.toBe(filters);
  });

  it('does not emit when a new filters object keeps the same values', () => {
    const onFiltersSettled = jest.fn();

    const { rerender } = renderHook(
      ({ filters }) =>
        useOnFiltersSettled({
          onFiltersSettled,
          filters,
          filtersHydrated: true,
        }),
      {
        initialProps: {
          filters: { name: 'web' },
        },
      },
    );

    rerender({
      filters: { name: 'web' },
    });

    expect(onFiltersSettled).toHaveBeenCalledTimes(1);
  });

  it('emits the current filters when debounced filters change', () => {
    const onFiltersSettled = jest.fn();

    const { rerender } = renderHook(
      ({ filters }) =>
        useOnFiltersSettled({
          onFiltersSettled,
          filters,
          filtersHydrated: true,
        }),
      {
        initialProps: {
          filters: { name: 'web' },
        },
      },
    );

    const nextFilters = { name: 'db' };
    rerender({
      filters: nextFilters,
    });

    expect(onFiltersSettled).toHaveBeenCalledTimes(2);
    expect(onFiltersSettled).toHaveBeenLastCalledWith(nextFilters);
  });
});
