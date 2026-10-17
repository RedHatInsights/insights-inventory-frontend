import { expect } from '@jest/globals';
import { ApiHostViewsGetHostViewsOrderByEnum } from '@redhat-cloud-services/host-inventory-client/ApiHostViewsGetHostViews';
import type { PaginationParams, SortingParams } from '../SystemsView/types';
import { toHostViewsQuery } from './inventoryViewsQueryOptions';

const toQuery = (overrides: Partial<PaginationParams & SortingParams> = {}) =>
  toHostViewsQuery({
    page: 1,
    perPage: 20,
    sortBy: undefined,
    direction: undefined,
    ...overrides,
  });

describe('toHostViewsQuery', () => {
  describe('pagination', () => {
    it('sets page and perPage', () => {
      const params = toQuery({ page: 3, perPage: 40 });

      expect(params.page).toBe(3);
      expect(params.perPage).toBe(40);
    });
  });

  describe('sortBy', () => {
    it('remaps status column sort to last_check_in', () => {
      const params = toQuery({ sortBy: 'status' });

      expect(params.orderBy).toBe(
        ApiHostViewsGetHostViewsOrderByEnum.LastCheckIn,
      );
    });

    it('passes through API orderBy values that do not need remapping', () => {
      const params = toQuery({
        sortBy: ApiHostViewsGetHostViewsOrderByEnum.DisplayName,
      });

      expect(params.orderBy).toBe('display_name');
    });

    it('omits orderBy when sortBy is undefined', () => {
      const params = toQuery({ sortBy: undefined });

      expect(params.orderBy).toBeUndefined();
    });
  });

  describe('direction', () => {
    it('sets orderHow from direction', () => {
      const params = toQuery({ direction: 'asc' });

      expect(params.orderHow).toBe('ASC');
    });

    it('omits orderHow when direction is undefined', () => {
      const params = toQuery({ direction: undefined });

      expect(params.orderHow).toBeUndefined();
    });
  });
});
