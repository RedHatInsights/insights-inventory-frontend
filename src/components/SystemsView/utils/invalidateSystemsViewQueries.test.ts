import { QueryClient } from '@tanstack/react-query';
import { jest, expect } from '@jest/globals';
import { INVENTORY_VIEWS_QUERY_KEY } from '../hooks/useInventoryViewsQuery';
import { SYSTEMS_QUERY_KEY } from '../hooks/useSystemsQuery';
import { invalidateSystemsViewQueries } from './invalidateSystemsViewQueries';

describe('invalidateSystemsViewQueries', () => {
  it('invalidates both systems and inventory-views query keys', async () => {
    const queryClient = new QueryClient();
    const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries');

    await invalidateSystemsViewQueries(queryClient);

    expect(invalidateQueriesSpy).toHaveBeenCalledTimes(2);
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: [SYSTEMS_QUERY_KEY],
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: [INVENTORY_VIEWS_QUERY_KEY],
    });
  });
});
