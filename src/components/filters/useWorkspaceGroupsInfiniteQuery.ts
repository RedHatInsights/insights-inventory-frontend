import { useInfiniteQuery } from '@tanstack/react-query';
import { getGroups } from '../InventoryGroups/utils/api';

const DEFAULT_PAGE_SIZE = 50;

type Options = {
  enabled?: boolean;
  pageSize?: number;
};

/**
 * Loads inventory workspaces (standard groups) with pagination for workspace pickers.
 *  @param debouncedSearch
 *  @param root0
 *  @param root0.enabled
 *  @param root0.pageSize
 */
export function useWorkspaceGroupsInfiniteQuery(
  debouncedSearch: string,
  { enabled = true, pageSize = DEFAULT_PAGE_SIZE }: Options = {},
) {
  return useInfiniteQuery({
    queryKey: ['groups', 'workspace-filter', debouncedSearch, pageSize],
    queryFn: async ({ pageParam }) =>
      getGroups(
        {
          type: 'standard',
          ...(debouncedSearch && { name: debouncedSearch }),
        },
        {
          page: pageParam,
          per_page: pageSize,
        },
      ),
    enabled,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.per_page * lastPage.page < lastPage.total
        ? lastPage.page + 1
        : null,
  });
}
