import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getHostTags, getHostViews } from '../../../api/hostInventoryApiTyped';
import { InventoryFilters } from '../filters/SystemsViewFilters';
import { ApiHostViewsGetHostViewsOrderByEnum } from '@redhat-cloud-services/host-inventory-client/ApiHostViewsGetHostViews';
import { SortDirection } from '../SystemsView';
import type { LastSeenCustomRange } from '../DataViewFiltersContext';
import { buildHostViewsParams } from '../utils/buildHostViewsParams';

export const INVENTORY_VIEWS_QUERY_KEY = 'inventory-views' as const;

type FetchInventoryViewsReturnedValue = Awaited<
  ReturnType<typeof fetchInventoryViews>
>;

/**
 * Host row from `fetchInventoryViews`: host-view API shape plus optional `tags` from
 * `getHostTags`. Not the same as the classic host list `HostOut` type.
 */
export type InventoryViewSystem =
  FetchInventoryViewsReturnedValue['results'][number];

interface FetchInventoryViewsParams {
  page: number;
  perPage: number;
  filters: InventoryFilters;
  lastSeenCustomRange: LastSeenCustomRange;
  sortBy: ApiHostViewsGetHostViewsOrderByEnum | undefined;
  direction: SortDirection | undefined;
}

const fetchInventoryViews = async ({
  page,
  perPage,
  filters,
  lastSeenCustomRange,
  sortBy,
  direction,
}: FetchInventoryViewsParams) => {
  const params = buildHostViewsParams({
    page,
    perPage,
    filters,
    lastSeenCustomRange,
    sortBy,
    direction,
  });

  const response = await getHostViews(params);
  const { results: hosts, total } = response;
  const deniedServices: string[] =
    ((response as unknown as Record<string, unknown>)
      .denied_services as string[]) ?? [];

  if (total === 0) return { results: [], total, deniedServices };

  const { results: hostsTags = {} } = await getHostTags({
    hostIdList: hosts
      .map(({ id }) => id)
      .filter((id): id is string => id !== undefined),
  });

  const results = hosts.map((host) => ({
    ...host,
    ...(host.id && hostsTags[host.id] ? { tags: hostsTags[host.id] } : {}),
  }));

  return { results, total, deniedServices };
};

/* `InventoryFilters.group_id` is ignored until workspace filtering exists on this endpoint. */
export interface UseInventoryViewsQueryParams {
  page: number;
  perPage: number;
  filters: InventoryFilters;
  lastSeenCustomRange: LastSeenCustomRange;
  sortBy: ApiHostViewsGetHostViewsOrderByEnum | undefined;
  direction: SortDirection | undefined;
  /** When false, the query is not run (e.g. when user has no access). Default true. */
  enabled?: boolean;
}

export const useInventoryViewsQuery = ({
  page,
  perPage,
  filters,
  lastSeenCustomRange,
  sortBy,
  direction,
  enabled = true,
}: UseInventoryViewsQueryParams) => {
  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: [
      INVENTORY_VIEWS_QUERY_KEY,
      page,
      perPage,
      filters,
      lastSeenCustomRange,
      sortBy,
      direction,
    ],
    queryFn: async () => {
      return await fetchInventoryViews({
        page,
        perPage,
        filters,
        lastSeenCustomRange,
        sortBy,
        direction,
      });
    },
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
    enabled,
  });

  return {
    data: data?.results,
    total: data?.total,
    deniedServices: data?.deniedServices ?? [],
    isLoading,
    isFetching,
    isError,
    error,
  };
};
