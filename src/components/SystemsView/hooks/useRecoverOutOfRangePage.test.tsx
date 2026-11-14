import { renderHook } from '@testing-library/react';
import { expect, jest } from '@jest/globals';
import {
  shouldRetrySystemsViewQuery,
  useRecoverOutOfRangePage,
} from './useRecoverOutOfRangePage';

describe('useRecoverOutOfRangePage', () => {
  it('steps back one page when the current page is past the end', () => {
    const setSearchParams = jest.fn();

    renderHook(() =>
      useRecoverOutOfRangePage(
        3,
        { response: { status: 404 } },
        setSearchParams,
      ),
    );

    expect(setSearchParams).toHaveBeenCalledTimes(1);
    const [updater, options] = setSearchParams.mock.calls[0];
    expect(options).toEqual({ replace: true });

    const next = (updater as (current: URLSearchParams) => URLSearchParams)(
      new URLSearchParams('page=3&per_page=50&sort=display_name'),
    );
    expect(next.get('page')).toBe('2');
    expect(next.get('per_page')).toBe('50');
    expect(next.get('sort')).toBe('display_name');
  });

  it('recognizes a 404 status on the error itself', () => {
    const setSearchParams = jest.fn();

    renderHook(() =>
      useRecoverOutOfRangePage(2, { status: 404 }, setSearchParams),
    );

    expect(setSearchParams).toHaveBeenCalledTimes(1);
  });

  it('does not change the first page', () => {
    const setSearchParams = jest.fn();

    const { result } = renderHook(() =>
      useRecoverOutOfRangePage(1, { status: 404 }, setSearchParams),
    );

    expect(setSearchParams).not.toHaveBeenCalled();
    expect(result.current).toBe(false);
  });

  it('does not change page for other failures', () => {
    const setSearchParams = jest.fn();

    const { result } = renderHook(() =>
      useRecoverOutOfRangePage(4, new Error('failed to load'), setSearchParams),
    );

    expect(setSearchParams).not.toHaveBeenCalled();
    expect(result.current).toBe(false);
  });

  it('corrects a given failure only once', () => {
    const setSearchParams = jest.fn();
    const error = { status: 404 };

    const { rerender } = renderHook(
      ({ page }) => useRecoverOutOfRangePage(page, error, setSearchParams),
      { initialProps: { page: 3 } },
    );

    rerender({ page: 3 });

    expect(setSearchParams).toHaveBeenCalledTimes(1);
  });
});

describe('shouldRetrySystemsViewQuery', () => {
  const retryWithDefault = shouldRetrySystemsViewQuery(undefined);
  const retryNever = shouldRetrySystemsViewQuery(false);

  it('does not retry a page that is out of range', () => {
    expect(
      retryWithDefault(
        0,
        Object.assign(new Error('not found'), { status: 404 }),
      ),
    ).toBe(false);
  });

  it('keeps an explicit retry: false policy for other errors', () => {
    expect(retryNever(0, new Error('failed to load'))).toBe(false);
  });

  it('retries other errors up to the default limit', () => {
    expect(retryWithDefault(0, new Error('failed to load'))).toBe(true);
    expect(retryWithDefault(2, new Error('failed to load'))).toBe(true);
    expect(retryWithDefault(3, new Error('failed to load'))).toBe(false);
  });
});
