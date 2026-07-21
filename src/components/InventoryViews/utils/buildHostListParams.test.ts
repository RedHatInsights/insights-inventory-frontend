import { expect } from '@jest/globals';
import {
  ApiHostGetHostListOrderByEnum,
  ApiHostGetHostListStalenessEnum,
  ApiHostGetHostListSystemTypeEnum,
} from '@redhat-cloud-services/host-inventory-client/ApiHostGetHostList';
import { INITIAL_INVENTORY_FILTERS } from '../../SystemsView/DataViewFiltersContext';
import type { InventoryFilters } from '../../SystemsView/filters/SystemsViewFilters';
import type { BuildHostListParamsInput } from './buildHostListParams';
import { buildHostListParams } from './buildHostListParams';
import { hostQueryParamsSerializer } from './buildHostListOptions';

const NOT_NIL = { is: 'not_nil' as const };

const buildParams = (
  overrides: Omit<Partial<BuildHostListParamsInput>, 'filters'> & {
    filters?: Partial<InventoryFilters>;
  } = {},
) => {
  const { filters: filterOverrides, ...rest } = overrides;

  return buildHostListParams({
    page: 1,
    perPage: 20,
    filters: {
      ...INITIAL_INVENTORY_FILTERS,
      ...filterOverrides,
    },
    lastSeenCustomRange: null,
    ...rest,
  });
};

describe('buildHostListParams', () => {
  describe('pagination', () => {
    it('sets page and perPage', () => {
      const params = buildParams({ page: 2, perPage: 50 });

      expect(params.page).toBe(2);
      expect(params.perPage).toBe(50);
    });
  });

  describe('sortBy', () => {
    it('sets orderBy when sortBy is provided', () => {
      const params = buildParams({
        sortBy: ApiHostGetHostListOrderByEnum.DisplayName,
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
      const params = buildParams({ direction: 'desc' });

      expect(params.orderHow).toBe('DESC');
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
        filters: { status: [ApiHostGetHostListStalenessEnum.Fresh] },
      });

      expect(params.staleness).toEqual(['fresh']);
    });
  });

  describe('source', () => {
    it('sets registeredWith from the source filter', () => {
      const params = buildParams({
        filters: { source: ['insights'] },
      });

      expect(params.registeredWith).toEqual(['insights']);
    });
  });

  describe('system_type', () => {
    it('expands image to bootc and edge', () => {
      const params = buildParams({
        filters: { system_type: ['image', 'conventional'] },
      });

      expect(params.systemType).toEqual([
        ApiHostGetHostListSystemTypeEnum.Bootc,
        ApiHostGetHostListSystemTypeEnum.Edge,
        ApiHostGetHostListSystemTypeEnum.Conventional,
      ]);
    });
  });

  describe('group_id', () => {
    it('sets groupId and preserves empty string for ungrouped hosts', () => {
      const params = buildParams({
        filters: { group_id: ['workspace-1', '', 'workspace-2'] },
      });

      expect(params.groupId).toEqual(['workspace-1', 'workspace-2', '']);
    });

    it('omits groupId when group_id is empty', () => {
      const params = buildParams({
        filters: { group_id: [] },
      });

      expect(params.groupId).toBeUndefined();
    });
  });

  describe('tags', () => {
    it('sets tags from the tags filter', () => {
      const params = buildParams({
        filters: { tags: ['namespace/key=value'] },
      });

      expect(params.tags).toEqual(['namespace/key=value']);
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
    it('requests host list system profile fields', () => {
      const params = buildParams();

      expect(params.options?.params?.fields).toEqual({
        system_profile: [
          'operating_system',
          'system_update_method',
          'bootc_status',
          'host_type',
        ],
      });
    });
  });

  describe('options.params.filter', () => {
    it('nests system profile filters when toolbar profile filters are set', () => {
      const params = buildParams({
        filters: {
          rhcStatus: ['connected'],
          operating_system: ['RHEL9.0'],
          workloads: ['sap'],
        },
      });

      expect(params.options?.params?.filter).toEqual({
        system_profile: {
          rhc_client_id: ['connected'],
          operating_system: {
            RHEL: { version: { eq: ['9.0'] } },
          },
          workloads: {
            sap: NOT_NIL,
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
            filter: {
              system_profile: { workloads: { sap: { is: 'not_nil' } } },
            },
          }),
        ),
      ).toBe('filter[system_profile][workloads][sap][is]=not_nil');
    });
  });
});
