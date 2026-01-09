import React, { Fragment } from 'react';
import {
  ResponsiveAction,
  ResponsiveActions,
} from '@patternfly/react-component-groups';
import { SystemsViewExport } from './SystemsViewExport';
import type { System } from './hooks/useSystemsQuery';
import { hasSameWorkspace, hasWorkspace } from './utils/systemHelpers';
import { useSystemsViewModalsContext } from './SystemsViewModalsContext';

interface SystemsViewBulkActionsProps {
  selectedSystems: System[];
  activeState: string;
}

export const SystemsViewBulkActions = ({
  selectedSystems,
  activeState,
}: SystemsViewBulkActionsProps) => {
  const {
    openDeleteModal,
    openAddToWorkspaceModal,
    openRemoveFromWorkspaceModal,
  } = useSystemsViewModalsContext();

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
