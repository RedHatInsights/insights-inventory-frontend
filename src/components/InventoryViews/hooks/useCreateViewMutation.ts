import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createViewApi } from '../../../api/inventoryViewsApi';

/**
 * Hook for creating a new inventory view
 *
 * @example
 * const createView = useCreateViewMutation();
 * createView.mutate({
 *   name: "My Custom View",
 *   configuration: { columns: [...], sort: {...} }
 * });
 */
export const useCreateViewMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createViewApi,
    onSuccess: (newView) => {
      console.log('[CREATE SUCCESS] New view created:', newView);

      // TODO: Invalidate views list query when RHINENG-28462 is complete
      // queryClient.invalidateQueries({ queryKey: ['views'] });

      // TODO: Add success toast notification (e.g. "View created successfully")
    },
    onError: (error) => {
      console.error('[CREATE ERROR] Failed to create view:', error);

      // TODO: Add error toast notification (e.g. "Failed to create view")
    },
  });
};
