import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAddNotification } from '@redhat-cloud-services/frontend-components-notifications/hooks';
import { setDefaultViewApi } from '../../../api/inventoryViewsApi';

export const useSetDefaultViewMutation = () => {
  const queryClient = useQueryClient();
  const addNotification = useAddNotification();

  return useMutation({
    mutationFn: (viewId: string) => setDefaultViewApi(viewId),
    onSuccess: async (view) => {
      addNotification({
        variant: 'success',
        title: `"${view.name}" is now your default view`,
        dismissable: true,
      });
      await queryClient.invalidateQueries({ queryKey: ['views'] });
    },
    onError: (error) => {
      console.error(error);
      addNotification({
        variant: 'danger',
        title: 'Failed to set default view',
        description:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred.',
        dismissable: true,
      });
    },
  });
};
