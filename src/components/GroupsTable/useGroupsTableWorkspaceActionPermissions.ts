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

/** Row shape from the groups API for workspace permission checks. */
export type GroupsTableWorkspaceGroupRow = {
  id?: string;
  ungrouped?: boolean;
};

export type WorkspaceMenuItemKind = 'rename' | 'delete';

export type GroupsTableWorkspaceRowData = {
  groupId?: string;
  ungrouped?: boolean;
};

export type RowWorkspaceMenuItemProps = {
  isAriaDisabled: boolean;
  noAccessTooltip: string;
  override: boolean | undefined;
};

export type BulkDeleteMenuItemProps = {
  noAccessTooltip: string | undefined;
  override?: boolean | undefined;
  isKesselGateBusy?: boolean;
};

export type CreateWorkspaceButtonProps = {
  noAccessTooltip: string;
  override: boolean | undefined;
  isAriaDisabled: boolean;
};

export type UseGroupsTableWorkspaceActionPermissionsParams = {
  groups: GroupsTableWorkspaceGroupRow[];
  selectedIds: string[];
};

type CreateWorkspaceMode = 'legacy' | 'loading' | 'ready';

/**
 * Workspace row + toolbar permission wiring for the Workspaces (groups) table.
 *
 * When the Kessel migration feature flag is removed, delete `isKesselMigrationEnabled`
 * branches and keep the Kessel-only paths (or fold `isKesselMigrationEnabled` to `true`
 * at the call site of `useKesselMigrationFeatureFlag`).
 *  @param root0
 *  @param root0.groups
 *  @param root0.selectedIds
 */
export const useGroupsTableWorkspaceActionPermissions = ({
  groups,
  selectedIds,
}: UseGroupsTableWorkspaceActionPermissionsParams) => {
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
    (
      groupId: string | undefined,
      kind: WorkspaceMenuItemKind,
    ): boolean | undefined => {
      if (!isKesselMigrationEnabled) {
        return undefined;
      }
      if (workspacePermissionsLoading) {
        return false;
      }
      const perms = groupId ? workspacePermissionById[groupId] : undefined;
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
    (kind: WorkspaceMenuItemKind): string => {
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

  const isRowActionDisabled = useCallback(
    (rowData: GroupsTableWorkspaceRowData | undefined) =>
      Boolean(rowData?.ungrouped || kesselGateBusy),
    [kesselGateBusy],
  );

  const getRowWorkspaceMenuItemProps = useCallback(
    (
      rowData: GroupsTableWorkspaceRowData | undefined,
      kind: WorkspaceMenuItemKind,
    ): RowWorkspaceMenuItemProps => ({
      isAriaDisabled: isRowActionDisabled(rowData),
      noAccessTooltip: rowAccessTooltip(kind),
      override: rowData?.ungrouped
        ? undefined
        : rowAccessOverride(rowData?.groupId, kind),
    }),
    [isRowActionDisabled, rowAccessOverride, rowAccessTooltip],
  );

  const selectionHasUngrouped = useCallback(
    () =>
      selectedIds.some((id) =>
        Boolean(groups.find((group) => group.id === id)?.ungrouped),
      ),
    [selectedIds, groups],
  );

  const allSelectedDeletable = useCallback(
    () =>
      selectedIds.every(
        (id) => workspacePermissionById[id]?.canDelete === true,
      ),
    [selectedIds, workspacePermissionById],
  );

  const bulkDeleteMenuItemProps = useMemo((): BulkDeleteMenuItemProps => {
    const kesselBulkDeleteBase: BulkDeleteMenuItemProps = {
      noAccessTooltip: NO_DELETE_SELECTED_WORKSPACES_KESSEL_TOOLTIP_MESSAGE,
      isKesselGateBusy: false,
    };

    if (!isKesselMigrationEnabled) {
      return {
        ...kesselBulkDeleteBase,
        noAccessTooltip: NO_MODIFY_WORKSPACES_TOOLTIP_MESSAGE,
        override: undefined,
      };
    }

    if (workspacePermissionsLoading) {
      return {
        ...kesselBulkDeleteBase,
        noAccessTooltip: NO_WORKSPACE_PERMISSIONS_LOADING_TOOLTIP_MESSAGE,
        override: false,
        isKesselGateBusy: true,
      };
    }

    if (!selectedIds.length) {
      return {
        noAccessTooltip: undefined,
        override: undefined,
        isKesselGateBusy: false,
      };
    }

    if (selectionHasUngrouped()) {
      return { ...kesselBulkDeleteBase, override: undefined };
    }

    return {
      ...kesselBulkDeleteBase,
      override: allSelectedDeletable(),
    };
  }, [
    isKesselMigrationEnabled,
    workspacePermissionsLoading,
    selectedIds,
    selectionHasUngrouped,
    allSelectedDeletable,
  ]);

  const createMode: CreateWorkspaceMode = !isKesselMigrationEnabled
    ? 'legacy'
    : createPermissionLoading
      ? 'loading'
      : 'ready';

  const createWorkspaceButtonProps = useMemo((): CreateWorkspaceButtonProps => {
    switch (createMode) {
      case 'legacy':
        return {
          noAccessTooltip: NO_MODIFY_WORKSPACES_TOOLTIP_MESSAGE,
          override: undefined,
          isAriaDisabled: false,
        };
      case 'loading':
        return {
          noAccessTooltip: NO_WORKSPACE_PERMISSIONS_LOADING_TOOLTIP_MESSAGE,
          override: false,
          isAriaDisabled: true,
        };
      case 'ready':
      default:
        return {
          noAccessTooltip: NO_CREATE_WORKSPACE_KESSEL_TOOLTIP_MESSAGE,
          override: canCreateWorkspace === true,
          isAriaDisabled: false,
        };
    }
  }, [createMode, canCreateWorkspace]);

  return {
    isKesselMigrationEnabled,
    getRowWorkspaceMenuItemProps,
    bulkDeleteMenuItemProps,
    createWorkspaceButtonProps,
  };
};
