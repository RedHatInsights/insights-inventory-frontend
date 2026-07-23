import { useQuery } from '@tanstack/react-query';
import { listViewsApi } from '../../../api/inventoryViewsApi';

/**
 * Hook for fetching the list of inventory views visible to the current user
 *
 * @example
 * const { data, isLoading } = useViewsQuery();
 * const viewNames = data?.results.map((v) => v.name) ?? [];
 */
export const useViewsQuery = () => {
  return useQuery({
    queryKey: ['views'],
    queryFn: listViewsApi,
  });
};
