import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import React from 'react';
import DeleteModal from '../../Utilities/DeleteModal';
import AddSelectedHostsToGroupModal from '../InventoryGroups/Modals/AddSelectedHostsToGroupModal';
import RemoveHostsFromGroupModal from '../InventoryGroups/Modals/RemoveHostsFromGroupModal';
import MoveSystemsToWorkspaceModal from '../InventoryTable/MoveSystemsToWorkspaceModal';
import type { SystemForWorkspace } from '../InventoryTable/MoveSystemsToWorkspaceModal';
import TextInputModal from '../GeneralInfo/TextInputModal/TextInputModal';
import { useKesselMigrationFeatureFlag } from '../../Utilities/hooks/useKesselMigrationFeatureFlag';
import { useDeleteSystemsMutation } from './hooks/useDeleteSystemsMutation';
import { usePatchSystemsMutation } from './hooks/usePatchSystemsMutation';
import type { System } from './hooks/useSystemsQuery';
import { AllTagsModal } from './TagsModal/AllTagsModal';
import { SingleHostTagsModal } from './TagsModal/SingleHostTagsModal';

type OpenModalFn = (systems: System[]) => void;

export interface OpenTagsModalOptions {
  initialTagSearch?: string;
}

export type OpenTagsModalFn = (
  systems: System[],
  options?: OpenTagsModalOptions,
) => void;

interface SystemActionModalsContextValue {
  openDeleteModal: OpenModalFn;
  openAddToWorkspaceModal: OpenModalFn;
  openRemoveFromWorkspaceModal: OpenModalFn;
  openEditModal: OpenModalFn;
  openTagsModal: OpenTagsModalFn;
}

const SystemActionModalsContext =
  createContext<SystemActionModalsContextValue | null>(null);

/** Exported for tests that need to wrap with a provider */
export { SystemActionModalsContext };

export const useSystemActionModalsContext = () => {
  const context = useContext(SystemActionModalsContext);
  if (!context) {
    throw new Error(
      'hook useSystemActionModalsContext must be used within SystemsViewModalsProvider',
    );
  }
  return context;
};

interface SystemActionModalsProviderProps {
  children: React.ReactNode;
  onSelectionClear?: () => void;
}

export const SystemActionModalsProvider = ({
  children,
  onSelectionClear,
}: SystemActionModalsProviderProps) => {
  const queryClient = useQueryClient();
  const isKesselEnabled = useKesselMigrationFeatureFlag();
  const [systemsForAction, setSystemsForAction] = useState<System[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [addHostGroupModalOpen, setAddHostGroupModalOpen] = useState(false);
  const [moveSystemsToWorkspaceModalOpen, setMoveSystemsToWorkspaceModalOpen] =
    useState(false);
  const [removeHostsFromGroupModalOpen, setRemoveHostsFromGroupModalOpen] =
    useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [tagsModalOpen, setTagsModalOpen] = useState(false);
  const [tagsModalInitialSearch, setTagsModalInitialSearch] = useState('');

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

  const openAddToWorkspaceModal = useCallback(
    (systems: System[]) => {
      setSystemsForAction(systems);
      if (isKesselEnabled) {
        setMoveSystemsToWorkspaceModalOpen(true);
      } else {
        setAddHostGroupModalOpen(true);
      }
    },
    [isKesselEnabled],
  );

  const openRemoveFromWorkspaceModal = useCallback((systems: System[]) => {
    setSystemsForAction(systems);
    setRemoveHostsFromGroupModalOpen(true);
  }, []);

  const openEditModal = useCallback((systems: System[]) => {
    setSystemsForAction(systems);
    setEditModalOpen(true);
  }, []);

  const openTagsModal = useCallback<OpenTagsModalFn>((systems, options) => {
    setSystemsForAction(systems);
    setTagsModalInitialSearch(options?.initialTagSearch ?? '');
    setTagsModalOpen(true);
  }, []);

  const systemsForMoveModal = useMemo(
    () =>
      systemsForAction.filter(
        (s): s is System & { id: string } => typeof s.id === 'string',
      ) as SystemForWorkspace[],
    [systemsForAction],
  );

  const contextValue: SystemActionModalsContextValue = useMemo(
    () => ({
      openDeleteModal,
      openAddToWorkspaceModal,
      openRemoveFromWorkspaceModal,
      openEditModal,
      openTagsModal,
    }),
    [
      openDeleteModal,
      openAddToWorkspaceModal,
      openRemoveFromWorkspaceModal,
      openEditModal,
      openTagsModal,
    ],
  );

  return (
    <SystemActionModalsContext.Provider value={contextValue}>
      {children}
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
      {moveSystemsToWorkspaceModalOpen && (
        <MoveSystemsToWorkspaceModal
          isModalOpen={moveSystemsToWorkspaceModalOpen}
          setIsModalOpen={setMoveSystemsToWorkspaceModalOpen}
          modalState={systemsForMoveModal}
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
      {tagsModalOpen &&
        (systemsForAction.length === 0 ? (
          <AllTagsModal
            isOpen={tagsModalOpen}
            initialTagSearch={tagsModalInitialSearch}
            onClose={() => {
              setTagsModalInitialSearch('');
              setTagsModalOpen(false);
            }}
          />
        ) : (
          <SingleHostTagsModal
            isOpen={tagsModalOpen}
            system={systemsForAction[0]!}
            onClose={() => {
              setTagsModalInitialSearch('');
              setTagsModalOpen(false);
            }}
          />
        ))}
    </SystemActionModalsContext.Provider>
  );
};
