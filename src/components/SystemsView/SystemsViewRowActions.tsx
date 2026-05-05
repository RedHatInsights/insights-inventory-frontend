import { ActionsColumn } from '@patternfly/react-table';
import React from 'react';
import { System } from './hooks/useSystemsQuery';
import { useSystemActionModalsContext } from './SystemActionModalsContext';
import { useKesselMigrationFeatureFlag } from '../../Utilities/hooks/useKesselMigrationFeatureFlag';
import { useConditionalRBAC } from '../../Utilities/hooks/useConditionalRBAC';
import {
  GENERAL_GROUPS_WRITE_PERMISSION,
  GENERAL_HOSTS_WRITE_PERMISSIONS,
  NO_MODIFY_HOST_TOOLTIP_MESSAGE,
  NO_MODIFY_WORKSPACE_TOOLTIP_MESSAGE,
  NO_MODIFY_WORKSPACES_TOOLTIP_MESSAGE,
} from '../../constants';
import type { SystemWithPermissions } from '../../Utilities/hooks/useHostIdsWithKessel';
import { hasWorkspace } from './utils/systemHelpers';
import {
  buildMoveSystemActionsColumnItem,
  type MoveSystemActionsColumnRow,
} from '../InventoryTable/moveSystemRowAction';

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
  const canUpdate = permissions?.hasUpdate ?? false;

  const addToWorkspaceDisabled = !hasGroupsWrite || hasWorkspace(system);
  const removeFromWorkspaceDisabled = !hasGroupsWrite || !hasWorkspace(system);

  const moveSystemRow: MoveSystemActionsColumnRow = { permissions };

  const rowActions = isKesselEnabled
    ? [
        buildMoveSystemActionsColumnItem(moveSystemRow, () =>
          openAddToWorkspaceModal([system]),
        ),
        {
          title: 'Edit',
          onClick: () => openEditModal([system]),
          ...(!canUpdate && {
            isAriaDisabled: true,
            tooltipProps: { content: NO_MODIFY_HOST_TOOLTIP_MESSAGE },
          }),
        },
        { isSeparator: true, itemKey: `${system.id}-divider` },
        {
          title: 'Delete',
          onClick: () => openDeleteModal([system]),
          ...(hasDelete && {
            isDanger: true,
            className: 'pf-v6-u-danger-color-100',
          }),
          ...(!hasDelete && {
            isAriaDisabled: true,
            tooltipProps: { content: NO_MODIFY_HOST_TOOLTIP_MESSAGE },
          }),
        },
      ]
    : [
        {
          title: 'Add to workspace',
          onClick: () => openAddToWorkspaceModal([system]),
          ...(!hasGroupsWrite
            ? {
                isAriaDisabled: true,
                tooltipProps: {
                  content: NO_MODIFY_WORKSPACES_TOOLTIP_MESSAGE,
                },
              }
            : addToWorkspaceDisabled
              ? { isDisabled: true }
              : { isDisabled: false }),
        },
        {
          title: 'Remove from workspace',
          onClick: () => openRemoveFromWorkspaceModal([system]),
          ...(!hasGroupsWrite
            ? {
                isAriaDisabled: true,
                tooltipProps: {
                  content: NO_MODIFY_WORKSPACE_TOOLTIP_MESSAGE,
                },
              }
            : removeFromWorkspaceDisabled
              ? { isDisabled: true }
              : { isDisabled: false }),
        },
        {
          title: 'Edit display name',
          onClick: () => openEditModal([system]),
          ...(!hasHostsWrite
            ? {
                isAriaDisabled: true,
                tooltipProps: { content: NO_MODIFY_HOST_TOOLTIP_MESSAGE },
              }
            : { isDisabled: false }),
        },
        {
          title: 'Delete from inventory',
          onClick: () => openDeleteModal([system]),
          ...(!hasHostsWrite
            ? {
                isAriaDisabled: true,
                tooltipProps: { content: NO_MODIFY_HOST_TOOLTIP_MESSAGE },
              }
            : { isDisabled: false }),
        },
      ];

  return <ActionsColumn items={rowActions} />;
};

export default SystemsViewRowActions;
