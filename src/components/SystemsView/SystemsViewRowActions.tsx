import { ActionsColumn } from '@patternfly/react-table';
import React from 'react';
import { System } from './hooks/useSystemsQuery';
import { useSystemActionModalsContext } from './SystemActionModalsContext';
import { useKesselMigrationFeatureFlag } from '../../Utilities/hooks/useKesselMigrationFeatureFlag';
import { useConditionalRBAC } from '../../Utilities/hooks/useConditionalRBAC';
import {
  GENERAL_GROUPS_WRITE_PERMISSION,
  GENERAL_HOSTS_WRITE_PERMISSIONS,
} from '../../constants';
import type { SystemWithPermissions } from '../../Utilities/hooks/useHostIdsWithKessel';
import { hasWorkspace } from './utils/systemHelpers';

interface RowActionsProps {
  system: System | SystemWithPermissions;
}

const SystemsViewRowActions = ({ system }: RowActionsProps) => {
  const isKesselEnabled = useKesselMigrationFeatureFlag();
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
    openEditModal,
  } = useSystemActionModalsContext();

  const permissions = 'permissions' in system ? system.permissions : undefined;

  const hasDelete = permissions?.hasDelete ?? false;

  const rowActions = isKesselEnabled
    ? [
        {
          title: 'Move system',
          onClick: () => openAddToWorkspaceModal([system]),
          isDisabled: !(permissions?.hasWorkspaceEdit ?? false),
        },
        {
          title: 'Edit',
          onClick: () => openEditModal([system]),
          isDisabled: !(permissions?.hasUpdate ?? false),
        },
        { isSeparator: true, itemKey: `${system.id}-divider` },
        {
          title: 'Delete',
          onClick: () => openDeleteModal([system]),
          ...(hasDelete && {
            isDanger: true,
            className: 'pf-v6-u-danger-color-100',
          }),
          isDisabled: !hasDelete,
        },
      ]
    : [
        {
          title: 'Add to workspace',
          onClick: () => openAddToWorkspaceModal([system]),
          isDisabled: !hasGroupsWrite || hasWorkspace(system),
        },
        {
          title: 'Remove from workspace',
          onClick: () => openRemoveFromWorkspaceModal([system]),
          isDisabled: !hasGroupsWrite || !hasWorkspace(system),
        },
        {
          title: 'Edit display name',
          onClick: () => openEditModal([system]),
          isDisabled: !hasHostsWrite,
        },
        {
          title: 'Delete from inventory',
          onClick: () => openDeleteModal([system]),
          isDisabled: !hasHostsWrite,
        },
      ];

  return <ActionsColumn items={rowActions} />;
};

export default SystemsViewRowActions;
