import React from 'react';

import { ActionDropdownItem } from '../../../components/InventoryTable/ActionWithRBAC';
import {
  GENERAL_GROUPS_WRITE_PERMISSION,
  NO_MODIFY_WORKSPACES_TOOLTIP_MESSAGE,
  REQUIRED_PERMISSIONS_TO_MODIFY_GROUP,
} from '../../../constants';
import useFeatureFlag from '../../../Utilities/useFeatureFlag';
import {
  isBulkAddHostsToGroupsEnabled,
  isBulkRemoveFromGroupsEnabled,
} from '../helpers';

const useToolbarActions = (
  selected,
  setAddHostGroupModalOpen,
  setRemoveHostsFromGroupModalOpen,
) => {
  const isKesselEnabled = useFeatureFlag('hbi.kessel-migration');

  // extract remove‐permissions logic
  const removePermissions = selected
    ? selected
        .flatMap(({ groups }) =>
          groups?.[0]?.id != null
            ? REQUIRED_PERMISSIONS_TO_MODIFY_GROUP(groups[0].id)
            : [],
        )
        .filter(Boolean)
    : [];

  // extract the various booleans
  const addIsDisabled = !isBulkAddHostsToGroupsEnabled(
    selected.length,
    selected,
    isKesselEnabled,
  );
  const removeIsDisabled = !isBulkRemoveFromGroupsEnabled(
    selected.length,
    selected,
    isKesselEnabled,
  );
  const removeOverride = selected == null;

  return [
    {
      label: (
        <ActionDropdownItem
          key="bulk-add-to-group"
          requiredPermissions={[GENERAL_GROUPS_WRITE_PERMISSION]}
          isAriaDisabled={addIsDisabled}
          noAccessTooltip={NO_MODIFY_WORKSPACES_TOOLTIP_MESSAGE}
          onClick={() => setAddHostGroupModalOpen(true)}
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
          requiredPermissions={removePermissions}
          isAriaDisabled={removeIsDisabled}
          noAccessTooltip={NO_MODIFY_WORKSPACES_TOOLTIP_MESSAGE}
          onClick={() => setRemoveHostsFromGroupModalOpen(true)}
          {...(removeOverride && { override: true })}
          checkAll
        >
          Remove from workspace
        </ActionDropdownItem>
      ),
    },
  ];
};

export default useToolbarActions;
