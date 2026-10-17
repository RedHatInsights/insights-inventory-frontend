import type { ApiHostGetHostListParams } from '@redhat-cloud-services/host-inventory-client/ApiHostGetHostList';
import { getSystemProfileFilter } from '../../SystemsView/filters/inventory/buildSystemProfileParam';
import { buildHostQueryOptions } from './buildHostListOptions';

const HOST_LIST_SYSTEM_PROFILE_FIELDS = [
  'operating_system',
  'system_update_method',
  'bootc_status',
  'host_type',
] as const;

/**
 * Strips the filter-written `options` fragment and attaches host-list query options.
 * Page and sort are already on `query` and pass through.
 *  @param query - Folded host-list query, including page and sort
 *  @returns     Host-list params with rebuilt query options
 */
export const buildHostListParams = (
  query: ApiHostGetHostListParams,
): ApiHostGetHostListParams => {
  const { options: queryOptions, ...filterQuery } = query;

  return {
    ...filterQuery,
    options: buildHostQueryOptions(
      HOST_LIST_SYSTEM_PROFILE_FIELDS,
      getSystemProfileFilter({ options: queryOptions }),
    ),
  };
};
