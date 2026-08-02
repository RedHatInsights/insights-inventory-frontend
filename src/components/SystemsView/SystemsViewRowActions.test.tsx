import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { expect, jest } from '@jest/globals';
import { SystemActionModalsContext } from './SystemActionModalsContext';
import type { SystemWithPermissions } from '../../Utilities/hooks/useHostIdsWithKessel';
import {
  GENERAL_GROUPS_WRITE_PERMISSION,
  GENERAL_HOSTS_WRITE_PERMISSIONS,
  MOVE_SYSTEM_MENU_TEXT,
} from '../../constants';
import type { System } from '../InventoryViews/hooks/useHostsQuery';

const mockOpenDeleteModal = jest.fn();
const mockOpenAddToWorkspaceModal = jest.fn();
const mockOpenMoveSystemsToWorkspaceModal = jest.fn();
const mockOpenRemoveFromWorkspaceModal = jest.fn();
const mockOpenEditModal = jest.fn();
const mockOpenTagsModal = jest.fn();

const mockContextValue = {
  openDeleteModal: mockOpenDeleteModal,
  openAddToWorkspaceModal: mockOpenAddToWorkspaceModal,
  openMoveSystemsToWorkspaceModal: mockOpenMoveSystemsToWorkspaceModal,
  openRemoveFromWorkspaceModal: mockOpenRemoveFromWorkspaceModal,
  openEditModal: mockOpenEditModal,
  openTagsModal: mockOpenTagsModal,
};

function renderWithProvider(ui: React.ReactElement) {
  return render(
    <SystemActionModalsContext.Provider value={mockContextValue}>
      {ui}
    </SystemActionModalsContext.Provider>,
  );
}

const mockUseKesselMigrationFeatureFlag = jest.fn();

jest.mock('../../Utilities/hooks/useKesselMigrationFeatureFlag', () => ({
  useKesselMigrationFeatureFlag: () => mockUseKesselMigrationFeatureFlag(),
}));

jest.mock('../../Utilities/hooks/useConditionalRBAC', () => ({
  useConditionalRBAC: jest.fn(() => ({ hasAccess: false })),
}));

const SystemsViewRowActions = require('./SystemsViewRowActions')
  .default as typeof import('./SystemsViewRowActions').default;

const baseTestSystem = {
  id: 'host-1',
  display_name: 'My Host',
  groups: [] as System['groups'],
  org_id: 'test-org',
};

function createSystemWithPermissions(
  permissions: SystemWithPermissions['permissions'],
  systemOverrides: Partial<System> = {},
): SystemWithPermissions {
  return {
    ...baseTestSystem,
    ...systemOverrides,
    permissions,
  } as unknown as SystemWithPermissions;
}

function createSystem(systemOverrides: Partial<System> = {}): System {
  return { ...baseTestSystem, ...systemOverrides };
}

