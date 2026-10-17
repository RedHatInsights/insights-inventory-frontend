import { expect } from '@jest/globals';
import { ApiHostGetHostListOrderByEnum } from '@redhat-cloud-services/host-inventory-client/ApiHostGetHostList';
import type { PaginationParams, SortingParams } from '../SystemsView/types';
import { toHostListQuery } from './hostsQueryOptions';

const toQuery = (overrides: Partial<PaginationParams & SortingParams> = {}) =>
  toHostListQuery({
    page: 1,
    perPage: 20,
    sortBy: undefined,
    direction: undefined,
    ...overrides,
  });

describe('toHostListQuery', () => {
  describe('pagination', () => {
    it('sets page and perPage', () => {
      const params = toQuery({ page: 2, perPage: 50 });

      expect(params.page).toBe(2);
      expect(params.perPage).toBe(50);
    });
  });

  describe('sortBy', () => {
    it('sets orderBy when sortBy is a legacy inventory key', () => {
      const params = toQuery({
        sortBy: ApiHostGetHostListOrderByEnum.DisplayName,
      });

      expect(params.orderBy).toBe('display_name');
    });

    it('omits orderBy when sortBy is undefined', () => {
      const params = toQuery({ sortBy: undefined });

      expect(params.orderBy).toBeUndefined();
    });

    it('omits orderBy for cross-app sort keys', () => {
      const params = toQuery({
        sortBy: 'vulnerability:total_cves',
        direction: 'asc',
      });

      expect(params.orderBy).toBeUndefined();
      expect(params.orderHow).toBe('ASC');
    });

    it('omits orderBy for the SystemsView-only status sort', () => {
      const params = toQuery({ sortBy: 'status' });

      expect(params.orderBy).toBeUndefined();
    });
  });

  describe('direction', () => {
    it('sets orderHow from direction', () => {
      const params = toQuery({ direction: 'desc' });

      expect(params.orderHow).toBe('DESC');
    });

    it('omits orderHow when direction is undefined', () => {
      const params = toQuery({ direction: undefined });

      expect(params.orderHow).toBeUndefined();
    });
  });
});
