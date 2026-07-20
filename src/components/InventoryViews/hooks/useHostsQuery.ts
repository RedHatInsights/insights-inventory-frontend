import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getHostList, getHostTags } from '../../../api/hostInventoryApiTyped';
import { getLegacyInventorySortKey } from '../../../constants';
import { InventoryFilters } from '../../SystemsView/filters/SystemsViewFilters';
import { ApiHostGetHostListOrderByEnum as ApiOrderByEnum } from '@redhat-cloud-services/host-inventory-client/ApiHostGetHostList';
import type { ISortBy } from '@patternfly/react-table';
import type { Column } from '../../SystemsView/columns/allColumnDefinitions';
import { SortDirection } from '../../SystemsView/SystemsView';
import { buildHostListParams } from '../utils/buildHostListParams';
import type { LastSeenCustomRange } from '../../SystemsView/DataViewFiltersContext';

export const HOSTS_QUERY_KEY = 'hosts' as const;

export type SystemsViewFetchParams = {
  page: number;
  perPage: number;
  filters: InventoryFilters;
  lastSeenCustomRange: LastSeenCustomRange;
  sortBy: Column['sortBy'];
  direction: ISortBy['direction'] | undefined;
};

type FetchHostsReturnedValue = Awaited<ReturnType<typeof fetchHosts>>;
export type System = FetchHostsReturnedValue['results'][number];

interface FetchHostsParams {
  page: number;
  perPage: number;
  filters: InventoryFilters;
  lastSeenCustomRange: LastSeenCustomRange;
  sortBy: ApiOrderByEnum | undefined;
  direction: SortDirection | undefined;
}
const fetchHosts = async ({
  page,
  perPage,
  filters,
  lastSeenCustomRange,
  sortBy,
  direction,
}: FetchHostsParams) => {
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

export interface UseHostsQueryParams extends SystemsViewFetchParams {
  /** When false, the query is not run (e.g. when user has no access). Default true. */
  enabled?: boolean;
}
export const useHostsQuery = ({
  page,
  perPage,
  filters,
  lastSeenCustomRange,
  sortBy,
  direction,
  enabled = true,
}: UseHostsQueryParams) => {
  // Cross-app and SystemsView-only sort keys are not valid for the /hosts API. This can
  // happen during the render between ui.inventory-views being toggled off and the
  // useColumns useEffect resetting the URL to a valid sort key.
  const validSortBy = getLegacyInventorySortKey(sortBy) as
    | ApiOrderByEnum
    | undefined;

  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: [
      HOSTS_QUERY_KEY,
      page,
      perPage,
      filters,
      lastSeenCustomRange,
      validSortBy,
      direction,
    ],
    queryFn: async () => {
      return await fetchHosts({
        page,
        perPage,
        filters,
        lastSeenCustomRange,
        sortBy: validSortBy,
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
