import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAddNotification } from '@redhat-cloud-services/frontend-components-notifications/hooks';
import type { UpdateViewRequest } from '../../../api/inventoryViewsApi';
import { updateViewApi } from '../../../api/inventoryViewsApi';

export const useUpdateViewMutation = () => {
  const queryClient = useQueryClient();
  const addNotification = useAddNotification();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateViewRequest }) =>
      updateViewApi(id, data),
    onSuccess: (updatedView) => {
      addNotification({
        variant: 'success',
        title: `View "${updatedView.name}" updated successfully`,
        dismissable: true,
      });

      // TODO: Invalidate specific view + views list when RHINENG-28462 is complete
      // queryClient.invalidateQueries({ queryKey: ['views'] });
      // queryClient.invalidateQueries({ queryKey: ['view', updatedView.id] });
    },
    onError: (error) => {
      console.error(error);
      addNotification({
        variant: 'danger',
        title: 'Failed to update view',
        description:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred.',
        dismissable: true,
      });
    },
  });
};
