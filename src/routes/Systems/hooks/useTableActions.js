import React, { useCallback } from 'react';
import {
  GENERAL_GROUPS_WRITE_PERMISSION,
  GENERAL_HOSTS_WRITE_PERMISSIONS,
  NO_MODIFY_WORKSPACES_TOOLTIP_MESSAGE,
  NO_MODIFY_WORKSPACE_TOOLTIP_MESSAGE,
  NO_MODIFY_HOST_TOOLTIP_MESSAGE,
  REQUIRED_PERMISSION_TO_MODIFY_HOST_IN_GROUP,
} from '../../../constants';
import { ActionDropdownItem } from '../../../components/InventoryTable/ActionWithRBAC';

// some actions are hidden under feature flag
const useTableActions = (
  setCurrentSystem,
  onEditOpen,
  handleModalToggle,
  setRemoveHostsFromGroupModalOpen,
  setAddHostGroupModalOpen,
  setIsRowAction,
  isKesselEnabled = false,
) => {
  return useCallback(
    ({ item }) => {
      return [
        {
          title: (
            <ActionDropdownItem
              key={`${item.id}-add-to-group`}
              onClick={() => {
                setCurrentSystem(item);
                setIsRowAction && setIsRowAction(true);
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
              key={`${item.id}-remove-from-group`}
              onClick={() => {
                setCurrentSystem(item);
                setIsRowAction && setIsRowAction(true);
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
        {
          title: (
            <ActionDropdownItem
              key={`${item.id}-edit`}
              onClick={() => {
                setCurrentSystem(item);
                onEditOpen(true);
              }}
              requiredPermissions={
                isKesselEnabled
                  ? [
                      REQUIRED_PERMISSION_TO_MODIFY_HOST_IN_GROUP(
                        item.groups?.[0]?.id ?? null,
                      ),
                    ]
                  : [GENERAL_HOSTS_WRITE_PERMISSIONS]
              }
              noAccessTooltip={NO_MODIFY_HOST_TOOLTIP_MESSAGE}
              override={
                isKesselEnabled
                  ? (item.permissions?.hasUpdate ?? false)
                  : undefined
              }
              ignoreResourceDefinitions={!isKesselEnabled}
            >
              Edit display name
            </ActionDropdownItem>
          ),
        },
        {
          title: (
            <ActionDropdownItem
              key={`${item.id}-delete`}
              onClick={() => {
                setCurrentSystem(item);
                setIsRowAction && setIsRowAction(true);
                handleModalToggle(true);
              }}
              requiredPermissions={
                isKesselEnabled
                  ? [
                      REQUIRED_PERMISSION_TO_MODIFY_HOST_IN_GROUP(
                        item?.groups?.[0]?.id,
                      ),
                    ]
                  : [GENERAL_HOSTS_WRITE_PERMISSIONS]
              }
              noAccessTooltip={NO_MODIFY_HOST_TOOLTIP_MESSAGE}
              override={
                isKesselEnabled
                  ? (item.permissions?.hasDelete ?? false)
                  : undefined
              }
              ignoreResourceDefinitions={!isKesselEnabled}
            >
              Delete from inventory
            </ActionDropdownItem>
          ),
        },
      ];
    },
    [
      handleModalToggle,
      onEditOpen,
      setAddHostGroupModalOpen,
      setCurrentSystem,
      setIsRowAction,
      setRemoveHostsFromGroupModalOpen,
      isKesselEnabled,
    ],
  );
};

export default useTableActions;
