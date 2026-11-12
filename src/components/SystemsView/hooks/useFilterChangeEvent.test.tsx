import { renderHook } from '@testing-library/react';
import { expect, jest } from '@jest/globals';
import { useFilterChangeEvent } from './useFilterChangeEvent';
import type { LastSeenCustomRange, SystemsViewFilterState } from '../types';

const specs = [
  { filterId: 'hostname_or_id' },
  { filterId: 'status' },
  { filterId: 'last_seen' },
] as const;

describe('useFilterChangeEvent', () => {
  it('does not fire on initial mount or non-user filter updates', () => {
    const onFiltersChanged = jest.fn();
    const pendingUserFilterChangeRef = { current: false };

    const { rerender } = renderHook(
      ({ filters, debouncedFilters }) =>
        useFilterChangeEvent({
          filters,
          debouncedFilters,
          resolvedFilters: specs,
          lastSeenCustomRange: null,
          pendingUserFilterChangeRef,
          userFilterChangeVersion: 0,
          onFiltersChanged,
        }),
      {
        initialProps: {
          filters: {
            hostname_or_id: '',
            status: [],
            last_seen: '',
          } as SystemsViewFilterState,
          debouncedFilters: {
            hostname_or_id: '',
            status: [],
            last_seen: '',
          } as SystemsViewFilterState,
        },
      },
    );

    rerender({
      filters: { hostname_or_id: 'hydrated', status: ['stale'], last_seen: '' },
      debouncedFilters: {
        hostname_or_id: 'hydrated',
        status: ['stale'],
        last_seen: '',
      },
    });

    expect(onFiltersChanged).not.toHaveBeenCalled();
  });

  it('waits until debouncedFilters catches up with filters before firing once', () => {
    const onFiltersChanged = jest.fn();
    const pendingUserFilterChangeRef = { current: false };

    const { rerender } = renderHook(
      ({ filters, debouncedFilters, version }) =>
        useFilterChangeEvent({
          filters,
          debouncedFilters,
          resolvedFilters: specs,
          lastSeenCustomRange: null,
          pendingUserFilterChangeRef,
          userFilterChangeVersion: version,
          onFiltersChanged,
        }),
      {
        initialProps: {
          filters: {
            hostname_or_id: '',
            status: ['fresh'],
            last_seen: '',
          } as SystemsViewFilterState,
          debouncedFilters: {
            hostname_or_id: '',
            status: ['fresh'],
            last_seen: '',
          } as SystemsViewFilterState,
          version: 0,
        },
      },
    );

    // User types 'w' then 'web' while debouncedFilters is still ''
    pendingUserFilterChangeRef.current = true;
    rerender({
      filters: { hostname_or_id: 'w', status: ['fresh'], last_seen: '' },
      debouncedFilters: {
        hostname_or_id: '',
        status: ['fresh'],
        last_seen: '',
      },
      version: 1,
    });
    expect(onFiltersChanged).not.toHaveBeenCalled();

    rerender({
      filters: { hostname_or_id: 'web', status: ['fresh'], last_seen: '' },
      debouncedFilters: {
        hostname_or_id: '',
        status: ['fresh'],
        last_seen: '',
      },
      version: 2,
    });
    expect(onFiltersChanged).not.toHaveBeenCalled();

    // Debounce settles
    rerender({
      filters: { hostname_or_id: 'web', status: ['fresh'], last_seen: '' },
      debouncedFilters: {
        hostname_or_id: 'web',
        status: ['fresh'],
        last_seen: '',
      },
      version: 2,
    });

    expect(onFiltersChanged).toHaveBeenCalledTimes(1);
    expect(onFiltersChanged).toHaveBeenCalledWith(['hostname_or_id', 'status']);
    expect(pendingUserFilterChangeRef.current).toBe(false);
  });

  it('clears pending flag on no-op user updates without firing on subsequent non-user updates', () => {
    const onFiltersChanged = jest.fn();
    const pendingUserFilterChangeRef = { current: false };
    const initial: SystemsViewFilterState = {
      hostname_or_id: '',
      status: [],
      last_seen: '',
    };

    const { rerender } = renderHook(
      ({ filters, debouncedFilters, version }) =>
        useFilterChangeEvent({
          filters,
          debouncedFilters,
          resolvedFilters: specs,
          lastSeenCustomRange: null,
          pendingUserFilterChangeRef,
          userFilterChangeVersion: version,
          onFiltersChanged,
        }),
      {
        initialProps: {
          filters: initial,
          debouncedFilters: initial,
          version: 0,
        },
      },
    );

    // User triggers a no-op change (e.g. submitting empty text input)
    pendingUserFilterChangeRef.current = true;
    rerender({
      filters: { ...initial },
      debouncedFilters: { ...initial },
      version: 1,
    });

    expect(onFiltersChanged).not.toHaveBeenCalled();
    expect(pendingUserFilterChangeRef.current).toBe(false);

    // Later non-user hydration/normalization should not fire either
    rerender({
      filters: { ...initial, status: ['stale'] },
      debouncedFilters: { ...initial, status: ['stale'] },
      version: 1,
    });

    expect(onFiltersChanged).not.toHaveBeenCalled();
  });

  it('fires when custom last-seen date range changes while last_seen is custom', () => {
    const onFiltersChanged = jest.fn();
    const pendingUserFilterChangeRef = { current: false };
    const customFilters: SystemsViewFilterState = {
      hostname_or_id: '',
      status: [],
      last_seen: 'custom',
    };

    const { rerender } = renderHook(
      ({ range, version }) =>
        useFilterChangeEvent({
          filters: customFilters,
          debouncedFilters: customFilters,
          resolvedFilters: specs,
          lastSeenCustomRange: range,
          pendingUserFilterChangeRef,
          userFilterChangeVersion: version,
          onFiltersChanged,
        }),
      {
        initialProps: {
          range: null as LastSeenCustomRange,
          version: 0,
        },
      },
    );

    pendingUserFilterChangeRef.current = true;
    rerender({
      range: { start: '2026-01-01T00:00:00.000Z' },
      version: 1,
    });

    expect(onFiltersChanged).toHaveBeenCalledTimes(1);
    expect(onFiltersChanged).toHaveBeenCalledWith(['last_seen']);
  });
});
