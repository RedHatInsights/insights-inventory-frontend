import { type QueryClient, useQuery } from '@tanstack/react-query';
import { generateFilter } from '@redhat-cloud-services/frontend-components-utilities/helpers';
import { getHostList, getHostTags } from '../../../api/hostInventoryApiTyped';
import pAll from 'p-all';

type FetchSystemsReturnedValue = Awaited<ReturnType<typeof fetchSystems>>;
export type System = FetchSystemsReturnedValue['results'][number];

interface FetchSystemsParams {
  page: number;
  perPage: number;
}

const fetchSystems = async ({ page, perPage }: FetchSystemsParams) => {
  const state = { filters: { filter: {} } };
  const fields = {
    system_profile: [
      'operating_system',
      'system_update_method',
      'bootc_status',
    ],
  };

  const { filter, ...filterParams } = state?.filters || {};

  const params = {
    ...filterParams,
    tags: [],
    page,
    perPage,
    options: {
      params: {
        // There is a bug in the JS clients that requires us to pass "filter" and "fields" as "raw" params.
        // the issue is that JS clients convert that object wrongly to something like filter.systems_profile.sap_system as the param name
        // it should rather be something like `filter[systems_profile][sap_system]`
        ...generateFilter(fields, 'fields'),
        ...generateFilter(filter),
      },
    },
  };

  const { results: hosts, total } = await getHostList(params);
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

const MAX_CONCURRENT_FETCHES = 5;
interface FetchAllSystemsParams {
  total?: number;
  perPage: number;
  queryClient: QueryClient;
}

export const fetchAllSystems = async ({
  total,
  perPage,
  queryClient,
}: FetchAllSystemsParams) => {
  if (!total) return [];

  const totalPages = Math.ceil(total / perPage);

  const allPages = (await pAll(
    Array.from(
      { length: totalPages },
      (_, i) => () =>
        queryClient.fetchQuery({
          queryKey: ['systems', i + 1, perPage],
          queryFn: () => fetchSystems({ page: i + 1, perPage }),
        }),
    ),
    { concurrency: MAX_CONCURRENT_FETCHES },
  )) as FetchSystemsReturnedValue[];

  return allPages.flatMap((page) => page.results);
};

type UseSystemsQueryParams = FetchSystemsParams;

export const useSystemsQuery = ({ page, perPage }: UseSystemsQueryParams) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['systems', page, perPage],
    queryFn: async () => {
      return await fetchSystems({ page, perPage });
    },
    refetchOnWindowFocus: false,
  });

  return { data: data?.results, total: data?.total, isLoading, isError, error };
};
