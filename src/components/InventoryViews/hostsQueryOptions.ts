import { getHostList, getHostTags } from '../../api/hostInventoryApiTyped';
import { getLegacyInventorySortKey } from '../../constants';
import {
  ApiHostGetHostListOrderByEnum as ApiOrderByEnum,
  type ApiHostGetHostListParams,
} from '@redhat-cloud-services/host-inventory-client/ApiHostGetHostList';
import type { ToQueryParams } from '../SystemsView/types';
import { buildHostListParams } from './utils/buildHostListParams';

export const HOSTS_QUERY_KEY = 'hosts' as const;

export const toHostListQuery: ToQueryParams<ApiHostGetHostListParams> = ({
  page,
  perPage,
  sortBy,
  direction,
}) => {
  // Cross-app and SystemsView-only sort keys are not valid for the /hosts API. This can
  // happen during the render between ui.inventory-views being toggled off and the
  // useColumns useEffect resetting the URL to a valid sort key.
  const orderBy = getLegacyInventorySortKey(sortBy) as
    ApiOrderByEnum | undefined;

  return {
    page,
    perPage,
    ...(orderBy ? { orderBy } : {}),
    ...(direction ? { orderHow: direction.toUpperCase() } : {}),
  };
};

type FetchHostsReturnedValue = Awaited<ReturnType<typeof fetchHosts>>;
export type System = FetchHostsReturnedValue['results'][number];

const hasHostId = <T extends { id?: string }>(
  host: T,
): host is T & { id: string } => typeof host.id === 'string';

export const fetchHosts = async (params: ApiHostGetHostListParams) => {
  const fetchParams = buildHostListParams(params);

  const { results: hosts, total } = await getHostList(fetchParams);

  if (total === 0) return { results: [], total };

  const hostsWithId = hosts.filter(hasHostId);

  const { results: hostsTags = {} } = await getHostTags({
    hostIdList: hostsWithId.map(({ id }) => id),
  });

  const results = hostsWithId.map((host) => ({
    ...host,
    ...(hostsTags[host.id] ? { tags: hostsTags[host.id] } : {}),
  }));

  return { results, total: total ?? 0 };
};
