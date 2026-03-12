import React, { useCallback } from 'react';
import {
  GENERAL_GROUPS_WRITE_PERMISSION,
  NO_MODIFY_WORKSPACES_TOOLTIP_MESSAGE,
  NO_MODIFY_WORKSPACE_TOOLTIP_MESSAGE,
  NO_MODIFY_HOST_TOOLTIP_MESSAGE,
  REQUIRED_PERMISSION_TO_MODIFY_HOST_IN_GROUP,
} from '../../../constants';
import { ActionDropdownItem } from '../../InventoryTable/ActionWithRBAC';

// Build host row actions (edit, delete). Pure builder, no hook deps.
const buildHostActions = (row, { isKesselEnabled, onEdit, onDelete }) => {
  const groupId = row.groups?.[0]?.id ?? null;

  const baseEditProps = isKesselEnabled
    ? {
        requiredPermissions: [
          REQUIRED_PERMISSION_TO_MODIFY_HOST_IN_GROUP(groupId),
        ],
        noAccessTooltip: NO_MODIFY_HOST_TOOLTIP_MESSAGE,
        override: row.permissions?.hasUpdate ?? false,
      }
    : {
        requiredPermissions: [
          REQUIRED_PERMISSION_TO_MODIFY_HOST_IN_GROUP(groupId),
        ],
        noAccessTooltip: NO_MODIFY_HOST_TOOLTIP_MESSAGE,
      };

  const baseDeleteProps = isKesselEnabled
    ? {
        requiredPermissions: [
          REQUIRED_PERMISSION_TO_MODIFY_HOST_IN_GROUP(row.groups?.[0]?.id),
        ],
        noAccessTooltip: NO_MODIFY_HOST_TOOLTIP_MESSAGE,
        override: row.permissions?.hasDelete ?? false,
      }
    : {
        requiredPermissions: [
          REQUIRED_PERMISSION_TO_MODIFY_HOST_IN_GROUP(groupId),
        ],
        noAccessTooltip: NO_MODIFY_HOST_TOOLTIP_MESSAGE,
      };

  const editAction = {
    title: (
      <ActionDropdownItem
        key={`${row.id}-edit`}
        onClick={onEdit}
        {...baseEditProps}
      >
        {isKesselEnabled ? 'Edit' : 'Edit display name'}
      </ActionDropdownItem>
    ),
  };

  const deleteAction = {
    title: (
      <ActionDropdownItem
        key={`${row.id}-delete`}
        onClick={onDelete}
        {...baseDeleteProps}
      >
        {isKesselEnabled ? 'Delete' : 'Delete from inventory'}
      </ActionDropdownItem>
    ),
    ...(isKesselEnabled && { className: 'pf-v6-u-danger-color-100' }),
  };

  return isKesselEnabled
    ? [
        editAction,
        { isSeparator: true, itemKey: `${row.id}-divider` },
        deleteAction,
      ]
    : [editAction, deleteAction];
};

// Build group/workspace row actions. Pure builder, no hook deps.
const buildGroupActions = (row, { isKesselEnabled, onMove, onRemove }) => {
  const inGroup = row.groups?.[0] && !row.groups[0].ungrouped;
  const isUngrouped = row.groups?.[0]?.ungrouped === true;

  if (isKesselEnabled) {
    return [
      {
        title: (
          <ActionDropdownItem
            key={`${row.id}-move-system`}
            onClick={onMove}
            requiredPermissions={[GENERAL_GROUPS_WRITE_PERMISSION]}
            noAccessTooltip={NO_MODIFY_WORKSPACE_TOOLTIP_MESSAGE}
            isAriaDisabled={!row.permissions?.hasWorkspaceEdit}
          >
            Move system
          </ActionDropdownItem>
        ),
      },
    ];
  }

  return [
    {
      title: (
        <ActionDropdownItem
          key={`${row.id}-add-to-group`}
          onClick={onMove}
          requiredPermissions={[GENERAL_GROUPS_WRITE_PERMISSION]}
          noAccessTooltip={NO_MODIFY_WORKSPACES_TOOLTIP_MESSAGE}
          ignoreResourceDefinitions
          isAriaDisabled={inGroup}
        >
          Add to workspace
        </ActionDropdownItem>
      ),
    },
    {
      title: (
        <ActionDropdownItem
          key={`${row.id}-remove-from-group`}
          onClick={onRemove}
          requiredPermissions={[GENERAL_GROUPS_WRITE_PERMISSION]}
          noAccessTooltip={NO_MODIFY_WORKSPACE_TOOLTIP_MESSAGE}
          ignoreResourceDefinitions
          isAriaDisabled={isUngrouped}
        >
          Remove from workspace
        </ActionDropdownItem>
      ),
    },
  ];
};

const useTableActions = (
  setCurrentSystem,
  onEditOpen,
  handleModalToggle,
  setRemoveHostsFromGroupModalOpen,
  setAddHostGroupModalOpen,
  isKesselEnabled = false,
) => {
  const tableActionsCallback = useCallback(
    (row) => {
      const groupActions = buildGroupActions(row, {
        isKesselEnabled,
        onMove: () => {
          setCurrentSystem([row]);
          setAddHostGroupModalOpen(true);
        },
        onRemove: () => {
          setCurrentSystem([row]);
          setRemoveHostsFromGroupModalOpen(true);
        },
      });

      const hostActions = buildHostActions(row, {
        isKesselEnabled,
        onEdit: () => {
          setCurrentSystem(row);
          onEditOpen(true);
        },
        onDelete: () => {
          setCurrentSystem(row);
          handleModalToggle(true);
        },
      });

      return [...groupActions, ...hostActions];
    },
    [
      isKesselEnabled,
      setCurrentSystem,
      onEditOpen,
      handleModalToggle,
      setRemoveHostsFromGroupModalOpen,
      setAddHostGroupModalOpen,
    ],
  );

  return tableActionsCallback;
};

export default useTableActions;
