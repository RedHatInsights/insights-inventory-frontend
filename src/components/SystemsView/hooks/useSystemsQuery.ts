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
import { buildOperatingSystemProfileFilter } from '../utils/operatingSystemSelectOptions';
import { buildWorkloadsFilter } from '../utils/workloadsFilter';

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
  sortBy: ApiOrderByEnum | undefined;
  direction: SortDirection | undefined;
}
const fetchSystems = async ({
  page,
  perPage,
  filters,
  sortBy,
  direction,
}: FetchSystemsParams) => {
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
    ...(filters?.workspace && { groupName: filters.workspace }),
    ...(filters?.tags && { tags: filters.tags }),
    ...(filters?.last_seen && {
      lastCheckInStart: filters.last_seen?.start,
      lastCheckInEnd: filters.last_seen?.end,
    }),
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
        ...(hasSystemProfileFilter && {
          filter: {
            system_profile: systemProfileFilter,
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
  sortBy: ApiOrderByEnum | undefined;
  direction: SortDirection | undefined;
  /** When false, the query is not run (e.g. when user has no access). Default true. */
  enabled?: boolean;
}
export const useSystemsQuery = ({
  page,
  perPage,
  filters,
  sortBy,
  direction,
  enabled = true,
}: UseSystemsQueryParams) => {
  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: ['systems', page, perPage, filters, sortBy, direction],
    queryFn: async () => {
      return await fetchSystems({ page, perPage, filters, sortBy, direction });
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
