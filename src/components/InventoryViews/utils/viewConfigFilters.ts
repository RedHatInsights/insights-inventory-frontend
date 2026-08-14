import type { InventoryFilters } from '../../SystemsView/filters/SystemsViewFilters';
import type { ViewConfiguration } from '../../../api/inventoryViewsApi';
import {
  buildSystemProfileFilters,
  type SystemProfileFilter,
} from './buildSystemProfileFilters';
import { serializeOperatingSystemFilterValue } from '../../SystemsView/utils/operatingSystemSelectOptions';

type ViewFilters = NonNullable<ViewConfiguration['filters']>;

const IMAGE_HOST_TYPES = ['bootc', 'edge'] as const;

const buildHostTypeFilter = (
  systemTypes: string[] | undefined,
): { host_type: { eq: string[] } } | undefined => {
  if (!systemTypes?.length) return undefined;
  const expanded = systemTypes.flatMap((val) =>
    val === 'image' ? [...IMAGE_HOST_TYPES] : [val],
  );
  return { host_type: { eq: expanded } };
};

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
 * for ViewConfiguration.filters. Only system_profile filters are
 * supported by the backend today; other toolbar filters (hostname,
 * staleness, tags, etc.) are separate query params and cannot be
 * persisted in a view configuration yet.
 *  @param filters
 */
export const buildViewConfigFilters = (
  filters: Pick<
    InventoryFilters,
    'operating_system' | 'workloads' | 'rhcStatus' | 'system_type'
  >,
): ViewFilters | undefined => {
  const systemProfile = buildSystemProfileFilters(filters);
  const hostType = buildHostTypeFilter(filters.system_type);

  const combined: Record<string, unknown> = {
    ...(systemProfile ?? {}),
    ...(hostType ?? {}),
  };

  if (Object.keys(combined).length === 0) return undefined;
  return { system_profile: combined } as unknown as ViewFilters;
};

/**
 * Converts the nested backend ViewConfiguration.filters back into
 * flat toolbar InventoryFilters for restoring UI state.
 *  @param viewFilters
 */
export const parseViewConfigFilters = (
  viewFilters: ViewFilters | undefined,
): Partial<InventoryFilters> | undefined => {
  if (!viewFilters || Object.keys(viewFilters).length === 0) return undefined;

  const raw = viewFilters as unknown as Record<string, unknown>;
  const systemProfile = raw.system_profile as
    | (SystemProfileFilter & { host_type?: unknown })
    | undefined;
  if (!systemProfile) return undefined;

  const result: Partial<InventoryFilters> = {};

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

  return Object.keys(result).length > 0 ? result : undefined;
};
