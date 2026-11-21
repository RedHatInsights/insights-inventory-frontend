import { getHostTags, getHostViews } from '../../api/hostInventoryApiTyped';
import {
  ApiHostViewsGetHostViewsOrderByEnum as ApiOrderByEnum,
  type ApiHostViewsGetHostViewsParams,
} from '@redhat-cloud-services/host-inventory-client/ApiHostViewsGetHostViews';
import type { StructuredTag } from '@redhat-cloud-services/host-inventory-client';
import type {
  SystemsViewFetchParams,
  SystemsViewFilterState,
} from '../SystemsView/types';
import { buildHostViewsParams } from './utils/buildHostViewsParams';
import { groupTagsByIdentity } from './tagKeys';

export const INVENTORY_VIEWS_QUERY_KEY = 'inventory-views' as const;

const BACKEND_SERVICE_TO_APP_NAME: Record<string, string> = {
  patch: 'content',
};

type FetchInventoryViewsReturnedValue = Awaited<
  ReturnType<typeof fetchInventoryViews>
>;

/**
 * Host row from `fetchInventoryViews`: host-view API shape plus `tags`.
 * `tags` is on the hosts-view response; `getHostTags` fills it only when absent.
 * Not the same as the classic host list `HostOut` type.
 */
export type InventoryViewSystem =
  FetchInventoryViewsReturnedValue['results'][number];

const hasHostId = <T extends { id?: string }>(
  host: T,
): host is T & { id: string } => typeof host.id === 'string';

const hostHasTags = (host: object): host is { tags: StructuredTag[] } =>
  Object.hasOwn(host, 'tags');

const rowsWithTags = async <T extends { id: string }>(
  hosts: T[],
): Promise<(T & { tags?: StructuredTag[] })[]> => {
  if (hosts.every(hostHasTags)) return hosts;

  const { results: hostsTags = {} } = await getHostTags({
    hostIdList: hosts.map(({ id }) => id),
  });

  return hosts.map((host) =>
    hostHasTags(host)
      ? host
      : {
          ...host,
          ...(hostsTags[host.id] ? { tags: hostsTags[host.id] } : {}),
        },
  );
};

export const fetchInventoryViews = async (
  params: SystemsViewFetchParams<ApiHostViewsGetHostViewsParams>,
) => {
  const fetchParams = buildHostViewsParams({
    page: params.page,
    perPage: params.perPage,
    query: params.filterParams,
    sortBy: params.sortBy as ApiOrderByEnum | undefined,
    direction: params.direction,
  });

  const response = await getHostViews(fetchParams);
  const { results: hosts, total } = response;
  const deniedServices: string[] = (response.denied_services ?? []).map(
    (s) => BACKEND_SERVICE_TO_APP_NAME[s] ?? s,
  );

  if (total === 0) return { results: [], total, deniedServices };

  const hostsWithId = hosts.filter(hasHostId);
  const rows = (await rowsWithTags(hostsWithId)).map((host) => ({
    ...host,
    tagsByKey: groupTagsByIdentity(host.tags),
  }));

  return { results: rows, total: total ?? 0, deniedServices };
};
