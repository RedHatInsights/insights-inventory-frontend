import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getHostTags, getHostViews } from '../../../api/hostInventoryApiTyped';
import { InventoryFilters } from '../filters/SystemsViewFilters';
import {
  ApiHostViewsGetHostViewsParams,
  ApiHostViewsGetHostViewsOrderByEnum,
  ApiHostViewsGetHostViewsRegisteredWithEnum,
  ApiHostViewsGetHostViewsStalenessEnum,
  ApiHostViewsGetHostViewsSystemTypeEnum,
} from '@redhat-cloud-services/host-inventory-client/ApiHostViewsGetHostViews';
import { SortDirection } from '../SystemsView';
import { lastSeenKeysToApiParams } from '../utils/lastSeenKeysToApiParams';
import type { LastSeenCustomRange } from '../DataViewFiltersContext';
import qs from 'qs';
import { buildOperatingSystemProfileFilter } from '../utils/operatingSystemSelectOptions';
import { buildWorkloadsFilter } from '../utils/workloadsFilter';
import { Column } from '../columns/allColumnDefinitions';

const serializeSystemTypeForViews = (values: string[]) => {
  const validValues = Object.values(ApiHostViewsGetHostViewsSystemTypeEnum);

  return values
    .map((val) => (val === 'image' ? ['bootc', 'edge'] : val))
    .flat()
    .filter((val): val is ApiHostViewsGetHostViewsSystemTypeEnum =>
      validValues.includes(val as ApiHostViewsGetHostViewsSystemTypeEnum),
    );
};

const COLUMN_SORT_BY_TO_API_ORDER_BY: Partial<
  Record<NonNullable<Column['sortBy']>, ApiHostViewsGetHostViewsOrderByEnum>
> = {
  status: ApiHostViewsGetHostViewsOrderByEnum.LastCheckIn,
};

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
  const operatingSystemFilter = buildOperatingSystemProfileFilter(
    filters.operating_system,
  );
  const workloadsFilter = buildWorkloadsFilter(filters.workloads);

  const systemProfileFilter: Record<string, unknown> = {
    ...(filters?.rhcStatus?.length && {
      rhc_client_id: filters.rhcStatus,
    }),
    ...(operatingSystemFilter && { operating_system: operatingSystemFilter }),
    ...(workloadsFilter && { workloads: workloadsFilter }),
  };

  const hasSystemProfileFilter = Object.keys(systemProfileFilter).length > 0;

  const lastSeenParams = lastSeenKeysToApiParams(
    filters.last_seen,
    lastSeenCustomRange,
  );

  const params: ApiHostViewsGetHostViewsParams = {
    page,
    perPage,
    ...(sortBy && {
      orderBy: COLUMN_SORT_BY_TO_API_ORDER_BY[sortBy] ?? sortBy,
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
    /* Override default dot notation from API client: backend requires bracket notation for nested params (fields, filter) */
    options: {
      paramsSerializer: (params) => {
        return qs.stringify(params, {
          arrayFormat: 'brackets',
        });
      },
      params: {
        fields: {
          system_profile: [
            'operating_system',
            'system_update_method',
            'bootc_status',
            'host_type',
            'infrastructure_type',
            'infrastructure_vendor',
            'workloads',
          ],
        },
        ...(hasSystemProfileFilter && {
          filter: {
            system_profile: systemProfileFilter,
          },
        }),
      },
    },
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
