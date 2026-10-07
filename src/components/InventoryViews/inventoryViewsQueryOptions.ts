import { getHostTags, getHostViews } from '../../api/hostInventoryApiTyped';
import {
  ApiHostViewsGetHostViewsOrderByEnum as ApiOrderByEnum,
  type ApiHostViewsGetHostViewsParams,
} from '@redhat-cloud-services/host-inventory-client/ApiHostViewsGetHostViews';
import type { ToQueryParams } from '../SystemsView/types';
import { buildHostViewsParams } from './utils/buildHostViewsParams';

export const INVENTORY_VIEWS_QUERY_KEY = 'inventory-views' as const;

const BACKEND_SERVICE_TO_APP_NAME: Record<string, string> = {
  patch: 'content',
};

const COLUMN_SORT_BY_TO_API_ORDER_BY: Partial<Record<string, ApiOrderByEnum>> =
  {
    status: ApiOrderByEnum.LastCheckIn,
  };

export const toHostViewsQuery: ToQueryParams<
  ApiHostViewsGetHostViewsParams
> = ({ page, perPage, sortBy, direction }) => {
  const orderBy = sortBy
    ? (COLUMN_SORT_BY_TO_API_ORDER_BY[sortBy] ?? (sortBy as ApiOrderByEnum))
    : undefined;

  return {
    page,
    perPage,
    ...(orderBy ? { orderBy } : {}),
    ...(direction ? { orderHow: direction.toUpperCase() } : {}),
  };
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

const hasHostId = <T extends { id?: string }>(
  host: T,
): host is T & { id: string } => typeof host.id === 'string';

export const fetchInventoryViews = async (
  params: ApiHostViewsGetHostViewsParams,
) => {
  const fetchParams = buildHostViewsParams(params);

  const response = await getHostViews(fetchParams);
  const { results: hosts, total } = response;
  const deniedServices: string[] = (response.denied_services ?? []).map(
    (s) => BACKEND_SERVICE_TO_APP_NAME[s] ?? s,
  );

  if (total === 0) return { results: [], total, deniedServices };

  const hostsWithId = hosts.filter(hasHostId);

  const { results: hostsTags = {} } = await getHostTags({
    hostIdList: hostsWithId.map(({ id }) => id),
  });

  const results = hostsWithId.map((host) => ({
    ...host,
    ...(hostsTags[host.id] ? { tags: hostsTags[host.id] } : {}),
  }));

  return { results, total: total ?? 0, deniedServices };
};
