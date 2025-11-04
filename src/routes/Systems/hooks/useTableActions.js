import React, { useCallback } from 'react';
import {
  GENERAL_GROUPS_WRITE_PERMISSION,
  NO_MODIFY_WORKSPACES_TOOLTIP_MESSAGE,
  NO_MODIFY_WORKSPACE_TOOLTIP_MESSAGE,
  NO_MODIFY_HOST_TOOLTIP_MESSAGE,
  REQUIRED_PERMISSIONS_TO_MODIFY_GROUP,
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
) => {
  return useCallback(
    ({ item }) => {
      const isAddtoWorkspaceDisabled = () => {
        return !item.groups[0]?.ungrouped;
      };

      const isRemoveFromWorkspaceDisabled = () => {
        return item.groups[0]?.ungrouped;
      };

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
              isAriaDisabled={isAddtoWorkspaceDisabled(item)} // additional condition for enabling the button
              ignoreResourceDefinitions // to check if there is any groups:write permission (disregarding RD)
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
              requiredPermissions={
                item?.groups?.[0]?.id !== undefined
                  ? REQUIRED_PERMISSIONS_TO_MODIFY_GROUP(item.groups[0].id)
                  : []
              }
              noAccessTooltip={NO_MODIFY_WORKSPACE_TOOLTIP_MESSAGE}
              isAriaDisabled={isRemoveFromWorkspaceDisabled(item)}
              override={item?.groups?.[0]?.id === undefined ? true : undefined} // has access if no group
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
              requiredPermissions={[
                REQUIRED_PERMISSION_TO_MODIFY_HOST_IN_GROUP(
                  item.groups?.[0]?.id ?? null,
                ),
              ]}
              noAccessTooltip={NO_MODIFY_HOST_TOOLTIP_MESSAGE}
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
              requiredPermissions={[
                REQUIRED_PERMISSION_TO_MODIFY_HOST_IN_GROUP(
                  item?.groups?.[0]?.id,
                ),
              ]}
              noAccessTooltip={NO_MODIFY_HOST_TOOLTIP_MESSAGE}
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
    ],
  );
};

export default useTableActions;
