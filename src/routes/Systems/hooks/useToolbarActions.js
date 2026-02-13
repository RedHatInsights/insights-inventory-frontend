import React from 'react';

import { ActionDropdownItem } from '../../../components/InventoryTable/ActionWithRBAC';
import {
  GENERAL_GROUPS_WRITE_PERMISSION,
  NO_MODIFY_WORKSPACES_TOOLTIP_MESSAGE,
} from '../../../constants';

const useToolbarActions = (
  selected,
  setAddHostGroupModalOpen,
  setRemoveHostsFromGroupModalOpen,
  setIsRowAction,
) => {
  const selectedCount = selected?.length ?? 0;

  return [
    {
      label: (
        <ActionDropdownItem
          key="bulk-add-to-group"
          requiredPermissions={[GENERAL_GROUPS_WRITE_PERMISSION]}
          isAriaDisabled={selectedCount === 0}
          noAccessTooltip={NO_MODIFY_WORKSPACES_TOOLTIP_MESSAGE}
          onClick={() => {
            setIsRowAction && setIsRowAction(false);
            setAddHostGroupModalOpen(true);
          }}
          ignoreResourceDefinitions
        >
          Add to workspace
        </ActionDropdownItem>
      ),
    },
    {
      label: (
        <ActionDropdownItem
          key="bulk-remove-from-group"
          requiredPermissions={[GENERAL_GROUPS_WRITE_PERMISSION]}
          isAriaDisabled={selectedCount === 0}
          noAccessTooltip={NO_MODIFY_WORKSPACES_TOOLTIP_MESSAGE}
          onClick={() => {
            setIsRowAction && setIsRowAction(false);
            setRemoveHostsFromGroupModalOpen(true);
          }}
          ignoreResourceDefinitions
        >
          Remove from workspace
        </ActionDropdownItem>
      ),
    },
  ];
};

export default useToolbarActions;
