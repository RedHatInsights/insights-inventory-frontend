import { getHostTags, getHostViews } from '../../api/hostInventoryApiTyped';
import {
  ApiHostViewsGetHostViewsOrderByEnum as ApiOrderByEnum,
  type ApiHostViewsGetHostViewsParams,
} from '@redhat-cloud-services/host-inventory-client/ApiHostViewsGetHostViews';
import type {
  SystemsViewFetchParams,
  SystemsViewFilterState,
} from '../SystemsView/types';
import { markPaginatedRequestNotFound } from '../SystemsView/utils/paginatedRequestError';
import { buildHostViewsParams } from './utils/buildHostViewsParams';

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

const hasHostId = <T extends { id?: string }>(
  host: T,
): host is T & { id: string } => typeof host.id === 'string';

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

  // Mark only list-request 404s so SystemsView can recover from an out-of-range page.
  const response = await getHostViews(fetchParams).catch((error) => {
    throw markPaginatedRequestNotFound(error);
  });
  const { results: hosts, total } = response;
  const deniedServices: string[] = (response.denied_services ?? []).map(
    (s) => BACKEND_SERVICE_TO_APP_NAME[s] ?? s,
  );

  if (total === 0) return { results: [], total, deniedServices };

  const hostsWithId = hosts.filter(hasHostId);

  const hostTagsResponse =
    hostsWithId.length > 0
      ? await getHostTags({
          hostIdList: hostsWithId.map(({ id }) => id),
        })
      : undefined;
  const hostsTags = hostTagsResponse?.results ?? {};

  const results = hostsWithId.map((host) => ({
    ...host,
    ...(hostsTags[host.id] ? { tags: hostsTags[host.id] } : {}),
  }));

  return { results, total, deniedServices };
};
