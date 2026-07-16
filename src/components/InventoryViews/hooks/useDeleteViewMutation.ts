import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteViewApi } from '../../../api/inventoryViewsApi';

/**
 * Hook for deleting an inventory view
 *
 * @example
 * const deleteView = useDeleteViewMutation();
 * deleteView.mutate("view-123");
 */
export const useDeleteViewMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteViewApi,
    onSuccess: (_, deletedId) => {
      console.log('[DELETE SUCCESS] View deleted:', deletedId);

      // TODO: Invalidate views list when RHINENG-28462 is complete
      // queryClient.invalidateQueries({ queryKey: ['views'] });

      // TODO: Add success toast notification (e.g. "View deleted successfully")
    },
    onError: (error) => {
      console.error('[DELETE ERROR] Failed to delete view:', error);

      // TODO: Add error toast notification (e.g. "Failed to delete view")
    },
  });
};
