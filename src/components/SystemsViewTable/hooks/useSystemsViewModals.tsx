import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import DeleteModal from '../../../Utilities/DeleteModal';
import AddSelectedHostsToGroupModal from '../../InventoryGroups/Modals/AddSelectedHostsToGroupModal';
import RemoveHostsFromGroupModal from '../../InventoryGroups/Modals/RemoveHostsFromGroupModal';
import TextInputModal from '../../GeneralInfo/TextInputModal/TextInputModal';
import { useDeleteSystemsMutation } from './useDeleteSystemsMutation';
import { usePatchSystemsMutation } from './usePatchSystemsMutation';
import type { System } from './useSystemsQuery';
import React from 'react';

export const useSystemsViewModals = (onSelectionClear?: () => void) => {
  const queryClient = useQueryClient();
  const [systemsForAction, setSystemsForAction] = useState<System[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [addHostGroupModalOpen, setAddHostGroupModalOpen] = useState(false);
  const [removeHostsFromGroupModalOpen, setRemoveHostsFromGroupModalOpen] =
    useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const { onDeleteConfirm } = useDeleteSystemsMutation({
    systems: systemsForAction,
    onSuccess: () => {
      onSelectionClear?.();
    },
    onMutate: () => {
      setIsDeleteModalOpen(false);
    },
  });

  const { onPatchConfirm } = usePatchSystemsMutation({
    systems: systemsForAction,
    onSuccess: () => {
      onSelectionClear?.();
    },
    onMutate: () => {
      setEditModalOpen(false);
    },
  });

  const reloadData = async () => {
    onSelectionClear?.();
    await queryClient.invalidateQueries({ queryKey: ['systems'] });
  };

  const openDeleteModal = useCallback((systems: System[]) => {
    setSystemsForAction(systems);
    setIsDeleteModalOpen(true);
  }, []);

  const openAddToWorkspaceModal = useCallback((systems: System[]) => {
    setSystemsForAction(systems);
    setAddHostGroupModalOpen(true);
  }, []);

  const openRemoveFromWorkspaceModal = useCallback((systems: System[]) => {
    setSystemsForAction(systems);
    setRemoveHostsFromGroupModalOpen(true);
  }, []);

  const openEditModal = useCallback((systems: System[]) => {
    setSystemsForAction(systems);
    setEditModalOpen(true);
  }, []);

  const modals = (
    <>
      {isDeleteModalOpen && (
        <DeleteModal
          handleModalToggle={setIsDeleteModalOpen}
          isModalOpen={isDeleteModalOpen}
          currentSystems={systemsForAction}
          onConfirm={onDeleteConfirm}
        />
      )}

      {addHostGroupModalOpen && (
        <AddSelectedHostsToGroupModal
          isModalOpen={addHostGroupModalOpen}
          setIsModalOpen={setAddHostGroupModalOpen}
          modalState={systemsForAction}
          reloadData={reloadData}
        />
      )}

      {removeHostsFromGroupModalOpen && (
        <RemoveHostsFromGroupModal
          isModalOpen={removeHostsFromGroupModalOpen}
          setIsModalOpen={setRemoveHostsFromGroupModalOpen}
          modalState={systemsForAction}
          reloadData={reloadData}
        />
      )}

      {editModalOpen && (
        <TextInputModal
          title="Edit display name"
          isOpen={editModalOpen}
          value={systemsForAction[0]?.display_name}
          onCancel={() => setEditModalOpen(false)}
          onSubmit={onPatchConfirm}
        />
      )}
    </>
  );

  return {
    openDeleteModal,
    openAddToWorkspaceModal,
    openRemoveFromWorkspaceModal,
    openEditModal,
    modals,
  };
};
