import { useRef } from 'react';
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type { SetURLSearchParams } from 'react-router-dom';
import { INITIAL_PAGE } from '../../InventoryViews/constants';
import type {
  SystemsViewFetchData,
  SystemsViewFetchParams,
  SystemsViewItem,
} from '../types';
import { useRecoveryPage, type PageCorrection } from './useRecoveryPage';

/** Thrown when the URL page is past the last page that still has rows. Not retried. */
class OutOfRangeError extends Error {
  constructor(readonly page: number) {
    super('Requested page is outside the result range');
    this.name = 'OutOfRangeError';
  }
}

/** Thrown when page 1 cannot be loaded to check a later page. Not retried. */
class ProbeFailedError extends Error {
  constructor(cause: unknown) {
    super('Page probe failed', { cause });
    this.name = 'ProbeFailedError';
  }
}

const lastPage = (total: number, perPage: number) =>
  Math.max(INITIAL_PAGE, Math.ceil(total / perPage) || INITIAL_PAGE);

interface UseSystemsViewQueryParams<
  TItem extends SystemsViewItem,
  TFilterParams,
> {
  queryKeyPrefix: string;
  fetchData: SystemsViewFetchData<TItem, TFilterParams>;
  fetchParams: SystemsViewFetchParams<TFilterParams>;
  setSearchParams: SetURLSearchParams;
}

export const useSystemsViewQuery = <
  TItem extends SystemsViewItem,
  TFilterParams,
>({
  queryKeyPrefix,
  fetchData,
  fetchParams,
  setSearchParams,
}: UseSystemsViewQueryParams<TItem, TFilterParams>) => {
  const queryClient = useQueryClient();
  const correctedSignatureRef = useRef<PageCorrection | null>(null);
  const queryKey = [queryKeyPrefix, fetchParams];
  const signature = JSON.stringify({
    perPage: fetchParams.perPage,
    sortBy: fetchParams.sortBy,
    direction: fetchParams.direction,
    filterParams: fetchParams.filterParams,
  });

  const allowsRetry = (failureCount: number, error: unknown) => {
    const policy = queryClient.defaultQueryOptions({ queryKey }).retry;
    if (typeof policy === 'function')
      return policy(failureCount, error as Error);
    if (typeof policy === 'number') return failureCount < policy;
    if (policy === true) return true;
    if (policy === false) return false;
    return failureCount < 3;
  };

  const fetchPageOne = async () => {
    let failureCount = 0;
    for (;;) {
      try {
        return await fetchData({ ...fetchParams, page: INITIAL_PAGE });
      } catch (error) {
        if (!allowsRetry(failureCount, error))
          throw new ProbeFailedError(error);
        failureCount += 1;
      }
    }
  };

  const query = useQuery({
    queryKey,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      if (
        error instanceof OutOfRangeError ||
        error instanceof ProbeFailedError
      ) {
        return false;
      }
      return allowsRetry(failureCount, error);
    },
    queryFn: async () => {
      const { page, perPage } = fetchParams;
      const pending = correctedSignatureRef.current;
      if (pending?.signature === signature && pending.page === page) {
        correctedSignatureRef.current = null;
      }
      try {
        const data = await fetchData(fetchParams);
        if (page > lastPage(data.total, perPage)) {
          throw new OutOfRangeError(lastPage(data.total, perPage));
        }
        return data;
      } catch (error) {
        if (error instanceof OutOfRangeError || page <= INITIAL_PAGE) {
          throw error;
        }

        const probe = await fetchPageOne();
        const max = lastPage(probe.total, perPage);
        if (page > max) throw new OutOfRangeError(max);
        throw error;
      }
    },
  });

  const discoveredPage =
    query.error instanceof OutOfRangeError ? query.error.page : null;
  useRecoveryPage(
    discoveredPage,
    setSearchParams,
    signature,
    correctedSignatureRef,
  );

  return {
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    isRecovering: discoveredPage != null,
  };
};
