import { queryOptions, type QueryKey } from '@tanstack/react-query';
import { getHostList, getHostTags } from '../../api/hostInventoryApiTyped';
import { getLegacyInventorySortKey } from '../../constants';
import { InventoryFilters } from '../SystemsView/filters/SystemsViewFilters';
import { ApiHostGetHostListOrderByEnum as ApiOrderByEnum } from '@redhat-cloud-services/host-inventory-client/ApiHostGetHostList';
import type { SystemsViewFetchParams } from '../SystemsView/types';
import {
  buildHostListParams,
  type BuildHostListParamsInput,
} from './utils/buildHostListParams';

export const HOSTS_QUERY_KEY = 'hosts' as const;

type FetchHostsReturnedValue = Awaited<ReturnType<typeof fetchHosts>>;
export type System = FetchHostsReturnedValue['results'][number];

const fetchHosts = async (params: BuildHostListParamsInput) => {
  const fetchParams = buildHostListParams(params);

  const { results: hosts, total } = await getHostList(fetchParams);

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

export const hostsQueryOptions = (
  params: SystemsViewFetchParams<InventoryFilters>,
) => {
  // Cross-app and SystemsView-only sort keys are not valid for the /hosts API. This can
  // happen during the render between ui.inventory-views being toggled off and the
  // useColumns useEffect resetting the URL to a valid sort key.
  const validSortBy = getLegacyInventorySortKey(params.sortBy) as
    | ApiOrderByEnum
    | undefined;

  return queryOptions({
    queryKey: [HOSTS_QUERY_KEY, params] as QueryKey,
    queryFn: () =>
      fetchHosts({
        page: params.page,
        perPage: params.perPage,
        filters: params.filters,
        lastSeenCustomRange: params.lastSeenCustomRange,
        sortBy: validSortBy,
        direction: params.direction,
      }),
  });
};
