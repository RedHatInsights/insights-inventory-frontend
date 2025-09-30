import { useAddNotification } from '@redhat-cloud-services/frontend-components-notifications/hooks';
import { useState } from 'react';
import { patchHostById } from '../../../api/hostInventoryApi';

const useEditDisplayName = (currentSystem, reload, resetSelection) => {
  const addNotification = useAddNotification();
  const [editModalOpen, onEditModalOpen] = useState(false);

  const onSubmit = async (value) => {
    addNotification({
      id: 'edit-initiated',
      variant: 'info',
      title: 'Edit display name operation initiated',
      description: `Edit of ${currentSystem.display_name} started.`,
      dismissable: true,
    });

    try {
      const result = await patchHostById({
        hostIdList: [currentSystem.id],
        patchHostIn: { display_name: value },
      });

      if (result === 200) {
        addNotification({
          variant: 'success',
          title: `Display name has been changed to ${value}`,
          dismissable: true,
        });
      }
    } catch (error) {
      console.error(error);

      addNotification({
        variant: 'danger',
        title: 'Display name failed to be changed',
        description:
          'There was an error processing the request. Please try again.',
        dismissable: true,
      });
    }

    onEditModalOpen(false);
    resetSelection?.();
    reload?.();
  };

  return {
    editModalOpen,
    onEditModalOpen,
    onSubmit,
  };
};

export default useEditDisplayName;
