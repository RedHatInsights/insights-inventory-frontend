import { ActionsColumn } from '@patternfly/react-table';
import React from 'react';
import { System } from './hooks/useSystemsQuery';
import { hasWorkspace } from './utils/systemHelpers';

interface RowActionsProps {
  system: System;
  openAddToWorkspaceModal: (systems: System[]) => void;
  openRemoveFromWorkspaceModal: (systems: System[]) => void;
  openEditModal: (systems: System[]) => void;
  openDeleteModal: (systems: System[]) => void;
}

const RowActions: React.FC<RowActionsProps> = ({
  system,
  openAddToWorkspaceModal,
  openRemoveFromWorkspaceModal,
  openEditModal,
  openDeleteModal,
}) => {
  const rowActions = [
    {
      title: 'Add to workspace',
      onClick: () => openAddToWorkspaceModal([system]),
      isDisabled: hasWorkspace(system),
    },
    {
      title: 'Remove from workspace',
      onClick: () => openRemoveFromWorkspaceModal([system]),
      isDisabled: !hasWorkspace(system),
    },
    {
      title: 'Edit display name',
      onClick: () => openEditModal([system]),
    },
    {
      title: 'Delete from inventory',
      onClick: () => openDeleteModal([system]),
    },
  ];

  return <ActionsColumn items={rowActions} />;
};

export default RowActions;
