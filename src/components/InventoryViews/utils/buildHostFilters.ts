import {
  type HostFilters,
  HostFiltersSystemTypeEnum,
} from '@redhat-cloud-services/host-inventory-client';
import type { InventoryFilters } from '../../SystemsView/filters/SystemsViewFilters';
import type { LastSeenCustomRange } from '../../SystemsView/types';
import { lastSeenKeysToApiParams } from './lastSeenKeysToApiParams';
import { buildSystemType } from './buildSystemType';

/**
 * Maps flat toolbar host-level filters to the nested `host` HostFilters block of a
 * view configuration. Covers hostname_or_id, staleness, registered_with, tags,
 * workspace_name, system_type and the last_check_in date range derived from the
 * Last seen selection.
 *
 *  @param filters             - Toolbar filter state for host-level filters
 *  @param lastSeenCustomRange - Custom date range when `last_seen` is 'custom'.
 *                             Get from DataViewFiltersContext.lastSeenCustomRange in SystemsView.
 *  @returns                   HostFilters object, or undefined when no host filters are active
 */
export const buildHostFilters = (
  filters: Pick<
    InventoryFilters,
    | 'hostname_or_id'
    | 'status'
    | 'source'
    | 'tags'
    | 'group_id'
    | 'system_type'
    | 'last_seen'
  >,
  lastSeenCustomRange?: LastSeenCustomRange,
): HostFilters | undefined => {
  const hostFilters: HostFilters = {};

  if (filters.hostname_or_id) {
    hostFilters.hostname_or_id = filters.hostname_or_id;
  }

  if (filters.status?.length) {
    hostFilters.staleness = filters.status;
  }

  if (filters.source?.length) {
    hostFilters.registered_with = filters.source;
  }

  if (filters.tags?.length) {
    hostFilters.tags = filters.tags;
  }

  if (filters.group_id?.length) {
    hostFilters.workspace_name = filters.group_id;
  }

  if (filters.system_type?.length) {
    const systemType = buildSystemType(
      filters.system_type,
      Object.values(HostFiltersSystemTypeEnum),
    );
    if (systemType.length) {
      hostFilters.system_type = systemType;
    }
  }

  const lastSeenParams = lastSeenKeysToApiParams(
    filters.last_seen,
    lastSeenCustomRange ?? {},
  );
  if (lastSeenParams?.lastCheckInStart) {
    hostFilters.last_check_in_start = lastSeenParams.lastCheckInStart;
  }
  if (lastSeenParams?.lastCheckInEnd) {
    hostFilters.last_check_in_end = lastSeenParams.lastCheckInEnd;
  }

  return Object.keys(hostFilters).length > 0 ? hostFilters : undefined;
};
