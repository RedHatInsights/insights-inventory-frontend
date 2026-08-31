import type { InventoryFilters } from '../../SystemsView/filters/SystemsViewFilters';
import type { ViewConfiguration } from '../../../api/inventoryViewsApi';
import {
  buildSystemProfileFilters,
  type SystemProfileFilter,
} from './buildSystemProfileFilters';
import { serializeOperatingSystemFilterValue } from '../../SystemsView/utils/operatingSystemSelectOptions';
import { resolveLastSeenKeyFromBounds } from '../../SystemsView/constants';
import type { LastSeenCustomRange } from '../../SystemsView/types';
import type { HostFilters } from '@redhat-cloud-services/host-inventory-client';
import { buildHostFilters } from './buildHostFilters';

type ViewFilters = NonNullable<ViewConfiguration['filters']>;

const IMAGE_HOST_TYPES = ['bootc', 'edge'] as const;

const parseHostTypeFilter = (hostType: unknown): string[] | undefined => {
  const eq = (hostType as { eq?: string | string[] })?.eq;
  if (!eq) return undefined;
  const values = Array.isArray(eq) ? eq : [eq];
  const result: string[] = [];
  if (values.includes('conventional')) result.push('conventional');
  if (
    values.some((v) =>
      IMAGE_HOST_TYPES.includes(v as (typeof IMAGE_HOST_TYPES)[number]),
    )
  )
    result.push('image');
  return result.length > 0 ? result : undefined;
};

/**
 * Converts flat toolbar filter state into the nested backend format
 * for ViewConfiguration.filters. Supports system_profile filters
 * (operating_system, workloads, rhc_client_id) and host-level filters
 * (hostname_or_id, staleness, tags, registered_with, workspace_name, system_type, last_check_in dates).
 *
 *  @param filters             - Toolbar filter state
 *  @param lastSeenCustomRange - Custom date range when last_seen is 'custom'.
 *                             Get from DataViewFiltersContext.lastSeenCustomRange in SystemsView.
 *  @returns                   ViewConfiguration filters object or undefined when empty
 */
export const buildViewConfigFilters = (
  filters: Pick<
    InventoryFilters,
    | 'operating_system'
    | 'workloads'
    | 'rhcStatus'
    | 'system_type'
    | 'hostname_or_id'
    | 'status'
    | 'source'
    | 'tags'
    | 'group_id'
    | 'last_seen'
  >,
  lastSeenCustomRange?: LastSeenCustomRange,
): ViewFilters | undefined => {
  const systemProfile = buildSystemProfileFilters(filters);
  const hostFilters = buildHostFilters(filters, lastSeenCustomRange);

  const combined: Record<string, unknown> = {
    ...(systemProfile ?? {}),
  };

  const result: Record<string, unknown> = {
    ...(Object.keys(combined).length > 0 ? { system_profile: combined } : {}),
    ...(hostFilters ? { host: hostFilters } : {}),
  };

  if (Object.keys(result).length === 0) return undefined;
  return result as unknown as ViewFilters;
};

/**
 * Converts the nested backend ViewConfiguration.filters back into
 * flat toolbar InventoryFilters for restoring UI state.
 *  @param viewFilters - ViewConfiguration filters to parse
 *  @returns           Partial InventoryFilters object or undefined when empty
 */
export const parseViewConfigFilters = (
  viewFilters: ViewFilters | undefined,
): Partial<InventoryFilters> | undefined => {
  if (!viewFilters || Object.keys(viewFilters).length === 0) return undefined;

  const raw = viewFilters as unknown as Record<string, unknown>;
  const systemProfile = raw.system_profile as
    | (SystemProfileFilter & { host_type?: unknown })
    | undefined;
  const hostFilters = raw.host as HostFilters | undefined;

  const result: Partial<InventoryFilters> = {};

  if (systemProfile) {
    if (systemProfile.operating_system) {
      const tokens: string[] = [];
      for (const [osName, osValue] of Object.entries(
        systemProfile.operating_system,
      )) {
        const versions = (osValue as { version?: { eq?: string[] } })?.version
          ?.eq;
        if (versions) {
          for (const v of versions) {
            tokens.push(serializeOperatingSystemFilterValue(osName, v));
          }
        }
      }
      if (tokens.length) result.operating_system = tokens;
    }

    if (systemProfile.workloads) {
      result.workloads = Object.keys(systemProfile.workloads);
    }

    if (systemProfile.rhc_client_id) {
      result.rhcStatus = systemProfile.rhc_client_id;
    }

    if (systemProfile.host_type) {
      const systemTypes = parseHostTypeFilter(systemProfile.host_type);
      if (systemTypes?.length) result.system_type = systemTypes;
    }
  }

  if (hostFilters) {
    if (hostFilters.hostname_or_id) {
      result.hostname_or_id = hostFilters.hostname_or_id;
    }

    if (hostFilters.staleness?.length) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      result.status = hostFilters.staleness as any;
    }

    if (hostFilters.registered_with?.length) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      result.source = hostFilters.registered_with as any;
    }

    if (hostFilters.tags?.length) {
      result.tags = hostFilters.tags;
    }

    if (hostFilters.workspace_name?.length) {
      result.group_id = hostFilters.workspace_name;
    }

    if (hostFilters.system_type?.length) {
      const systemTypes = parseHostTypeFilter({
        eq: hostFilters.system_type,
      });
      if (systemTypes?.length) result.system_type = systemTypes;
    }

    const lastSeenKey = resolveLastSeenKeyFromBounds(
      hostFilters.last_check_in_start,
      hostFilters.last_check_in_end,
    );
    if (lastSeenKey) {
      result.last_seen = lastSeenKey as InventoryFilters['last_seen'];
    }
  }

  return Object.keys(result).length > 0 ? result : undefined;
};

/**
 * Extracts the custom Last seen date range from a saved view configuration so it
 * can seed DataViewFiltersProvider's in-memory `lastSeenCustomRange` state. Pairs
 * with parseViewConfigFilters, which restores `last_seen: 'custom'`.
 *  @param viewFilters - ViewConfiguration filters to parse
 *  @returns           Start/end range, or null when no host date bounds are saved
 */
export const parseViewConfigLastSeenCustomRange = (
  viewFilters: ViewFilters | undefined,
): LastSeenCustomRange => {
  if (!viewFilters) return null;

  const hostFilters = viewFilters.host;
  const start = hostFilters?.last_check_in_start;
  const end = hostFilters?.last_check_in_end;

  if (resolveLastSeenKeyFromBounds(start, end) !== 'custom') return null;

  return { start, end };
};
