import {
  type HostFilters,
  HostFiltersSystemTypeEnum,
} from '@redhat-cloud-services/host-inventory-client';
import { normalizeLastSeenFilterValue } from '../../SystemsView/constants';
import type {
  LastSeenCustomRange,
  SystemsViewFilterState,
} from '../../SystemsView/types';
import { lastSeenKeysToApiParams } from './lastSeenKeysToApiParams';
import { buildSystemType } from './buildSystemType';

const asStringList = (value: unknown): string[] =>
  Array.isArray(value) ? value.map(String) : [];

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
  filters: SystemsViewFilterState,
  lastSeenCustomRange?: LastSeenCustomRange,
): HostFilters | undefined => {
  const hostFilters: HostFilters = {};
  const hostnameOrId =
    typeof filters.hostname_or_id === 'string' ? filters.hostname_or_id : '';
  const status = asStringList(filters.status);
  const source = asStringList(filters.source);
  const tags = asStringList(filters.tags);
  const groupId = asStringList(filters.group_id);
  const systemType = asStringList(filters.system_type);

  if (hostnameOrId) {
    hostFilters.hostname_or_id = hostnameOrId;
  }

  if (status.length) {
    hostFilters.staleness = status as HostFilters['staleness'];
  }

  if (source.length) {
    hostFilters.registered_with = source;
  }

  if (tags.length) {
    hostFilters.tags = tags;
  }

  if (groupId.length) {
    hostFilters.workspace_name = groupId;
  }

  if (systemType.length) {
    const mapped = buildSystemType(
      systemType,
      Object.values(HostFiltersSystemTypeEnum),
    );
    if (mapped.length) {
      hostFilters.system_type = mapped;
    }
  }

  const lastSeenParams = lastSeenKeysToApiParams(
    normalizeLastSeenFilterValue(filters.last_seen),
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
