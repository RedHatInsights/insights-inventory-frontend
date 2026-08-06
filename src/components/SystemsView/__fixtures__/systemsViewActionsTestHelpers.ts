import { expect, jest } from '@jest/globals';
import { screen } from '@testing-library/react';
import {
  GENERAL_GROUPS_WRITE_PERMISSION,
  GENERAL_HOSTS_WRITE_PERMISSIONS,
} from '../../../constants';
import type { SystemWithPermissions } from '../../../Utilities/hooks/useHostIdsWithKessel';
import type { System } from '../../InventoryViews/hooks/useHostsQuery';

export const mockUseKesselMigrationFeatureFlag = jest.fn();

jest.mock('../../../Utilities/hooks/useKesselMigrationFeatureFlag', () => ({
  useKesselMigrationFeatureFlag: () => mockUseKesselMigrationFeatureFlag(),
}));

jest.mock('../../../Utilities/hooks/useConditionalRBAC', () => ({
  useConditionalRBAC: jest.fn(() => ({ hasAccess: false })),
}));

const baseTestSystem = {
  id: 'host-1',
  display_name: 'My Host',
  groups: [] as System['groups'],
  org_id: 'test-org',
};

export const testWorkspaceGroup = {
  id: 'g1',
  name: 'Workspace A',
  ungrouped: false,
} as const;

export const mockOpenDeleteModal = jest.fn();
export const mockOpenAddToWorkspaceModal = jest.fn();
export const mockOpenMoveSystemsToWorkspaceModal = jest.fn();
export const mockOpenRemoveFromWorkspaceModal = jest.fn();
export const mockOpenEditModal = jest.fn();
export const mockOpenTagsModal = jest.fn();

export const mockSystemActionModalsContextValue = {
  openDeleteModal: mockOpenDeleteModal,
  openAddToWorkspaceModal: mockOpenAddToWorkspaceModal,
  openMoveSystemsToWorkspaceModal: mockOpenMoveSystemsToWorkspaceModal,
  openRemoveFromWorkspaceModal: mockOpenRemoveFromWorkspaceModal,
  openEditModal: mockOpenEditModal,
  openTagsModal: mockOpenTagsModal,
};

export function createSystem(systemOverrides: Partial<System> = {}): System {
  return { ...baseTestSystem, ...systemOverrides };
}

export function createSystemWithPermissions(
  permissions: SystemWithPermissions['permissions'],
  systemOverrides: Partial<System> = {},
): SystemWithPermissions {
  return {
    ...baseTestSystem,
    ...systemOverrides,
    permissions,
  } as unknown as SystemWithPermissions;
}

export function setConditionalRBAC(
  hasGroupsWrite: boolean,
  hasHostsWrite: boolean,
) {
  const useConditionalRBACMock =
    require('../../../Utilities/hooks/useConditionalRBAC')
      .useConditionalRBAC as jest.Mock;
  useConditionalRBACMock.mockImplementation((...args: unknown[]) => {
    const permissions = args[0] as string[];
    if (permissions.includes(GENERAL_GROUPS_WRITE_PERMISSION)) {
      return { hasAccess: hasGroupsWrite };
    }
    if (permissions.includes(GENERAL_HOSTS_WRITE_PERMISSIONS)) {
      return { hasAccess: hasHostsWrite };
    }
    return { hasAccess: false };
  });
}

export function expectMenuItemDisabled(name: string | RegExp) {
  const item = screen.getByRole('menuitem', { name });
  expect(item).toBeInTheDocument();
  expect(
    item.hasAttribute('aria-disabled') ||
      item.hasAttribute('disabled') ||
      item.className.includes('disabled'),
  ).toBe(true);
}

export function resetSystemActionModalMocks() {
  mockOpenDeleteModal.mockClear();
  mockOpenAddToWorkspaceModal.mockClear();
  mockOpenMoveSystemsToWorkspaceModal.mockClear();
  mockOpenRemoveFromWorkspaceModal.mockClear();
  mockOpenEditModal.mockClear();
  mockOpenTagsModal.mockClear();
}

export function resetSystemsViewActionsTestState() {
  resetSystemActionModalMocks();
  setConditionalRBAC(false, false);
  mockUseKesselMigrationFeatureFlag.mockReturnValue(false);
}
