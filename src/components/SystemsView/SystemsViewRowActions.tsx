import { ActionsColumn } from '@patternfly/react-table';
import React from 'react';
import { System } from './hooks/useSystemsQuery';
import { hasWorkspace } from './utils/systemHelpers';
import { useSystemActionModalsContext } from './SystemActionModalsContext';

interface RowActionsProps {
  system: System;
}

const SystemsViewRowActions = ({ system }: RowActionsProps) => {
  const {
    openDeleteModal,
    openAddToWorkspaceModal,
    openRemoveFromWorkspaceModal,
    openEditModal,
  } = useSystemActionModalsContext();

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

export default SystemsViewRowActions;
