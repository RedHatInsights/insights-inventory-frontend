import React, { Fragment } from 'react';
import {
  ResponsiveAction,
  ResponsiveActions,
} from '@patternfly/react-component-groups';
import { SystemsViewExport } from './SystemsViewExport';
import type { System } from './hooks/useSystemsQuery';
import { useSystemActionModalsContext } from './SystemActionModalsContext';
import { useColumnManagementModalContext } from './ColumnManagementModalContext';
import { useKesselMigrationFeatureFlag } from '../../Utilities/hooks/useKesselMigrationFeatureFlag';
import useInventoryViewsFeatureFlag from '../../Utilities/useInventoryViewsFeatureFlag';
import { useConditionalRBAC } from '../../Utilities/hooks/useConditionalRBAC';
import {
  GENERAL_GROUPS_WRITE_PERMISSION,
  GENERAL_HOSTS_WRITE_PERMISSIONS,
} from '../../constants';

interface SystemsViewBulkActionsProps {
  selectedSystems: System[];
  activeState: string;
}

export const SystemsViewBulkActions = ({
  selectedSystems,
  activeState,
}: SystemsViewBulkActionsProps) => {
  const isKesselEnabled = useKesselMigrationFeatureFlag();
  const isInventoryViewsEnabled = useInventoryViewsFeatureFlag();
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
  const {
    openDeleteModal,
    openAddToWorkspaceModal,
    openRemoveFromWorkspaceModal,
  } = useSystemActionModalsContext();
  const { openColumnManagementModal } = useColumnManagementModalContext();

  const moveDisabled = activeState !== 'active' || selectedSystems.length === 0;

  return (
    <Fragment>
      <SystemsViewExport />
      {isKesselEnabled ? (
        <ResponsiveActions ouiaId="systems-view-toolbar-actions">
          <ResponsiveAction
            isPersistent
            onClick={() => openAddToWorkspaceModal(selectedSystems)}
            isDisabled={moveDisabled}
          >
            Move
          </ResponsiveAction>
          <ResponsiveAction
            isPersistent
            variant="secondary"
            ouiaId="bulk-delete-button"
            onClick={() => openDeleteModal(selectedSystems)}
            isDisabled={moveDisabled}
          >
            Delete
          </ResponsiveAction>
          {isInventoryViewsEnabled && (
            <ResponsiveAction onClick={() => openColumnManagementModal()}>
              Manage columns
            </ResponsiveAction>
          )}
        </ResponsiveActions>
      ) : (
        <ResponsiveActions ouiaId="systems-view-toolbar-actions">
          <ResponsiveAction
            isPersistent
            ouiaId="bulk-delete-button"
            onClick={() => openDeleteModal(selectedSystems)}
            isDisabled={moveDisabled || !hasHostsWrite}
          >
            Delete
          </ResponsiveAction>
          <ResponsiveAction
            onClick={() => openAddToWorkspaceModal(selectedSystems)}
            isDisabled={moveDisabled || !hasGroupsWrite}
          >
            Add to workspace
          </ResponsiveAction>
          <ResponsiveAction
            onClick={() => openRemoveFromWorkspaceModal(selectedSystems)}
            isDisabled={moveDisabled || !hasGroupsWrite}
          >
            Remove from workspace
          </ResponsiveAction>
          {isInventoryViewsEnabled && (
            <ResponsiveAction onClick={() => openColumnManagementModal()}>
              Manage columns
            </ResponsiveAction>
          )}
        </ResponsiveActions>
      )}
    </Fragment>
  );
};
