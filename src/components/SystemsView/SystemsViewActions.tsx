import React, { Fragment } from 'react';
import {
  ResponsiveAction,
  ResponsiveActions,
} from '@patternfly/react-component-groups';
import { SystemsViewExport } from './SystemsViewExport';
import type { System } from './hooks/useSystemsQuery';
import { hasSameWorkspace, hasWorkspace } from './utils/systemHelpers';

interface SystemsViewActionsProps {
  selectedSystems: System[];
  activeState: string;
  openDeleteModal: (systems: System[]) => void;
  openAddToWorkspaceModal: (systems: System[]) => void;
  openRemoveFromWorkspaceModal: (systems: System[]) => void;
}

export const SystemsViewActions = ({
  selectedSystems,
  activeState,
  openDeleteModal,
  openAddToWorkspaceModal,
  openRemoveFromWorkspaceModal,
}: SystemsViewActionsProps) => {
  return (
    <Fragment>
      <SystemsViewExport />
      <ResponsiveActions ouiaId="systems-view-toolbar-actions">
        <ResponsiveAction
          isPersistent
          onClick={() => openDeleteModal(selectedSystems)}
          isDisabled={activeState !== 'active' || selectedSystems.length === 0}
        >
          Delete
        </ResponsiveAction>
        <ResponsiveAction
          onClick={() => openAddToWorkspaceModal(selectedSystems)}
          isDisabled={
            activeState !== 'active' ||
            selectedSystems.length === 0 ||
            selectedSystems.some(hasWorkspace)
          }
        >
          Add to workspace
        </ResponsiveAction>
        <ResponsiveAction
          onClick={() => openRemoveFromWorkspaceModal(selectedSystems)}
          isDisabled={
            activeState !== 'active' ||
            selectedSystems.length === 0 ||
            !selectedSystems.some(hasWorkspace) ||
            !selectedSystems.every(hasSameWorkspace)
          }
        >
          Remove from workspace
        </ResponsiveAction>
      </ResponsiveActions>
    </Fragment>
  );
};
