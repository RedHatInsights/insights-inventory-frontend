/**
 * Kessel migration UI only: “Move system(s)” replaces legacy “Add/remove from workspace” when
 * `useKesselMigrationFeatureFlag()` is on. Do not render on the legacy path; use
 * `ActionDropdownItem` + “Add to workspace” / “Remove from workspace” instead.
 *
 * Call sites: `useTableActions`, `GroupSystems` (`groupSystemsActions.js`).
 */
import React from 'react';
import type { MenuItemProps } from '@patternfly/react-core';
import { MOVE_SYSTEM_MENU_TEXT } from '../../constants';
import { ActionDropdownItem } from './ActionWithRBAC';

type ActionRBACProps = Partial<
  Pick<
    React.ComponentProps<typeof ActionDropdownItem>,
    | 'requiredPermissions'
    | 'noAccessTooltip'
    | 'override'
    | 'ignoreResourceDefinitions'
    | 'checkAll'
  >
>;

export type MoveSystemActionDropdownItemProps = Omit<
  MenuItemProps,
  'children'
> &
  ActionRBACProps;

/**
 * Row kebab item for moving a host to another workspace (InventoryTable / ActionDropdownItem).
 * Only render when the parent has already gated on `useKesselMigrationFeatureFlag()`.
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
