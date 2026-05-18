import React from 'react';
import type { MenuItemProps } from '@patternfly/react-core';
import {
  MOVE_SYSTEM_MENU_TEXT,
  NO_MOVE_SYSTEM_KESSEL_TOOLTIP_MESSAGE,
} from '../../constants';
import { ActionDropdownItem } from './ActionWithRBAC';

/**
 * Kessel migration UI only: “Move system(s)” replaces legacy “Add/remove from workspace” when
 * `useKesselMigrationFeatureFlag()` is on. Do not render these exports on the legacy path;
 * use the existing `ActionDropdownItem` + “Add to workspace” / “Remove from workspace” instead.
 *
 * Call sites today: `useTableActions` (group row actions), `GroupSystems`, `SystemsViewRowActions`.
 */

/** Row / selection shape for Kessel move (see `useHostIdsWithKessel` `hasWorkspaceEdit`). */
export interface MoveSystemActionsColumnRow {
  permissions?: {
    hasWorkspaceEdit?: boolean;
  };
}

export const hasWorkspaceEdit = (row: MoveSystemActionsColumnRow): boolean =>
  row.permissions?.hasWorkspaceEdit ?? false;

/**
 * Whether a single-host “Move system” control should be disabled (Kessel path).
 * Matches inventory + Systems view: ungrouped hosts get `hasWorkspaceEdit: true` from
 * `useHostIdsWithKessel`; do not use the workspace-detail `ungrouped` page flag here.
 *
 *  @param row                     - Host row with injected permissions
 *  @param workspaceActionsAllowed - Page-level gate (RBAC / workspace Kessel edit on group detail)
 *  @returns                       True when the action should be disabled
 */
export const isKesselMoveSystemRowDisabled = (
  row: MoveSystemActionsColumnRow,
  workspaceActionsAllowed: boolean,
): boolean => !workspaceActionsAllowed || !hasWorkspaceEdit(row);

/**
 * Whether bulk “Move systems” should be disabled (Kessel path).
 *
 *  @param workspaceActionsAllowed - Page-level gate (RBAC / workspace Kessel edit on group detail)
 *  @param selectedHosts           - Currently selected host rows with injected permissions
 *  @returns                       True when the bulk action should be disabled
 */
export const isKesselBulkMoveSystemsDisabled = (
  workspaceActionsAllowed: boolean,
  selectedHosts: MoveSystemActionsColumnRow[],
): boolean =>
  !workspaceActionsAllowed ||
  selectedHosts.length === 0 ||
  selectedHosts.some((host) => !hasWorkspaceEdit(host));

export type GroupSystemsBulkActionParams = {
  isKesselEnabled: boolean;
  workspaceActionsAllowed: boolean;
  ungrouped: boolean;
  selectedCount: number;
  selectedHosts: MoveSystemActionsColumnRow[];
};

/**
 * Disabled state for workspace-detail bulk remove (legacy) or bulk move (Kessel).
 * Encapsulates the Kessel vs non-Kessel rules used on group detail.
 *  @param root0
 *  @param root0.isKesselEnabled
 *  @param root0.workspaceActionsAllowed
 *  @param root0.ungrouped
 *  @param root0.selectedCount
 *  @param root0.selectedHosts
 */
export const getGroupSystemsBulkActionDisabled = ({
  isKesselEnabled,
  workspaceActionsAllowed,
  ungrouped,
  selectedCount,
  selectedHosts,
}: GroupSystemsBulkActionParams): boolean => {
  if (isKesselEnabled) {
    return isKesselBulkMoveSystemsDisabled(
      workspaceActionsAllowed,
      selectedHosts,
    );
  }

  return ungrouped || !workspaceActionsAllowed || selectedCount === 0;
};

type ActionRBACProps = Pick<
  React.ComponentProps<typeof ActionDropdownItem>,
  | 'requiredPermissions'
  | 'noAccessTooltip'
  | 'override'
  | 'ignoreResourceDefinitions'
  | 'checkAll'
>;

export type MoveSystemActionDropdownItemProps = Omit<
  MenuItemProps,
  'children'
> &
  ActionRBACProps;

/**
 * Row kebab item for moving a host to another workspace (InventoryTable / ActionDropdownItem).
 * Only render when the parent has already gated on `useKesselMigrationFeatureFlag()`.
 *  @param root0
 *  @param root0.onClick
 *  @param root0.isAriaDisabled
 *  @param root0.requiredPermissions
 *  @param root0.noAccessTooltip
 *  @param root0.override
 *  @param root0.ignoreResourceDefinitions
 *  @param root0.checkAll
 */
export const MoveSystemActionDropdownItem = ({
  onClick,
  isAriaDisabled,
  requiredPermissions,
  noAccessTooltip,
  override,
  ignoreResourceDefinitions,
  checkAll = false,
  ...rest
}: MoveSystemActionDropdownItemProps) => (
  <ActionDropdownItem
    onClick={onClick}
    requiredPermissions={requiredPermissions}
    noAccessTooltip={noAccessTooltip}
    isAriaDisabled={isAriaDisabled}
    override={override}
    ignoreResourceDefinitions={ignoreResourceDefinitions}
    checkAll={checkAll}
    {...rest}
  >
    {MOVE_SYSTEM_MENU_TEXT}
  </ActionDropdownItem>
);

/**
 * PatternFly ActionsColumn item (e.g. Systems view table).
 *
 * @remarks Only for the Kessel migration path (`useKesselMigrationFeatureFlag`). Legacy UI should
 * use “Add to workspace” / “Remove from workspace” actions instead.
 *
 *  @param   row                     - Row data including optional workspace edit permission flags
 *  @param   onClick                 - Handler when the action is chosen
 *  @param   workspaceActionsAllowed - Page-level gate; pass true when no workspace-detail gate applies
 *  @returns                         ActionsColumn item descriptor
 */
export const buildMoveSystemActionsColumnItem = (
  row: MoveSystemActionsColumnRow,
  onClick: MenuItemProps['onClick'],
  workspaceActionsAllowed: boolean,
) => {
  const isDisabled = isKesselMoveSystemRowDisabled(
    row,
    workspaceActionsAllowed,
  );
  return {
    title: MOVE_SYSTEM_MENU_TEXT,
    onClick,
    isDisabled,
    ...(isDisabled && {
      tooltipProps: { content: NO_MOVE_SYSTEM_KESSEL_TOOLTIP_MESSAGE },
    }),
  };
};
