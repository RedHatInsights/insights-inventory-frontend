import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAddNotification } from '@redhat-cloud-services/frontend-components-notifications/hooks';
import { createViewApi } from '../../../api/inventoryViewsApi';

export const useCreateViewMutation = () => {
  const queryClient = useQueryClient();
  const addNotification = useAddNotification();

  return useMutation({
    mutationFn: createViewApi,
    onSuccess: (newView) => {
      addNotification({
        variant: 'success',
        title: `View "${newView.name}" created successfully`,
        dismissable: true,
      });

      // TODO: Invalidate views list query when RHINENG-28462 is complete
      // queryClient.invalidateQueries({ queryKey: ['views'] });
    },
    onError: (error) => {
      console.error(error);
      addNotification({
        variant: 'danger',
        title: 'Failed to create view',
        description:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred.',
        dismissable: true,
      });
    },
  });
};
