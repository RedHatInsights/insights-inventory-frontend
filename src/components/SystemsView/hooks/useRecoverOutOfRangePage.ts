import { useEffect, useRef } from 'react';
import type { DefaultOptions } from '@tanstack/react-query';
import type { SetURLSearchParams } from 'react-router-dom';
import { INITIAL_PAGE } from '../../InventoryViews/constants';

const PAGE_OUT_OF_RANGE_STATUS = 404;

type QueryRetry = NonNullable<NonNullable<DefaultOptions['queries']>['retry']>;

/**
 * Host list requests for a page past the end fail with 404.
 * Other failures leave the page where it is.
 */
export const isPageOutOfRangeError = (error: unknown): boolean => {
  if (typeof error !== 'object' || error === null) {
    return false;
  }

  const candidate = error as {
    status?: unknown;
    response?: { status?: unknown };
  };

  return (
    candidate.status === PAGE_OUT_OF_RANGE_STATUS ||
    candidate.response?.status === PAGE_OUT_OF_RANGE_STATUS
  );
};

/**
 * Keeps the QueryClient retry policy, but does not retry a page that is
 * already known to be past the end.
 */
export const shouldRetrySystemsViewQuery =
  (defaultRetry: QueryRetry | undefined) =>
  (failureCount: number, error: Error): boolean => {
    if (isPageOutOfRangeError(error)) {
      return false;
    }

    if (typeof defaultRetry === 'function') {
      return defaultRetry(failureCount, error);
    }

    if (typeof defaultRetry === 'number') {
      return failureCount < defaultRetry;
    }

    if (defaultRetry === true) {
      return true;
    }

    if (defaultRetry === false) {
      return false;
    }

    return failureCount < 3;
  };

/**
 * After the last page is emptied, the next fetch is still addressed to that
 * page and fails with 404. Step back one page so the following fetch is in
 * range. Page 1 is unchanged so a genuine 404 still shows the error state.
 *
 *  @param page            - Active table page.
 *  @param error           - Query error for that page, if the fetch failed.
 *  @param setSearchParams - Writes `page` on the current URL.
 *  @returns               - True while this page should be corrected.
 */
export const useRecoverOutOfRangePage = (
  page: number,
  error: unknown,
  setSearchParams: SetURLSearchParams,
): boolean => {
  const setSearchParamsRef = useRef(setSearchParams);
  setSearchParamsRef.current = setSearchParams;
  const recoveredErrorRef = useRef<unknown>(undefined);

  const isOutOfRange = page > INITIAL_PAGE && isPageOutOfRangeError(error);

  useEffect(() => {
    if (!isOutOfRange || recoveredErrorRef.current === error) {
      return;
    }

    recoveredErrorRef.current = error;
    const nextPage = page - 1;
    setSearchParamsRef.current(
      (current) => {
        const next = new URLSearchParams(current);
        next.set('page', String(nextPage));
        return next;
      },
      { replace: true },
    );
  }, [error, isOutOfRange, page]);

  return isOutOfRange;
};
