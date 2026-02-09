import { ActionsColumn } from '@patternfly/react-table';
import React from 'react';
import { hasWorkspace } from './utils/systemHelpers';
import { useSystemActionModalsContext } from './SystemActionModalsContext';
import { useKesselMigrationFeatureFlag } from '../../Utilities/hooks/useKesselMigrationFeatureFlag';
import { SystemWithPermissions } from '../../Utilities/hooks/useHostIdsWithKessel';

interface RowActionsProps {
  system: SystemWithPermissions;
}

const SystemsViewRowActions = ({ system }: RowActionsProps) => {
  const isKesselEnabled = useKesselMigrationFeatureFlag();
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
      isDisabled: isKesselEnabled
        ? !(system.permissions?.hasUpdate ?? false)
        : false,
    },
    {
      title: 'Delete from inventory',
      onClick: () => openDeleteModal([system]),
      isDisabled: isKesselEnabled
        ? !(system.permissions?.hasDelete ?? false)
        : false,
    },
  ];

  return <ActionsColumn items={rowActions} />;
};

export default SystemsViewRowActions;
