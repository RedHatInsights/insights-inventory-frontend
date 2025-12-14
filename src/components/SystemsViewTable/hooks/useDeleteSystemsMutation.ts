import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAddNotification } from '@redhat-cloud-services/frontend-components-notifications/hooks';
import { deleteSystemsById } from '../../InventoryTable/utils/api';
import { type System } from './useSystemsQuery';
import { useMemo } from 'react';

interface UseDeleteSystemsMutationParams {
  systemsToDelete: System[];
  onSuccess?: () => void;
  onError?: () => void;
  onMutate?: () => void;
}

const getDisplayName = (systems: System[]): string => {
  return systems.length > 1
    ? `${systems.length} systems`
    : (systems[0]?.display_name ?? 'system');
};

export const useDeleteSystemsMutation = ({
  systemsToDelete,
  onSuccess,
  onError,
  onMutate,
}: UseDeleteSystemsMutationParams) => {
  const addNotification = useAddNotification();
  const queryClient = useQueryClient();

  const displayName = useMemo(
    () => getDisplayName(systemsToDelete),
    [systemsToDelete],
  );

  const deleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      return await deleteSystemsById(ids);
    },
    onMutate: () => {
      onMutate?.();
      addNotification({
        variant: 'info',
        title: 'Delete operation initiated',
        description: `Removal of ${displayName} started.`,
        dismissable: true,
      });
    },
    onSuccess: async () => {
      onSuccess?.();
      addNotification({
        variant: 'success',
        title: 'Delete operation finished',
        description: `${displayName} has been successfully removed.`,
        dismissable: true,
      });

      // refetch systems
      await queryClient.invalidateQueries({ queryKey: ['systems'] });
    },
    onError: async (error) => {
      onError?.();
      console.error(error);
      addNotification({
        variant: 'danger',
        title: 'System(s) failed to be removed from Inventory',
        description:
          'There was an error processing the request. Please try again.',
        dismissable: true,
      });

      // refetch systems due to possible partial failures
      await queryClient.invalidateQueries({ queryKey: ['systems'] });
    },
  });

  const onDeleteConfirm = () => {
    if (systemsToDelete.length === 0) {
      addNotification({
        variant: 'warning',
        title: 'No systems selected',
        description: 'Please select at least one system to delete.',
        dismissable: true,
      });
      return;
    }

    const systemIds = systemsToDelete
      .map((system) => system.id)
      .filter((id): id is string => id !== undefined);

    deleteMutation.mutate(systemIds);
  };

  return { onDeleteConfirm };
};
