import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UpdateViewRequest } from '../../../api/inventoryViewsApi';
import { updateViewApi } from '../../../api/inventoryViewsApi';

/**
 * Hook for updating an existing inventory view
 *
 * @example
 * const updateView = useUpdateViewMutation();
 * updateView.mutate({
 *   id: "view-123",
 *   data: { name: "Renamed View" }
 * });
 */
export const useUpdateViewMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateViewRequest }) =>
      updateViewApi(id, data),
    onSuccess: (updatedView) => {
      console.log('[UPDATE SUCCESS] View updated:', updatedView);

      // TODO: Invalidate specific view + views list when RHINENG-28462 is complete
      // queryClient.invalidateQueries({ queryKey: ['views'] });
      // queryClient.invalidateQueries({ queryKey: ['view', updatedView.id] });

      // TODO: Add success toast notification (e.g. "View updated successfully")
    },
    onError: (error) => {
      console.error('[UPDATE ERROR] Failed to update view:', error);

      // TODO: Add error toast notification (e.g. "Failed to update view")
    },
  });
};
