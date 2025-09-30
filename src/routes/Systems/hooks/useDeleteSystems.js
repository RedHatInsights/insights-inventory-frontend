import { useAddNotification } from '@redhat-cloud-services/frontend-components-notifications/hooks';
import React, { useState, useMemo } from 'react';
import DedicatedAction from '../components/SystemsTable/components/actions/DedicatedAction';
import { deleteSystemsById } from '../../../components/InventoryTable/utils/api';

const useDeleteSystems = (
  itemsData,
  reload,
  resetSelection,
  selected,
  setIsRowAction,
) => {
  const addNotification = useAddNotification();
  const [isModalOpen, handleModalToggle] = useState(false);

  const itemsToDelete = useMemo(
    () => itemsData?.filter(({ id }) => selected.includes(id)) || [],
    [itemsData, selected],
  );

  const onConfirm = async () => {
    const displayName =
      itemsToDelete.length > 1
        ? `${itemsToDelete.length} systems`
        : itemsToDelete[0].display_name;

    addNotification({
      id: 'remove-initiated',
      variant: 'info',
      title: 'Delete operation initiated',
      description: `Removal of ${displayName} started.`,
      dismissable: true,
    });

    handleModalToggle(false);
    try {
      const result = await deleteSystemsById(selected);

      if (result[0].status === 200) {
        addNotification({
          variant: 'success',
          title: 'Delete operation finished',
          description: `${displayName} has been successfully removed.`,
          dismissable: true,
        });
      }
    } catch (error) {
      console.error(error);

      addNotification({
        variant: 'danger',
        title: 'System failed to be removed from Inventory',
        description:
          'There was an error processing the request. Please try again.',
        dismissable: true,
      });
    }

    resetSelection?.();
    reload?.();
  };

  const dedicatedAction = useMemo(
    // eslint-disable-next-line react/display-name
    () => () => (
      <DedicatedAction
        onClick={() => {
          setIsRowAction && setIsRowAction(false);
          handleModalToggle(true);
        }}
        selected={selected}
      />
    ),
    [handleModalToggle, selected, setIsRowAction],
  );

  return {
    itemsToDelete,
    onConfirm,
    dedicatedAction,
    isModalOpen,
    handleModalToggle,
  };
};

export default useDeleteSystems;
