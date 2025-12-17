import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAddNotification } from '@redhat-cloud-services/frontend-components-notifications/hooks';
import { type System } from './useSystemsQuery';
import { useMemo } from 'react';
import { patchHostById } from '../../../api/hostInventoryApiTyped';
import { PatchHostIn } from '@redhat-cloud-services/host-inventory-client';

interface usePatchSystemsMutationParams {
  systems: System[];
  onSuccess?: () => void;
  onError?: () => void;
  onMutate?: () => void;
}

const getDisplayName = (systems: System[]): string => {
  return systems.length > 1
    ? `${systems.length} systems`
    : (systems[0]?.display_name ?? 'system');
};

export const usePatchSystemsMutation = ({
  systems,
  onSuccess,
  onError,
  onMutate,
}: usePatchSystemsMutationParams) => {
  const addNotification = useAddNotification();
  const queryClient = useQueryClient();

  const displayName = useMemo(() => getDisplayName(systems), [systems]);

  const patchMutation = useMutation<
    void,
    Error,
    { ids: string[]; fields: PatchHostIn }
  >({
    mutationFn: async ({ ids, fields }) => {
      return await patchHostById({
        hostIdList: ids,
        patchHostIn: fields,
      });
    },

    onMutate: () => {
      onMutate?.();
      addNotification({
        variant: 'info',
        title: 'Edit display name operation initiated',
        description: `Edit of ${displayName} started.`,
        dismissable: true,
      });
    },
    onSuccess: async () => {
      onSuccess?.();
      addNotification({
        variant: 'success',
        title: 'Edit display name operation finished',
        description: `Display name has been changed to ${displayName}`,
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
        title: 'Display name failed to be changed',
        description:
          'There was an error processing the request. Please try again.',
        dismissable: true,
      });
    },
  });

  const onPatchConfirm = (name: string) => {
    if (systems.length === 0) {
      addNotification({
        variant: 'warning',
        title: 'No systems selected',
        description: 'Please select at least one system to patch.',
        dismissable: true,
      });
      return;
    }

    const systemIds = systems
      .map((system) => system.id)
      .filter((id): id is string => id !== undefined);

    patchMutation.mutate({ ids: systemIds, fields: { display_name: name } });
  };

  return { onPatchConfirm };
};
