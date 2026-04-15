/* eslint-disable jsdoc/check-tag-names */
/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { renderHook } from '@testing-library/react';
import {
  NO_CREATE_WORKSPACE_KESSEL_TOOLTIP_MESSAGE,
  NO_DELETE_SELECTED_WORKSPACES_KESSEL_TOOLTIP_MESSAGE,
  NO_DELETE_WORKSPACE_KESSEL_TOOLTIP_MESSAGE,
  NO_MODIFY_WORKSPACES_TOOLTIP_MESSAGE,
  NO_MODIFY_WORKSPACE_TOOLTIP_MESSAGE,
  NO_RENAME_WORKSPACE_KESSEL_TOOLTIP_MESSAGE,
  NO_WORKSPACE_PERMISSIONS_LOADING_TOOLTIP_MESSAGE,
} from '../../constants';
import { useGroupsTableWorkspaceActionPermissions } from './useGroupsTableWorkspaceActionPermissions';

const mockUseKesselMigrationFeatureFlag = jest.fn();
const mockUseWorkspaceTableRowKesselPermissions = jest.fn();
const mockUseKesselCanCreateWorkspace = jest.fn();

jest.mock('../../Utilities/hooks/useKesselMigrationFeatureFlag', () => ({
  useKesselMigrationFeatureFlag: () => mockUseKesselMigrationFeatureFlag(),
}));

jest.mock('../../Utilities/hooks/useWorkspacesPageKesselPermissions', () => ({
  useWorkspaceTableRowKesselPermissions: (...args) =>
    mockUseWorkspaceTableRowKesselPermissions(...args),
  useKesselCanCreateWorkspace: () => mockUseKesselCanCreateWorkspace(),
}));

