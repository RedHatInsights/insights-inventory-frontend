import React, { useCallback } from 'react';
import {
  GENERAL_GROUPS_WRITE_PERMISSION,
  GENERAL_HOSTS_WRITE_PERMISSIONS,
  NO_MODIFY_WORKSPACES_TOOLTIP_MESSAGE,
  NO_MODIFY_WORKSPACE_TOOLTIP_MESSAGE,
  NO_MODIFY_HOST_TOOLTIP_MESSAGE,
  REQUIRED_PERMISSION_TO_MODIFY_HOST_IN_GROUP,
} from '../../../constants';
import { ActionDropdownItem } from '../../InventoryTable/ActionWithRBAC';

// some actions are hidden under feature flag
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
      if (isKesselEnabled) {
        const groupActions = [
          {
            title: (
              <ActionDropdownItem
                key={`${row.id}-move-system`}
                onClick={() => {
                  setCurrentSystem([row]);
                  setAddHostGroupModalOpen(true);
                }}
                requiredPermissions={[GENERAL_GROUPS_WRITE_PERMISSION]}
                noAccessTooltip={NO_MODIFY_WORKSPACE_TOOLTIP_MESSAGE}
                ignoreResourceDefinitions
                isAriaDisabled={!row.permissions?.hasWorkspaceEdit}
              >
                Move system
              </ActionDropdownItem>
            ),
          },
        ];
        const hostActions = [
          {
            title: (
              <ActionDropdownItem
                key={`${row.id}-edit`}
                onClick={() => {
                  setCurrentSystem(row);
                  onEditOpen(true);
                }}
                requiredPermissions={[
                  REQUIRED_PERMISSION_TO_MODIFY_HOST_IN_GROUP(
                    row.groups?.[0]?.id ?? null,
                  ),
                ]}
                noAccessTooltip={NO_MODIFY_HOST_TOOLTIP_MESSAGE}
                override={
                  isKesselEnabled
                    ? (row.permissions?.hasUpdate ?? false)
                    : undefined
                }
              >
                Edit
              </ActionDropdownItem>
            ),
          },
          { isSeparator: true, itemKey: `${row.id}-divider` },
          {
            title: (
              <ActionDropdownItem
                key={`${row.id}-delete`}
                onClick={() => {
                  setCurrentSystem(row);
                  handleModalToggle(true);
                }}
                requiredPermissions={[
                  REQUIRED_PERMISSION_TO_MODIFY_HOST_IN_GROUP(
                    row?.groups?.[0]?.id,
                  ),
                ]}
                noAccessTooltip={NO_MODIFY_HOST_TOOLTIP_MESSAGE}
                override={
                  isKesselEnabled
                    ? (row.permissions?.hasDelete ?? false)
                    : undefined
                }
              >
                Delete
              </ActionDropdownItem>
            ),
            className: 'pf-v6-u-danger-color-100',
          },
        ];
        return [...groupActions, ...hostActions];
      }

      const hostActions = [
        {
          title: (
            <ActionDropdownItem
              key={`${row.id}-edit`}
              onClick={() => {
                setCurrentSystem(row);
                onEditOpen(true);
              }}
              requiredPermissions={[GENERAL_HOSTS_WRITE_PERMISSIONS]}
              noAccessTooltip={NO_MODIFY_HOST_TOOLTIP_MESSAGE}
              ignoreResourceDefinitions
            >
              Edit display name
            </ActionDropdownItem>
          ),
        },
        {
          title: (
            <ActionDropdownItem
              key={`${row.id}-delete`}
              onClick={() => {
                setCurrentSystem(row);
                handleModalToggle(true);
              }}
              requiredPermissions={[GENERAL_HOSTS_WRITE_PERMISSIONS]}
              noAccessTooltip={NO_MODIFY_HOST_TOOLTIP_MESSAGE}
              ignoreResourceDefinitions
            >
              Delete from inventory
            </ActionDropdownItem>
          ),
        },
      ];

      const groupActions = [
        {
          title: (
            <ActionDropdownItem
              key={`${row.id}-add-to-group`}
              onClick={() => {
                setCurrentSystem([row]);
                setAddHostGroupModalOpen(true);
              }}
              requiredPermissions={[GENERAL_GROUPS_WRITE_PERMISSION]}
              noAccessTooltip={NO_MODIFY_WORKSPACES_TOOLTIP_MESSAGE}
              ignoreResourceDefinitions
            >
              Add to workspace
            </ActionDropdownItem>
          ),
        },
        {
          title: (
            <ActionDropdownItem
              key={`${row.id}-remove-from-group`}
              onClick={() => {
                setCurrentSystem([row]);
                setRemoveHostsFromGroupModalOpen(true);
              }}
              requiredPermissions={[GENERAL_GROUPS_WRITE_PERMISSION]}
              noAccessTooltip={NO_MODIFY_WORKSPACE_TOOLTIP_MESSAGE}
              ignoreResourceDefinitions
            >
              Remove from workspace
            </ActionDropdownItem>
          ),
        },
      ];

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
