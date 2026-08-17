import { queryOptions, type QueryKey } from '@tanstack/react-query';
import { getHostTags, getHostViews } from '../../api/hostInventoryApiTyped';
import { InventoryFilters } from '../SystemsView/filters/SystemsViewFilters';
import { ApiHostViewsGetHostViewsOrderByEnum as ApiOrderByEnum } from '@redhat-cloud-services/host-inventory-client/ApiHostViewsGetHostViews';
import type { SystemsViewFetchParams } from '../SystemsView/types';
import {
  buildHostViewsParams,
  type BuildHostViewsParamsInput,
} from './utils/buildHostViewsParams';

export const INVENTORY_VIEWS_QUERY_KEY = 'inventory-views' as const;

const BACKEND_SERVICE_TO_APP_NAME: Record<string, string> = {
  patch: 'content',
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

const fetchInventoryViews = async (params: BuildHostViewsParamsInput) => {
  const fetchParams = buildHostViewsParams(params);

  const response = await getHostViews(fetchParams);
  const { results: hosts, total } = response;
  const deniedServices: string[] = (response.denied_services ?? []).map(
    (s) => BACKEND_SERVICE_TO_APP_NAME[s] ?? s,
  );

  if (total === 0) return { results: [], total, deniedServices };

  const { results: hostsTags = {} } = await getHostTags({
    hostIdList: hosts
      .map(({ id }) => id)
      .filter((id): id is string => id !== undefined),
  });

  const results = hosts.map((host) => ({
    ...host,
    ...(host.id && hostsTags[host.id] ? { tags: hostsTags[host.id] } : {}),
  }));

  return { results, total, deniedServices };
};

export const inventoryViewsQueryOptions = (
  params: SystemsViewFetchParams<InventoryFilters>,
) =>
  queryOptions({
    queryKey: [INVENTORY_VIEWS_QUERY_KEY, params] as QueryKey,
    queryFn: () =>
      fetchInventoryViews({
        page: params.page,
        perPage: params.perPage,
        filters: params.filters,
        lastSeenCustomRange: params.lastSeenCustomRange,
        sortBy: params.sortBy as ApiOrderByEnum | undefined,
        direction: params.direction,
      }),
  });
