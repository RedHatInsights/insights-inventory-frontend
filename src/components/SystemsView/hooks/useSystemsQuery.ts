import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getHostList, getHostTags } from '../../../api/hostInventoryApiTyped';
import { InventoryFilters } from '../filters/SystemsViewFilters';
import { ApiHostGetHostListOrderByEnum as ApiOrderByEnum } from '@redhat-cloud-services/host-inventory-client/ApiHostGetHostList';
import { SortDirection } from '../SystemsView';
import { buildHostListParams } from '../utils/buildHostListParams';
import type { LastSeenCustomRange } from '../DataViewFiltersContext';

export const SYSTEMS_QUERY_KEY = 'systems' as const;

type FetchSystemsReturnedValue = Awaited<ReturnType<typeof fetchSystems>>;
export type System = FetchSystemsReturnedValue['results'][number];

interface FetchSystemsParams {
  page: number;
  perPage: number;
  filters: InventoryFilters;
  lastSeenCustomRange: LastSeenCustomRange;
  sortBy: ApiOrderByEnum | undefined;
  direction: SortDirection | undefined;
}
const fetchSystems = async ({
  page,
  perPage,
  filters,
  lastSeenCustomRange,
  sortBy,
  direction,
}: FetchSystemsParams) => {
  const params = buildHostListParams({
    page,
    perPage,
    filters,
    lastSeenCustomRange,
    sortBy,
    direction,
  });

  const { results: hosts, total } = await getHostList(params);

  if (total === 0) return { results: [], total };

  const { results: hostsTags = {} } = await getHostTags({
    hostIdList: hosts
      .map(({ id }) => id)
      .filter((id): id is string => id !== undefined),
  });

  const results = hosts.map((host) => ({
    ...host,
    ...(host.id && hostsTags[host.id] ? { tags: hostsTags[host.id] } : {}),
  }));

  return { results, total };
};

interface UseSystemsQueryParams {
  page: number;
  perPage: number;
  filters: InventoryFilters;
  lastSeenCustomRange: LastSeenCustomRange;
  sortBy: ApiOrderByEnum | undefined;
  direction: SortDirection | undefined;
  /** When false, the query is not run (e.g. when user has no access). Default true. */
  enabled?: boolean;
}
export const useSystemsQuery = ({
  page,
  perPage,
  filters,
  lastSeenCustomRange,
  sortBy,
  direction,
  enabled = true,
}: UseSystemsQueryParams) => {
  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: [
      SYSTEMS_QUERY_KEY,
      page,
      perPage,
      filters,
      lastSeenCustomRange,
      sortBy,
      direction,
    ],
    queryFn: async () => {
      return await fetchSystems({
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
    isLoading,
    isFetching,
    isError,
    error,
  };
};
