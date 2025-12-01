import { useQuery } from '@tanstack/react-query';
import { getHostList, getHostTags } from '../../../api/hostInventoryApiTyped';
import { InventoryFilters } from '../SystemsViewFilters';
import {
  ApiHostGetHostListSystemTypeEnum,
  type ApiHostGetHostListParams,
} from '@redhat-cloud-services/host-inventory-client/ApiHostGetHostList';
import qs from 'qs';

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
}
const fetchSystems = async ({ page, perPage, filters }: FetchSystemsParams) => {
  // TODO configure filters dynamically
  const params: ApiHostGetHostListParams = {
    tags: [],
    page,
    perPage,
    ...(filters?.name && { hostnameOrId: filters.name }),
    ...(filters?.status && { staleness: filters.status }),
    ...(filters?.dataCollector && { registeredWith: filters.dataCollector }),
    ...(filters?.systemType && {
      systemType: serializeSystemType(filters.systemType),
    }),
    ...(filters?.workspace && { groupName: filters.workspace }),
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
          ],
        },
        ...(filters?.rhcStatus && {
          filter: {
            system_profile: {
              rhc_client_id: filters.rhcStatus,
            },
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
}
export const useSystemsQuery = ({
  page,
  perPage,
  filters,
}: UseSystemsQueryParams) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['systems', page, perPage, filters],
    queryFn: async () => {
      return await fetchSystems({ page, perPage, filters });
    },
    refetchOnWindowFocus: false,
  });

  return { data: data?.results, total: data?.total, isLoading, isError, error };
};