describe('useGroupsTableWorkspaceActionPermissions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseKesselMigrationFeatureFlag.mockReturnValue(false);
    mockUseWorkspaceTableRowKesselPermissions.mockReturnValue({
      workspacePermissionById: {},
      permissionsLoading: false,
    });
    mockUseKesselCanCreateWorkspace.mockReturnValue({
      canCreateWorkspace: undefined,
      createPermissionLoading: false,
    });
  });

  describe('when Kessel migration is disabled', () => {
    it('exposes RBAC-style row menu props (no Kessel override)', () => {
      const { result } = renderHook(() =>
        useGroupsTableWorkspaceActionPermissions({
          groups: [{ id: 'g1', ungrouped: false }],
          selectedIds: [],
        }),
      );

      expect(result.current.isKesselMigrationEnabled).toBe(false);
      const rename = result.current.getRowWorkspaceMenuItemProps(
        { groupId: 'g1', ungrouped: false },
        'rename',
      );
      expect(rename.override).toBeUndefined();
      expect(rename.noAccessTooltip).toBe(NO_MODIFY_WORKSPACE_TOOLTIP_MESSAGE);
      expect(rename.isAriaDisabled).toBe(false);
    });

    it('uses RBAC bulk-delete tooltip and no Kessel override', () => {
      const { result } = renderHook(() =>
        useGroupsTableWorkspaceActionPermissions({
          groups: [{ id: 'g1', ungrouped: false }],
          selectedIds: ['g1'],
        }),
      );

      expect(result.current.bulkDeleteMenuItemProps.noAccessTooltip).toBe(
        NO_MODIFY_WORKSPACES_TOOLTIP_MESSAGE,
      );
      expect(result.current.bulkDeleteMenuItemProps.override).toBeUndefined();
      expect(result.current.bulkDeleteMenuItemProps.isKesselGateBusy).toBe(
        false,
      );
    });

    it('uses RBAC create-workspace tooltip', () => {
      const { result } = renderHook(() =>
        useGroupsTableWorkspaceActionPermissions({
          groups: [],
          selectedIds: [],
        }),
      );

      expect(result.current.createWorkspaceButtonProps.noAccessTooltip).toBe(
        NO_MODIFY_WORKSPACES_TOOLTIP_MESSAGE,
      );
      expect(
        result.current.createWorkspaceButtonProps.override,
      ).toBeUndefined();
      expect(result.current.createWorkspaceButtonProps.isAriaDisabled).toBe(
        false,
      );
    });
  });

  describe('when Kessel migration is enabled', () => {
    beforeEach(() => {
      mockUseKesselMigrationFeatureFlag.mockReturnValue(true);
    });

    it('disables row actions while workspace permissions are loading', () => {
      mockUseWorkspaceTableRowKesselPermissions.mockReturnValue({
        workspacePermissionById: {},
        permissionsLoading: true,
      });

      const { result } = renderHook(() =>
        useGroupsTableWorkspaceActionPermissions({
          groups: [{ id: 'g1', ungrouped: false }],
          selectedIds: [],
        }),
      );

      const rename = result.current.getRowWorkspaceMenuItemProps(
        { groupId: 'g1', ungrouped: false },
        'rename',
      );
      expect(rename.isAriaDisabled).toBe(true);
      expect(rename.override).toBe(false);
      expect(rename.noAccessTooltip).toBe(
        NO_WORKSPACE_PERMISSIONS_LOADING_TOOLTIP_MESSAGE,
      );
    });

    it('ungrouped rows omit Kessel override but stay aria-disabled', () => {
      mockUseWorkspaceTableRowKesselPermissions.mockReturnValue({
        workspacePermissionById: { gU: { canEdit: false, canDelete: false } },
        permissionsLoading: false,
      });

      const { result } = renderHook(() =>
        useGroupsTableWorkspaceActionPermissions({
          groups: [{ id: 'gU', ungrouped: true }],
          selectedIds: [],
        }),
      );

      const rename = result.current.getRowWorkspaceMenuItemProps(
        { groupId: 'gU', ungrouped: true },
        'rename',
      );
      expect(rename.override).toBeUndefined();
      expect(rename.isAriaDisabled).toBe(true);
    });

    it('maps rename/delete overrides from workspacePermissionById', () => {
      mockUseWorkspaceTableRowKesselPermissions.mockReturnValue({
        workspacePermissionById: {
          g1: { canEdit: true, canDelete: false },
        },
        permissionsLoading: false,
      });

      const { result } = renderHook(() =>
        useGroupsTableWorkspaceActionPermissions({
          groups: [{ id: 'g1', ungrouped: false }],
          selectedIds: [],
        }),
      );

      const rename = result.current.getRowWorkspaceMenuItemProps(
        { groupId: 'g1', ungrouped: false },
        'rename',
      );
      const del = result.current.getRowWorkspaceMenuItemProps(
        { groupId: 'g1', ungrouped: false },
        'delete',
      );

      expect(rename.override).toBe(true);
      expect(rename.noAccessTooltip).toBe(
        NO_RENAME_WORKSPACE_KESSEL_TOOLTIP_MESSAGE,
      );
      expect(del.override).toBe(false);
      expect(del.noAccessTooltip).toBe(
        NO_DELETE_WORKSPACE_KESSEL_TOOLTIP_MESSAGE,
      );
    });

    it('bulk delete override true only when every selected workspace is deletable', () => {
      mockUseWorkspaceTableRowKesselPermissions.mockReturnValue({
        workspacePermissionById: {
          a: { canEdit: true, canDelete: true },
          b: { canEdit: true, canDelete: false },
        },
        permissionsLoading: false,
      });

      const { result: allOk } = renderHook(() =>
        useGroupsTableWorkspaceActionPermissions({
          groups: [
            { id: 'a', ungrouped: false },
            { id: 'b', ungrouped: false },
          ],
          selectedIds: ['a'],
        }),
      );
      expect(allOk.current.bulkDeleteMenuItemProps.override).toBe(true);

      const { result: mixed } = renderHook(() =>
        useGroupsTableWorkspaceActionPermissions({
          groups: [
            { id: 'a', ungrouped: false },
            { id: 'b', ungrouped: false },
          ],
          selectedIds: ['a', 'b'],
        }),
      );
      expect(mixed.current.bulkDeleteMenuItemProps.override).toBe(false);
      expect(mixed.current.bulkDeleteMenuItemProps.noAccessTooltip).toBe(
        NO_DELETE_SELECTED_WORKSPACES_KESSEL_TOOLTIP_MESSAGE,
      );
    });

    it('bulk delete omits Kessel override when selection is empty or includes ungrouped', () => {
      mockUseWorkspaceTableRowKesselPermissions.mockReturnValue({
        workspacePermissionById: {
          a: { canEdit: true, canDelete: true },
        },
        permissionsLoading: false,
      });

      const { result: empty } = renderHook(() =>
        useGroupsTableWorkspaceActionPermissions({
          groups: [{ id: 'a', ungrouped: false }],
          selectedIds: [],
        }),
      );
      expect(empty.current.bulkDeleteMenuItemProps.override).toBeUndefined();
      expect(
        empty.current.bulkDeleteMenuItemProps.noAccessTooltip,
      ).toBeUndefined();

      const { result: ungrouped } = renderHook(() =>
        useGroupsTableWorkspaceActionPermissions({
          groups: [
            { id: 'a', ungrouped: false },
            { id: 'u', ungrouped: true },
          ],
          selectedIds: ['a', 'u'],
        }),
      );
      expect(
        ungrouped.current.bulkDeleteMenuItemProps.override,
      ).toBeUndefined();
    });

    it('create workspace button reflects Kessel create permission', () => {
      mockUseKesselCanCreateWorkspace.mockReturnValue({
        canCreateWorkspace: true,
        createPermissionLoading: false,
      });

      const { result: allowed } = renderHook(() =>
        useGroupsTableWorkspaceActionPermissions({
          groups: [],
          selectedIds: [],
        }),
      );
      expect(allowed.current.createWorkspaceButtonProps.override).toBe(true);
      expect(allowed.current.createWorkspaceButtonProps.noAccessTooltip).toBe(
        NO_CREATE_WORKSPACE_KESSEL_TOOLTIP_MESSAGE,
      );

      mockUseKesselCanCreateWorkspace.mockReturnValue({
        canCreateWorkspace: false,
        createPermissionLoading: false,
      });
      const { result: denied } = renderHook(() =>
        useGroupsTableWorkspaceActionPermissions({
          groups: [],
          selectedIds: [],
        }),
      );
      expect(denied.current.createWorkspaceButtonProps.override).toBe(false);

      mockUseKesselCanCreateWorkspace.mockReturnValue({
        canCreateWorkspace: false,
        createPermissionLoading: true,
      });
      const { result: loading } = renderHook(() =>
        useGroupsTableWorkspaceActionPermissions({
          groups: [],
          selectedIds: [],
        }),
      );
      expect(loading.current.createWorkspaceButtonProps.isAriaDisabled).toBe(
        true,
      );
      expect(loading.current.createWorkspaceButtonProps.noAccessTooltip).toBe(
        NO_WORKSPACE_PERMISSIONS_LOADING_TOOLTIP_MESSAGE,
      );
    });
  });
});
