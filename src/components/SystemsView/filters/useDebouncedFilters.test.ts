import { act, renderHook } from '@testing-library/react';
import { expect } from '@jest/globals';
import { useDebouncedFilters } from './useDebouncedFilters';

const HOSTNAME_SPEC = {
  filterId: 'hostname_or_id',
  debounceMs: 300,
};

const STATUS_SPEC = {
  filterId: 'status',
};

describe('useDebouncedFilters', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('uses the initial bag immediately and delays only debounceMs keys', () => {
    const { result, rerender } = renderHook(
      ({ filters }) =>
        useDebouncedFilters(filters, [HOSTNAME_SPEC, STATUS_SPEC]),
      {
        initialProps: {
          filters: { hostname_or_id: '', status: [] as string[] },
        },
      },
    );

    expect(result.current).toEqual({ hostname_or_id: '', status: [] });

    rerender({
      filters: { hostname_or_id: 'host', status: ['fresh'] },
    });

    expect(result.current).toEqual({ hostname_or_id: '', status: ['fresh'] });

    act(() => {
      jest.advanceTimersByTime(299);
    });
    expect(result.current.hostname_or_id).toBe('');

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(result.current).toEqual({
      hostname_or_id: 'host',
      status: ['fresh'],
    });
  });

  it('does not restart debounce when a non-debounced key changes', () => {
    const { result, rerender } = renderHook(
      ({ filters }) =>
        useDebouncedFilters(filters, [HOSTNAME_SPEC, STATUS_SPEC]),
      {
        initialProps: {
          filters: { hostname_or_id: '', status: [] as string[] },
        },
      },
    );

    rerender({
      filters: { hostname_or_id: 'h', status: [] },
    });

    act(() => {
      jest.advanceTimersByTime(200);
    });

    rerender({
      filters: { hostname_or_id: 'h', status: ['stale'] },
    });

    expect(result.current).toEqual({ hostname_or_id: '', status: ['stale'] });

    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(result.current).toEqual({ hostname_or_id: 'h', status: ['stale'] });
  });

  it('returns the bag unchanged when no spec sets debounceMs', () => {
    const filters = { hostname_or_id: 'now', status: ['fresh'] };
    const { result, rerender } = renderHook(
      ({ next }) => useDebouncedFilters(next, [STATUS_SPEC]),
      { initialProps: { next: filters } },
    );

    expect(result.current).toEqual(filters);

    const updated = { hostname_or_id: 'later', status: ['fresh'] };
    rerender({ next: updated });
    expect(result.current).toEqual(updated);
  });
});
