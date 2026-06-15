import type { QueryClient } from '@tanstack/react-query';
import { INVENTORY_VIEWS_QUERY_KEY } from '../hooks/useInventoryViewsQuery';
import { SYSTEMS_QUERY_KEY } from '../hooks/useSystemsQuery';

export const invalidateSystemsViewQueries = (queryClient: QueryClient) =>
  Promise.all([
    queryClient.invalidateQueries({ queryKey: [SYSTEMS_QUERY_KEY] }),
    queryClient.invalidateQueries({ queryKey: [INVENTORY_VIEWS_QUERY_KEY] }),
  ]);
