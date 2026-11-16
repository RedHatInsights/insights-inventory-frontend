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
import { useRecoveryPage } from './useRecoveryPage';

/** Thrown when the URL page is past the last page that still has rows. Not retried. */
class OutOfRangeError extends Error {
  constructor(readonly page: number) {
    super('Requested page is outside the result range');
    this.name = 'OutOfRangeError';
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
  const correctedSignatureRef = useRef<string | null>(null);
  const signature = JSON.stringify({
    perPage: fetchParams.perPage,
    sortBy: fetchParams.sortBy,
    direction: fetchParams.direction,
    filterParams: fetchParams.filterParams,
  });

  const query = useQuery({
    queryKey: [queryKeyPrefix, fetchParams],
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      if (error instanceof OutOfRangeError) return false;
      const policy = queryClient.getDefaultOptions().queries?.retry;
      if (typeof policy === 'function') return policy(failureCount, error);
      if (typeof policy === 'number') return failureCount < policy;
      if (policy === true) return true;
      if (policy === false) return false;
      return failureCount < 3;
    },
    queryFn: async () => {
      const { page, perPage } = fetchParams;
      const corrected = correctedSignatureRef.current === signature;
      try {
        const data = await fetchData(fetchParams);
        if (!corrected && page > lastPage(data.total, perPage)) {
          throw new OutOfRangeError(lastPage(data.total, perPage));
        }
        return data;
      } catch (error) {
        if (
          error instanceof OutOfRangeError ||
          corrected ||
          page <= INITIAL_PAGE
        ) {
          throw error;
        }
        // The page may be stale. Page 1 reports the current total.
        const probe = await fetchData({ ...fetchParams, page: INITIAL_PAGE });
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
