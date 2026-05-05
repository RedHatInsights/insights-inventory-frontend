import React from 'react';
import type { MenuItemProps } from '@patternfly/react-core';
import {
  MOVE_SYSTEM_MENU_TEXT,
  NO_MOVE_SYSTEM_KESSEL_TOOLTIP_MESSAGE,
} from '../../constants';
import type { Permission } from '../../Utilities/hooks/useConditionalRBAC';
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
  workspaceActionsAllowed = true,
): boolean =>
  !workspaceActionsAllowed || !(row.permissions?.hasWorkspaceEdit ?? false);

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
  selectedHosts.some((host) => !(host.permissions?.hasWorkspaceEdit ?? false));

export type MoveSystemActionDropdownItemProps = Omit<
  MenuItemProps,
  'children'
> & {
  rowId: string;
  /**
   * Must match `useKesselMigrationFeatureFlag()` / parent `isKesselEnabled`. When false, this
   * component renders nothing so the menu cannot show a Kessel-only label without the flag.
   */
  isKesselMigrationEnabled: boolean;
  requiredPermissions?: Permission[];
  noAccessTooltip?: string;
  override?: boolean;
  ignoreResourceDefinitions?: boolean;
  checkAll?: boolean;
};

/**
 * Row kebab item for moving a host to another workspace (InventoryTable / ActionDropdownItem).
 *
 *  @param props - Menu item props; `rowId` is used for the React `key`, RBAC fields match ActionDropdownItem.
 *  @returns     Menu item element, or null when `isKesselMigrationEnabled` is false
 */
export const MoveSystemActionDropdownItem = (
  props: MoveSystemActionDropdownItemProps,
) => {
  const {
    rowId,
    onClick,
    isAriaDisabled,
    requiredPermissions,
    noAccessTooltip,
    override,
    ignoreResourceDefinitions,
    checkAll = false,
    isKesselMigrationEnabled,
    ...rest
  } = props;

  if (!isKesselMigrationEnabled) {
    return null;
  }

  return (
    <ActionDropdownItem
      key={`${rowId}-move-system`}
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
};

/**
 * PatternFly ActionsColumn item (e.g. Systems view table).
 *
 * @remarks Only for the Kessel migration path (`useKesselMigrationFeatureFlag`). Legacy UI should
 * use “Add to workspace” / “Remove from workspace” actions instead.
 *
 *  @param   row     - Row data including optional workspace edit permission flags
 *  @param   onClick - Handler when the action is chosen
 *  @returns         ActionsColumn item descriptor
 */
export const buildMoveSystemActionsColumnItem = (
  row: MoveSystemActionsColumnRow,
  onClick: MenuItemProps['onClick'],
) => {
  const isDisabled = isKesselMoveSystemRowDisabled(row);
  return {
    title: MOVE_SYSTEM_MENU_TEXT,
    onClick,
    isDisabled,
    ...(isDisabled && {
      tooltipProps: { content: NO_MOVE_SYSTEM_KESSEL_TOOLTIP_MESSAGE },
    }),
  };
};
