import React, { useCallback, useMemo, useRef, useState } from 'react';
import DeleteModal from '../../../Utilities/DeleteModal';
import { useConditionalRBAC } from '../../../Utilities/hooks/useConditionalRBAC';
import { useKesselMigrationFeatureFlag } from '../../../Utilities/hooks/useKesselMigrationFeatureFlag';
import {
  GENERAL_GROUPS_WRITE_PERMISSION,
  GENERAL_HOSTS_WRITE_PERMISSIONS,
} from '../../../constants';
import AddSelectedHostsToGroupModal from '../../InventoryGroups/Modals/AddSelectedHostsToGroupModal';
import RemoveHostsFromGroupModal from '../../InventoryGroups/Modals/RemoveHostsFromGroupModal';
import MoveSystemsToWorkspaceModal from '../../InventoryTable/MoveSystemsToWorkspaceModal';
import type { SystemForWorkspace } from '../../InventoryTable/MoveSystemsToWorkspaceModal';
import TextInputModal from '../../GeneralInfo/TextInputModal/TextInputModal';
import type {
  ActionHelpers,
  ActionSpec,
  SystemsViewRowAction,
} from '../../SystemsView/actions/types';
import { useDeleteSystemsMutation } from '../../SystemsView/hooks/useDeleteSystemsMutation';
import { usePatchSystemsMutation } from '../../SystemsView/hooks/usePatchSystemsMutation';
import type { System } from '../hostsQueryOptions';
import { buildBulkActions, buildRowActions } from './buildActions';
import type { ActionItem } from './types';

export type ActionsRenderProps<TItem extends ActionItem> = {
  bulkActions: readonly ActionSpec<TItem>[];
  rowActions: readonly SystemsViewRowAction<TItem>[];
};

export type ActionsProps<TItem extends ActionItem> = {
  children: (actions: ActionsRenderProps<TItem>) => React.ReactNode;
};

/**
 * Inventory consumer of the SystemsView actions API: owns delete / move / edit /
 * workspace modals and builds Kessel vs legacy action definitions.
 *
 *  @param props          - Wrapper that supplies action definitions to SystemsView
 *  @param props.children - Renders the table with bulkActions and rowActions
 *  @returns              The child view plus inventory action modals
 */
export function Actions<TItem extends ActionItem>({
  children,
}: ActionsProps<TItem>) {
  const isKesselEnabled = useKesselMigrationFeatureFlag();
  const { hasAccess: hasGroupsWrite } = useConditionalRBAC(
    [GENERAL_GROUPS_WRITE_PERMISSION],
    false,
    false,
  );
  const { hasAccess: hasHostsWrite } = useConditionalRBAC(
    [GENERAL_HOSTS_WRITE_PERMISSIONS],
    false,
    false,
  );

  const actionHelpersRef = useRef<ActionHelpers | null>(null);
  const [systemsForAction, setSystemsForAction] = useState<TItem[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [addHostGroupModalOpen, setAddHostGroupModalOpen] = useState(false);
  const [moveSystemsToWorkspaceModalOpen, setMoveSystemsToWorkspaceModalOpen] =
    useState(false);
  const [removeHostsFromGroupModalOpen, setRemoveHostsFromGroupModalOpen] =
    useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const beginAction = useCallback(
    (items: TItem[], actionHelpers: ActionHelpers) => {
      actionHelpersRef.current = actionHelpers;
      setSystemsForAction(items);
    },
    [],
  );

  const onInvalidate = useCallback(async () => {
    await actionHelpersRef.current?.invalidateQuery();
  }, []);

  const onSelectionClear = useCallback(() => {
    actionHelpersRef.current?.clearSelection();
  }, []);

  const reloadData = useCallback(async () => {
    onSelectionClear();
    await onInvalidate();
  }, [onInvalidate, onSelectionClear]);

  const systems = systemsForAction as unknown as System[];

  const { onDeleteConfirm } = useDeleteSystemsMutation({
    systems,
    onInvalidate,
    onSuccess: onSelectionClear,
    onMutate: () => {
      setIsDeleteModalOpen(false);
    },
  });

  const { onPatchConfirm } = usePatchSystemsMutation({
    systems,
    onInvalidate,
    onSuccess: onSelectionClear,
    onMutate: () => {
      setEditModalOpen(false);
    },
  });

  const onDelete = useCallback(
    (items: TItem[], actionHelpers: ActionHelpers) => {
      beginAction(items, actionHelpers);
      setIsDeleteModalOpen(true);
    },
    [beginAction],
  );

  const onMove = useCallback(
    (items: TItem[], actionHelpers: ActionHelpers) => {
      beginAction(items, actionHelpers);
      setMoveSystemsToWorkspaceModalOpen(true);
    },
    [beginAction],
  );

  const onAddToWorkspace = useCallback(
    (items: TItem[], actionHelpers: ActionHelpers) => {
      beginAction(items, actionHelpers);
      setAddHostGroupModalOpen(true);
    },
    [beginAction],
  );

  const onRemoveFromWorkspace = useCallback(
    (items: TItem[], actionHelpers: ActionHelpers) => {
      beginAction(items, actionHelpers);
      setRemoveHostsFromGroupModalOpen(true);
    },
    [beginAction],
  );

  const onEdit = useCallback(
    (items: TItem[], actionHelpers: ActionHelpers) => {
      beginAction(items, actionHelpers);
      setEditModalOpen(true);
    },
    [beginAction],
  );

  const callbacks = useMemo(
    () => ({
      onDelete,
      onMove,
      onAddToWorkspace,
      onRemoveFromWorkspace,
      onEdit,
    }),
    [onDelete, onMove, onAddToWorkspace, onRemoveFromWorkspace, onEdit],
  );

  const bulkActions = useMemo(
    () =>
      buildBulkActions<TItem>({
        isKesselEnabled,
        hasGroupsWrite,
        hasHostsWrite,
        callbacks,
      }),
    [callbacks, hasGroupsWrite, hasHostsWrite, isKesselEnabled],
  );

  const rowActions = useMemo(
    () =>
      buildRowActions<TItem>({
        isKesselEnabled,
        hasGroupsWrite,
        hasHostsWrite,
        callbacks,
      }),
    [callbacks, hasGroupsWrite, hasHostsWrite, isKesselEnabled],
  );

  const systemsForMoveModal = useMemo(
    () =>
      systemsForAction.filter(
        (s): s is TItem & { id: string } => typeof s.id === 'string',
      ) as SystemForWorkspace[],
    [systemsForAction],
  );

  return (
    <>
      {children({ bulkActions, rowActions })}
      {isDeleteModalOpen && (
        <DeleteModal
          handleModalToggle={setIsDeleteModalOpen}
          isModalOpen={isDeleteModalOpen}
          currentSystems={systems}
          onConfirm={onDeleteConfirm}
        />
      )}
      {addHostGroupModalOpen && (
        <AddSelectedHostsToGroupModal
          isModalOpen={addHostGroupModalOpen}
          setIsModalOpen={setAddHostGroupModalOpen}
          modalState={systems}
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
          modalState={systems}
          reloadData={reloadData}
        />
      )}
      {editModalOpen && (
        <TextInputModal
          title="Edit display name"
          isOpen={editModalOpen}
          value={systems[0]?.display_name}
          onCancel={() => setEditModalOpen(false)}
          onSubmit={onPatchConfirm}
        />
      )}
    </>
  );
}
