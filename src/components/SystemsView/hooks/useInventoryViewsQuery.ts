import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getHostTags, getHostViews } from '../../../api/hostInventoryApiTyped';
import { InventoryFilters } from '../filters/SystemsViewFilters';
import type { ApiHostViewsGetHostViewsParams } from '@redhat-cloud-services/host-inventory-client/ApiHostViewsGetHostViews';
import {
  ApiHostViewsGetHostViewsOrderByEnum,
  ApiHostViewsGetHostViewsRegisteredWithEnum,
  ApiHostViewsGetHostViewsStalenessEnum,
  ApiHostViewsGetHostViewsSystemTypeEnum,
} from '@redhat-cloud-services/host-inventory-client/ApiHostViewsGetHostViews';
import { ApiHostGetHostListOrderByEnum } from '@redhat-cloud-services/host-inventory-client/ApiHostGetHostList';
import { SortDirection } from '../SystemsView';
import { lastSeenKeysToApiParams } from '../utils/lastSeenKeysToApiParams';
import type { LastSeenCustomRange } from '../DataViewFiltersContext';

/**
 * Sort field for `/beta/hosts-view` (`getHostViews`). Combines host-views order enums with
 * host-list order enums so callers can reuse Systems View column `sortBy` where values overlap
 * (e.g. `display_name`, `group_name`, `operating_system`, `last_check_in`).
 */
export type InventoryViewsSortBy =
  | ApiHostViewsGetHostViewsOrderByEnum
  | ApiHostGetHostListOrderByEnum;

const serializeSystemTypeForViews = (values: string[]) => {
  const validValues = Object.values(ApiHostViewsGetHostViewsSystemTypeEnum);

  return values
    .map((val) => (val === 'image' ? ['bootc', 'edge'] : val))
    .flat()
    .filter((val): val is ApiHostViewsGetHostViewsSystemTypeEnum =>
      validValues.includes(val as ApiHostViewsGetHostViewsSystemTypeEnum),
    );
};

type FetchInventoryViewsReturnedValue = Awaited<
  ReturnType<typeof fetchInventoryViews>
>;

/**
 * Host row from `fetchInventoryViews`: host-view API shape plus optional `tags` from
 * `getHostTags`. Not the same as the classic host list `HostOut` type.
 */
export type InventoryViewHost =
  FetchInventoryViewsReturnedValue['results'][number];

interface FetchInventoryViewsParams {
  page: number;
  perPage: number;
  filters: InventoryFilters;
  lastSeenCustomRange: LastSeenCustomRange;
  sortBy: InventoryViewsSortBy | undefined;
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
  const lastSeenParams = lastSeenKeysToApiParams(
    filters.last_seen,
    lastSeenCustomRange,
  );

  const params: ApiHostViewsGetHostViewsParams = {
    page,
    perPage,
    ...(sortBy && {
      orderBy: sortBy as NonNullable<ApiHostViewsGetHostViewsParams['orderBy']>,
    }),
    ...(direction && { orderHow: direction.toUpperCase() }),
    ...(filters?.hostname_or_id && { hostnameOrId: filters.hostname_or_id }),
    ...(filters?.status?.length && {
      staleness: filters.status as ApiHostViewsGetHostViewsStalenessEnum[],
    }),
    ...(filters?.source?.length && {
      registeredWith:
        filters.source as ApiHostViewsGetHostViewsRegisteredWithEnum[],
    }),
    ...(filters?.system_type?.length && {
      systemType: serializeSystemTypeForViews(filters.system_type),
    }),
    ...(filters?.tags && { tags: filters.tags }),
    ...(lastSeenParams ?? {}),
  };

  const { results: hosts, total } = await getHostViews(params);

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

/**
 * Arguments for `useInventoryViewsQuery`. Same shape as `useSystemsQuery` input.
 *
 * Uses `GET /beta/hosts-view` (`getHostViews`): no `system_profile` field or filter params; toolbar
 * keys `operating_system`, `workloads`, and `rhcStatus` do not affect the request.
 *
 * `InventoryFilters.group_id` is ignored until workspace filtering exists on this endpoint.
 */
export interface UseInventoryViewsQueryParams {
  page: number;
  perPage: number;
  filters: InventoryFilters;
  lastSeenCustomRange: LastSeenCustomRange;
  sortBy: InventoryViewsSortBy | undefined;
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
      'inventory-views',
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
    isLoading,
    isFetching,
    isError,
    error,
  };
};
