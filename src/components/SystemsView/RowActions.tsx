import { ActionsColumn } from '@patternfly/react-table';
import React from 'react';
import { System } from './hooks/useSystemsQuery';
import { hasWorkspace } from './utils/systemHelpers';
import { useSystemsViewModalsContext } from './SystemsViewModalsContext';

interface RowActionsProps {
  system: System;
}

const RowActions = ({ system }: RowActionsProps) => {
  const {
    openDeleteModal,
    openAddToWorkspaceModal,
    openRemoveFromWorkspaceModal,
    openEditModal,
  } = useSystemsViewModalsContext();

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