function setConditionalRBAC(hasGroupsWrite: boolean, hasHostsWrite: boolean) {
  const useConditionalRBACMock =
    require('../../Utilities/hooks/useConditionalRBAC')
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

function expectMenuItemDisabled(name: string | RegExp) {
  const item = screen.getByRole('menuitem', { name });
  expect(item).toBeInTheDocument();
  expect(
    item.hasAttribute('aria-disabled') ||
      item.hasAttribute('disabled') ||
      item.className.includes('disabled'),
  ).toBe(true);
}

function expectMoveMenuItemDisabled() {
  expectMenuItemDisabled(MOVE_SYSTEM_MENU_TEXT);
}

describe('SystemsViewRowActions', () => {
  beforeEach(() => {
    mockOpenDeleteModal.mockClear();
    mockOpenAddToWorkspaceModal.mockClear();
    mockOpenMoveSystemsToWorkspaceModal.mockClear();
    mockOpenRemoveFromWorkspaceModal.mockClear();
    mockOpenEditModal.mockClear();
    mockOpenTagsModal.mockClear();
    setConditionalRBAC(false, false);
    mockUseKesselMigrationFeatureFlag.mockReturnValue(false);
  });

  async function openKebabMenu() {
    await userEvent.click(
      screen.getByRole('button', { name: /kebab toggle/i }),
    );
  }

  describe('when Kessel migration is enabled', () => {
    beforeEach(() => {
      mockUseKesselMigrationFeatureFlag.mockReturnValue(true);
    });

    it('shows Move system and hides legacy workspace menu items', async () => {
      const system = createSystemWithPermissions({
        hasWorkspaceEdit: true,
        hasUpdate: true,
        hasDelete: true,
      });

      renderWithProvider(<SystemsViewRowActions system={system} />);
      await openKebabMenu();

      expect(
        screen.getByRole('menuitem', { name: MOVE_SYSTEM_MENU_TEXT }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('menuitem', { name: 'Add to workspace' }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('menuitem', { name: 'Remove from workspace' }),
      ).not.toBeInTheDocument();
    });

    describe('Move system', () => {
      it('opens move modal when clicked', async () => {
        const system = createSystemWithPermissions({
          hasWorkspaceEdit: true,
          hasUpdate: true,
          hasDelete: true,
        });

        renderWithProvider(<SystemsViewRowActions system={system} />);
        await openKebabMenu();

        await userEvent.click(
          screen.getByRole('menuitem', { name: MOVE_SYSTEM_MENU_TEXT }),
        );
        expect(mockOpenMoveSystemsToWorkspaceModal).toHaveBeenCalledWith([
          system,
        ]);
      });

      it('is disabled when missing workspace edit permission', async () => {
        const system = createSystemWithPermissions({
          hasWorkspaceEdit: false,
          hasUpdate: true,
          hasDelete: true,
        });

        renderWithProvider(<SystemsViewRowActions system={system} />);
        await openKebabMenu();

        expectMoveMenuItemDisabled();
      });
    });
  });

  describe('when Kessel migration is disabled', () => {
    beforeEach(() => {
      mockUseKesselMigrationFeatureFlag.mockReturnValue(false);
    });

    it('shows Add and Remove from workspace and hides Move system', async () => {
      const system = createSystem();

      renderWithProvider(<SystemsViewRowActions system={system} />);
      await openKebabMenu();

      expect(
        screen.getByRole('menuitem', { name: 'Add to workspace' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('menuitem', { name: 'Remove from workspace' }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('menuitem', { name: MOVE_SYSTEM_MENU_TEXT }),
      ).not.toBeInTheDocument();
    });

    describe('Add to workspace', () => {
      it('opens add to workspace modal when clicked', async () => {
        setConditionalRBAC(true, false);

        const system = createSystem();

        renderWithProvider(<SystemsViewRowActions system={system} />);
        await openKebabMenu();

        await userEvent.click(
          screen.getByRole('menuitem', { name: 'Add to workspace' }),
        );
        expect(mockOpenAddToWorkspaceModal).toHaveBeenCalledWith([system]);
      });

      it('is disabled when user lacks groups write permission', async () => {
        setConditionalRBAC(false, false);

        const system = createSystem();

        renderWithProvider(<SystemsViewRowActions system={system} />);
        await openKebabMenu();

        expect(
          screen.getByRole('menuitem', { name: 'Add to workspace' }),
        ).toHaveAttribute('aria-disabled', 'true');
      });

      it('is disabled when the host is already in a workspace', async () => {
        setConditionalRBAC(true, false);

        const system = createSystem({
          groups: [{ id: 'g1', name: 'Workspace A', ungrouped: false }],
        });

        renderWithProvider(<SystemsViewRowActions system={system} />);
        await openKebabMenu();

        expectMenuItemDisabled('Add to workspace');
      });
    });

    describe('Remove from workspace', () => {
      it('opens remove from workspace modal when clicked', async () => {
        setConditionalRBAC(true, false);

        const system = createSystem({
          groups: [{ id: 'g1', name: 'Workspace A', ungrouped: false }],
        });

        renderWithProvider(<SystemsViewRowActions system={system} />);
        await openKebabMenu();

        await userEvent.click(
          screen.getByRole('menuitem', { name: 'Remove from workspace' }),
        );
        expect(mockOpenRemoveFromWorkspaceModal).toHaveBeenCalledWith([system]);
      });

      it('is disabled when user lacks groups write permission', async () => {
        setConditionalRBAC(false, false);

        const system = createSystem({
          groups: [{ id: 'g1', name: 'Workspace A', ungrouped: false }],
        });

        renderWithProvider(<SystemsViewRowActions system={system} />);
        await openKebabMenu();

        expect(
          screen.getByRole('menuitem', { name: 'Remove from workspace' }),
        ).toHaveAttribute('aria-disabled', 'true');
      });

      it('is disabled when the host is not in a workspace', async () => {
        setConditionalRBAC(true, false);

        const system = createSystem();

        renderWithProvider(<SystemsViewRowActions system={system} />);
        await openKebabMenu();

        expectMenuItemDisabled('Remove from workspace');
      });
    });

    describe('Edit display name', () => {
      it('opens edit modal when clicked', async () => {
        setConditionalRBAC(false, true);

        const system = createSystem();

        renderWithProvider(<SystemsViewRowActions system={system} />);
        await openKebabMenu();

        await userEvent.click(
          screen.getByRole('menuitem', { name: 'Edit display name' }),
        );
        expect(mockOpenEditModal).toHaveBeenCalledWith([system]);
      });

      it('is disabled when user lacks hosts write permission', async () => {
        setConditionalRBAC(false, false);

        const system = createSystem();

        renderWithProvider(<SystemsViewRowActions system={system} />);
        await openKebabMenu();

        expect(
          screen.getByRole('menuitem', { name: 'Edit display name' }),
        ).toHaveAttribute('aria-disabled', 'true');
      });
    });

    describe('Delete from inventory', () => {
      it('opens delete modal when clicked', async () => {
        setConditionalRBAC(false, true);

        const system = createSystem();

        renderWithProvider(<SystemsViewRowActions system={system} />);
        await openKebabMenu();

        await userEvent.click(
          screen.getByRole('menuitem', { name: 'Delete from inventory' }),
        );
        expect(mockOpenDeleteModal).toHaveBeenCalledWith([system]);
      });

      it('is disabled when user lacks hosts write permission', async () => {
        setConditionalRBAC(false, false);

        const system = createSystem();

        renderWithProvider(<SystemsViewRowActions system={system} />);
        await openKebabMenu();

        expect(
          screen.getByRole('menuitem', { name: 'Delete from inventory' }),
        ).toHaveAttribute('aria-disabled', 'true');
      });
    });
  });
});
