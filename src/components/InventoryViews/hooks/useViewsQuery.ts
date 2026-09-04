import { useInfiniteQuery } from '@tanstack/react-query';
import { listViewsApi } from '../../../api/inventoryViewsApi';

export const DEFAULT_PAGE_SIZE = 50;

/**
 * Hook for fetching the list of inventory views visible to the current user, paginated.
 *
 *  @param pageSize number of views to fetch per page
 *  @returns        an infinite query result with `data.pages`, `fetchNextPage`, and `hasNextPage`
 * @example
 * const { data, fetchNextPage, hasNextPage } = useViewsQuery();
 * const viewNames = data?.pages.flatMap((p) => p.results).map((v) => v.name) ?? [];
 */
export const useViewsQuery = (pageSize = DEFAULT_PAGE_SIZE) => {
  return useInfiniteQuery({
    queryKey: ['views', pageSize],
    queryFn: ({ pageParam }) =>
      listViewsApi({ page: pageParam, perPage: pageSize }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.per_page * lastPage.page < lastPage.total
        ? lastPage.page + 1
        : null,
  });
};
