import { expect } from '@jest/globals';
import {
  ApiHostViewsGetHostViewsOrderByEnum,
  ApiHostViewsGetHostViewsStalenessEnum,
  ApiHostViewsGetHostViewsSystemTypeEnum,
} from '@redhat-cloud-services/host-inventory-client/ApiHostViewsGetHostViews';
import { INITIAL_INVENTORY_FILTERS } from '../DataViewFiltersContext';
import type { InventoryFilters } from '../filters/SystemsViewFilters';
import type { BuildHostViewsParamsInput } from './buildHostViewsParams';
import { buildHostViewsParams } from './buildHostViewsParams';
import { hostQueryParamsSerializer } from './buildHostListOptions';

const NOT_NIL = { is: 'not_nil' as const };

const buildParams = (
  overrides: Omit<Partial<BuildHostViewsParamsInput>, 'filters'> & {
    filters?: Partial<InventoryFilters>;
  } = {},
) => {
  const { filters: filterOverrides, ...rest } = overrides;

  return buildHostViewsParams({
    page: 1,
    perPage: 20,
    filters: {
      ...INITIAL_INVENTORY_FILTERS,
      ...filterOverrides,
    },
    lastSeenCustomRange: null,
    sortBy: undefined,
    direction: undefined,
    ...rest,
  });
};

describe('buildHostViewsParams', () => {
  describe('pagination', () => {
    it('sets page and perPage', () => {
      const params = buildParams({ page: 3, perPage: 40 });

      expect(params.page).toBe(3);
      expect(params.perPage).toBe(40);
    });
  });

  describe('sortBy', () => {
    it('remaps status column sort to last_check_in', () => {
      const params = buildParams({
        sortBy: 'status' as ApiHostViewsGetHostViewsOrderByEnum,
      });

      expect(params.orderBy).toBe(
        ApiHostViewsGetHostViewsOrderByEnum.LastCheckIn,
      );
    });

    it('passes through API orderBy values that do not need remapping', () => {
      const params = buildParams({
        sortBy: ApiHostViewsGetHostViewsOrderByEnum.DisplayName,
      });

      expect(params.orderBy).toBe('display_name');
    });

    it('omits orderBy when sortBy is undefined', () => {
      const params = buildParams({ sortBy: undefined });

      expect(params.orderBy).toBeUndefined();
    });
  });

  describe('direction', () => {
    it('sets orderHow from direction', () => {
      const params = buildParams({ direction: 'asc' });

      expect(params.orderHow).toBe('ASC');
    });

    it('omits orderHow when direction is undefined', () => {
      const params = buildParams({ direction: undefined });

      expect(params.orderHow).toBeUndefined();
    });
  });

  describe('hostname_or_id', () => {
    it('sets hostnameOrId when the filter value is non-empty', () => {
      const params = buildParams({
        filters: { hostname_or_id: 'my-host' },
      });

      expect(params.hostnameOrId).toBe('my-host');
    });

    it('omits hostnameOrId when the filter value is empty', () => {
      const params = buildParams({
        filters: { hostname_or_id: '' },
      });

      expect(params.hostnameOrId).toBeUndefined();
    });
  });

  describe('status', () => {
    it('sets staleness from the status filter', () => {
      const params = buildParams({
        filters: { status: [ApiHostViewsGetHostViewsStalenessEnum.Stale] },
      });

      expect(params.staleness).toEqual(['stale']);
    });

    it('omits staleness when the status filter is empty', () => {
      const params = buildParams({
        filters: { status: [] },
      });

      expect(params.staleness).toBeUndefined();
    });
  });

  describe('source', () => {
    it('sets registeredWith from the source filter', () => {
      const params = buildParams({
        filters: { source: ['insights'] },
      });

      expect(params.registeredWith).toEqual(['insights']);
    });

    it('omits registeredWith when the source filter is empty', () => {
      const params = buildParams({
        filters: { source: [] },
      });

      expect(params.registeredWith).toBeUndefined();
    });
  });

  describe('system_type', () => {
    it('expands image to bootc and edge', () => {
      const params = buildParams({
        filters: { system_type: ['image'] },
      });

      expect(params.systemType).toEqual([
        ApiHostViewsGetHostViewsSystemTypeEnum.Bootc,
        ApiHostViewsGetHostViewsSystemTypeEnum.Edge,
      ]);
    });

    it('omits systemType when the system_type filter is empty', () => {
      const params = buildParams({
        filters: { system_type: [] },
      });

      expect(params.systemType).toBeUndefined();
    });
  });

  describe('tags', () => {
    it('sets tags from the tags filter', () => {
      const params = buildParams({
        filters: { tags: ['env/prod'] },
      });

      expect(params.tags).toEqual(['env/prod']);
    });
  });

  describe('group_id', () => {
    it('sets workspaceId and preserves empty string for ungrouped hosts', () => {
      const params = buildParams({
        filters: { group_id: ['workspace-1', '', 'workspace-2'] },
      });

      expect(params.workspaceId).toEqual(['workspace-1', 'workspace-2', '']);
    });

    it('omits workspaceId when group_id is empty', () => {
      const params = buildParams({
        filters: { group_id: [] },
      });

      expect(params.workspaceId).toBeUndefined();
    });
  });

  describe('last_seen', () => {
    it('sets lastCheckInStart and lastCheckInEnd for a custom range', () => {
      const params = buildParams({
        filters: { last_seen: 'custom' },
        lastSeenCustomRange: {
          start: '2024-01-01T00:00:00.000Z',
          end: '2024-01-31T23:59:59.999Z',
        },
      });

      expect(params.lastCheckInStart).toBe('2024-01-01T00:00:00.000Z');
      expect(params.lastCheckInEnd).toBe('2024-01-31T23:59:59.999Z');
    });
  });

  describe('options.params.fields', () => {
    it('requests host-view system profile fields', () => {
      const params = buildParams();

      expect(params.options?.params?.fields).toEqual({
        system_profile: [
          'operating_system',
          'system_update_method',
          'bootc_status',
          'host_type',
          'infrastructure_type',
          'infrastructure_vendor',
          'workloads',
        ],
      });
    });
  });

  describe('options.params.filter', () => {
    it('nests system profile filters when toolbar profile filters are set', () => {
      const params = buildParams({
        filters: {
          workloads: ['ansible'],
        },
      });

      expect(params.options?.params?.filter).toEqual({
        system_profile: {
          workloads: {
            ansible: NOT_NIL,
          },
        },
      });
    });

    it('omits filter when no profile filters are set', () => {
      const params = buildParams();

      expect(params.options?.params?.filter).toBeUndefined();
    });
  });

  describe('options.paramsSerializer', () => {
    it('uses bracket notation for nested params', () => {
      const params = buildParams();

      expect(params.options?.paramsSerializer).toBe(hostQueryParamsSerializer);
      expect(
        decodeURIComponent(
          hostQueryParamsSerializer({
            fields: { system_profile: ['host_type'] },
          }),
        ),
      ).toBe('fields[system_profile][]=host_type');
    });
  });
});
