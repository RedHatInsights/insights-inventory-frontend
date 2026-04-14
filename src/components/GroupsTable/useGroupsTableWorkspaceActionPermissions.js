import { useCallback, useMemo } from 'react';
import {
  NO_CREATE_WORKSPACE_KESSEL_TOOLTIP_MESSAGE,
  NO_DELETE_SELECTED_WORKSPACES_KESSEL_TOOLTIP_MESSAGE,
  NO_DELETE_WORKSPACE_KESSEL_TOOLTIP_MESSAGE,
  NO_MODIFY_WORKSPACES_TOOLTIP_MESSAGE,
  NO_MODIFY_WORKSPACE_TOOLTIP_MESSAGE,
  NO_RENAME_WORKSPACE_KESSEL_TOOLTIP_MESSAGE,
  NO_WORKSPACE_PERMISSIONS_LOADING_TOOLTIP_MESSAGE,
} from '../../constants';
import { useKesselMigrationFeatureFlag } from '../../Utilities/hooks/useKesselMigrationFeatureFlag';
import {
  useKesselCanCreateWorkspace,
  useWorkspaceTableRowKesselPermissions,
} from '../../Utilities/hooks/useWorkspacesPageKesselPermissions';

/**
 * Row shape from the groups API for workspace permission checks.
 *
 * @typedef {object} GroupsTableWorkspaceGroupRow
 *  @property {string}  [id]
 *  @property {boolean} [ungrouped]
 */

/**
 * Workspace row + toolbar permission wiring for the Workspaces (groups) table.
 *
 * When the Kessel migration feature flag is removed, delete `isKesselMigrationEnabled`
 * branches and keep the Kessel-only paths (or fold `isKesselMigrationEnabled` to `true`
 * at the call site of `useKesselMigrationFeatureFlag`).
 *
 *  @param   {object}                         params             - Hook inputs
 *  @param   {GroupsTableWorkspaceGroupRow[]} params.groups      - Current page of groups from the API
 *  @param   {string[]}                       params.selectedIds - Toolbar bulk selection
 *  @returns {object}                                            Props and helpers for ActionButton / ActionDropdownItem
 */
export const useGroupsTableWorkspaceActionPermissions = ({
  groups,
  selectedIds,
}) => {
  const isKesselMigrationEnabled = useKesselMigrationFeatureFlag();
  const {
    workspacePermissionById,
    permissionsLoading: workspacePermissionsLoading,
  } = useWorkspaceTableRowKesselPermissions(groups);
  const { canCreateWorkspace, createPermissionLoading } =
    useKesselCanCreateWorkspace();

  const kesselGateBusy =
    isKesselMigrationEnabled && workspacePermissionsLoading;

  const rowAccessOverride = useCallback(
    (groupId, kind) => {
      if (!isKesselMigrationEnabled) {
        return undefined;
      }
      if (workspacePermissionsLoading) {
        return false;
      }
      const perms = workspacePermissionById[groupId];
      if (kind === 'rename') {
        return perms?.canEdit === true;
      }
      return perms?.canDelete === true;
    },
    [
      isKesselMigrationEnabled,
      workspacePermissionById,
      workspacePermissionsLoading,
    ],
  );

  const rowAccessTooltip = useCallback(
    (kind) => {
      if (!isKesselMigrationEnabled) {
        return NO_MODIFY_WORKSPACE_TOOLTIP_MESSAGE;
      }
      if (workspacePermissionsLoading) {
        return NO_WORKSPACE_PERMISSIONS_LOADING_TOOLTIP_MESSAGE;
      }
      if (kind === 'rename') {
        return NO_RENAME_WORKSPACE_KESSEL_TOOLTIP_MESSAGE;
      }
      return NO_DELETE_WORKSPACE_KESSEL_TOOLTIP_MESSAGE;
    },
    [isKesselMigrationEnabled, workspacePermissionsLoading],
  );

  /**
   * Props for rename/delete row kebab items (RBAC + optional Kessel override).
   *
   *  @param {object}              rowData - Table row with groupId, groupName, ungrouped
   *  @param {'rename' | 'delete'} kind    - Which menu action
   */
  const getRowWorkspaceMenuItemProps = useCallback(
    (rowData, kind) => ({
      isAriaDisabled: Boolean(rowData?.ungrouped || kesselGateBusy),
      noAccessTooltip: rowAccessTooltip(kind),
      override: rowData?.ungrouped
        ? undefined
        : rowAccessOverride(rowData?.groupId, kind),
    }),
    [kesselGateBusy, rowAccessOverride, rowAccessTooltip],
  );

  const bulkDeleteMenuItemProps = useMemo(() => {
    if (!isKesselMigrationEnabled) {
      return {
        noAccessTooltip: NO_MODIFY_WORKSPACES_TOOLTIP_MESSAGE,
        override: undefined,
        isKesselGateBusy: false,
      };
    }
    if (workspacePermissionsLoading) {
      return {
        noAccessTooltip: NO_WORKSPACE_PERMISSIONS_LOADING_TOOLTIP_MESSAGE,
        override: false,
        isKesselGateBusy: true,
      };
    }
    if (selectedIds.length === 0) {
      return {
        noAccessTooltip: NO_DELETE_SELECTED_WORKSPACES_KESSEL_TOOLTIP_MESSAGE,
        override: undefined,
        isKesselGateBusy: false,
      };
    }
    const selectionHasUngrouped = selectedIds.some((id) =>
      Boolean(groups.find((group) => group.id === id)?.ungrouped),
    );
    if (selectionHasUngrouped) {
      return {
        noAccessTooltip: NO_DELETE_SELECTED_WORKSPACES_KESSEL_TOOLTIP_MESSAGE,
        override: undefined,
        isKesselGateBusy: false,
      };
    }
    const allDeletable = selectedIds.every(
      (id) => workspacePermissionById[id]?.canDelete === true,
    );
    return {
      noAccessTooltip: NO_DELETE_SELECTED_WORKSPACES_KESSEL_TOOLTIP_MESSAGE,
      override: allDeletable,
      isKesselGateBusy: false,
    };
  }, [
    isKesselMigrationEnabled,
    selectedIds,
    workspacePermissionById,
    workspacePermissionsLoading,
    groups,
  ]);

  const createWorkspaceButtonProps = useMemo(() => {
    if (!isKesselMigrationEnabled) {
      return {
        noAccessTooltip: NO_MODIFY_WORKSPACES_TOOLTIP_MESSAGE,
        override: undefined,
        isAriaDisabled: false,
      };
    }
    if (createPermissionLoading) {
      return {
        noAccessTooltip: NO_WORKSPACE_PERMISSIONS_LOADING_TOOLTIP_MESSAGE,
        override: false,
        isAriaDisabled: true,
      };
    }
    return {
      noAccessTooltip: NO_CREATE_WORKSPACE_KESSEL_TOOLTIP_MESSAGE,
      override: canCreateWorkspace === true,
      isAriaDisabled: false,
    };
  }, [isKesselMigrationEnabled, createPermissionLoading, canCreateWorkspace]);

  return {
    isKesselMigrationEnabled,
    getRowWorkspaceMenuItemProps,
    bulkDeleteMenuItemProps,
    createWorkspaceButtonProps,
  };
};
