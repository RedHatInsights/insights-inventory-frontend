import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAddNotification } from '@redhat-cloud-services/frontend-components-notifications/hooks';
import { deleteViewApi } from '../../../api/inventoryViewsApi';

export const useDeleteViewMutation = () => {
  const queryClient = useQueryClient();
  const addNotification = useAddNotification();

  return useMutation({
    mutationFn: deleteViewApi,
    onSuccess: () => {
      addNotification({
        variant: 'success',
        title: 'View deleted successfully',
        dismissable: true,
      });

      void queryClient.invalidateQueries({ queryKey: ['views'] });
    },
    onError: (error) => {
      console.error(error);
      addNotification({
        variant: 'danger',
        title: 'Failed to delete view',
        description:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred.',
        dismissable: true,
      });
    },
  });
};
