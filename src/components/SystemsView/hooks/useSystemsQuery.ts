import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getHostList, getHostTags } from '../../../api/hostInventoryApiTyped';
import { InventoryFilters } from '../filters/SystemsViewFilters';
import {
  ApiHostGetHostListSystemTypeEnum,
  type ApiHostGetHostListParams,
} from '@redhat-cloud-services/host-inventory-client/ApiHostGetHostList';
import qs from 'qs';
import { ApiHostGetHostListOrderByEnum as ApiOrderByEnum } from '@redhat-cloud-services/host-inventory-client/ApiHostGetHostList';
import { SortDirection } from '../SystemsView';
import { buildSystemProfileFilters } from '../utils/buildSystemProfileFilters';
import { lastSeenKeysToApiParams } from '../utils/lastSeenKeysToApiParams';
import type { LastSeenCustomRange } from '../DataViewFiltersContext';

export const SYSTEMS_QUERY_KEY = 'systems' as const;

const serializeSystemType = (values: string[]) => {
  const validValues = Object.values(ApiHostGetHostListSystemTypeEnum);

  return values
    .map((val) => (val === 'image' ? ['bootc', 'edge'] : val))
    .flat()
    .filter((val): val is ApiHostGetHostListSystemTypeEnum =>
      validValues.includes(val as ApiHostGetHostListSystemTypeEnum),
    );
};

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
  const systemProfileFilters = buildSystemProfileFilters(filters);

  const lastSeenParams = lastSeenKeysToApiParams(
    filters.last_seen,
    lastSeenCustomRange,
  );

  const params: ApiHostGetHostListParams = {
    page,
    perPage,
    ...(sortBy && { orderBy: sortBy }),
    ...(direction && { orderHow: direction.toUpperCase() }),
    ...(filters?.hostname_or_id && { hostnameOrId: filters.hostname_or_id }),
    ...(filters?.status && { staleness: filters.status }),
    ...(filters?.source && { registeredWith: filters.source }),
    ...(filters?.system_type && {
      systemType: serializeSystemType(filters.system_type),
    }),
    ...(() => {
      const g = filters?.group_id ?? [];
      const groupIdParam = [
        ...g.filter((id) => id),
        ...(g.includes('') ? [''] : []),
      ];
      return groupIdParam.length ? { groupId: groupIdParam } : {};
    })(),
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
          ],
        },
        ...(systemProfileFilters && {
          filter: {
            system_profile: systemProfileFilters,
          },
        }),
      },
    },
  };

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
