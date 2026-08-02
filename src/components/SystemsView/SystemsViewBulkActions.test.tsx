import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { expect, jest } from '@jest/globals';
import { SystemActionModalsContext } from './SystemActionModalsContext';
import {
  GENERAL_GROUPS_WRITE_PERMISSION,
  GENERAL_HOSTS_WRITE_PERMISSIONS,
} from '../../constants';
import type { System } from '../InventoryViews/hooks/useHostsQuery';

const mockOpenDeleteModal = jest.fn();
const mockOpenAddToWorkspaceModal = jest.fn();
const mockOpenMoveSystemsToWorkspaceModal = jest.fn();
const mockOpenRemoveFromWorkspaceModal = jest.fn();
const mockOpenColumnManagementModal = jest.fn();

const mockContextValue = {
  openDeleteModal: mockOpenDeleteModal,
  openAddToWorkspaceModal: mockOpenAddToWorkspaceModal,
  openMoveSystemsToWorkspaceModal: mockOpenMoveSystemsToWorkspaceModal,
  openRemoveFromWorkspaceModal: mockOpenRemoveFromWorkspaceModal,
  openEditModal: jest.fn(),
  openTagsModal: jest.fn(),
};

jest.mock('./ColumnManagementModalContext', () => ({
  useColumnManagementModalContext: () => ({
    openColumnManagementModal: mockOpenColumnManagementModal,
  }),
}));

function renderBulkActions({
  selectedSystems = [createSystem()],
  activeState = 'active',
}: {
  selectedSystems?: System[];
  activeState?: string;
} = {}) {
  return render(
    <SystemActionModalsContext.Provider value={mockContextValue}>
      <SystemsViewBulkActions
        selectedSystems={selectedSystems}
        activeState={activeState}
      />
    </SystemActionModalsContext.Provider>,
  );
}

jest.mock('./SystemsViewExport', () => ({
  SystemsViewExport: () => null,
}));

const mockUseKesselMigrationFeatureFlag = jest.fn();

jest.mock('../../Utilities/hooks/useKesselMigrationFeatureFlag', () => ({
  useKesselMigrationFeatureFlag: () => mockUseKesselMigrationFeatureFlag(),
}));

jest.mock('../../Utilities/useInventoryViewsFeatureFlag', () => ({
  __esModule: true,
  default: () => false,
}));

jest.mock('../../Utilities/hooks/useConditionalRBAC', () => ({
  useConditionalRBAC: jest.fn(() => ({ hasAccess: false })),
}));

const { SystemsViewBulkActions } =
  require('./SystemsViewBulkActions') as typeof import('./SystemsViewBulkActions');

const baseTestSystem = {
  id: 'host-1',
  display_name: 'My Host',
  groups: [] as System['groups'],
  org_id: 'test-org',
};

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

function getActionsOverflowMenuButton() {
  return screen.getByRole('button', { name: /actions overflow menu/i });
}

async function openActionsOverflowMenu() {
  await userEvent.click(getActionsOverflowMenuButton());
}

function expectOverflowMenuItemDisabled(name: string | RegExp) {
  const item = screen.getByRole('menuitem', { name });
  expect(item).toBeInTheDocument();
  expect(
    item.hasAttribute('aria-disabled') ||
      item.hasAttribute('disabled') ||
      item.className.includes('disabled'),
  ).toBe(true);
}

describe('SystemsViewBulkActions', () => {
  beforeEach(() => {
    mockOpenDeleteModal.mockClear();
    mockOpenAddToWorkspaceModal.mockClear();
    mockOpenMoveSystemsToWorkspaceModal.mockClear();
    mockOpenRemoveFromWorkspaceModal.mockClear();
    mockOpenColumnManagementModal.mockClear();
    setConditionalRBAC(false, false);
    mockUseKesselMigrationFeatureFlag.mockReturnValue(false);
  });

  describe('when Kessel migration is enabled', () => {
    beforeEach(() => {
      mockUseKesselMigrationFeatureFlag.mockReturnValue(true);
    });

    it('shows Move and Delete and hides legacy workspace actions', () => {
      renderBulkActions();

      expect(screen.getByRole('button', { name: 'Move' })).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Delete' }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'Add to workspace' }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'Remove from workspace' }),
      ).not.toBeInTheDocument();
    });

    describe('Move', () => {
      it('opens move modal when clicked', async () => {
        const selectedSystems = [
          createSystem(),
          createSystem({ id: 'host-2' }),
        ];

        renderBulkActions({ selectedSystems });

        await userEvent.click(screen.getByRole('button', { name: 'Move' }));
        expect(mockOpenMoveSystemsToWorkspaceModal).toHaveBeenCalledWith(
          selectedSystems,
        );
      });

      it('is disabled when no systems are selected', () => {
        renderBulkActions({ selectedSystems: [] });

        expect(screen.getByRole('button', { name: 'Move' })).toBeDisabled();
      });

      it('is disabled when the table is not in the active state', () => {
        renderBulkActions({ activeState: 'loading' });

        expect(screen.getByRole('button', { name: 'Move' })).toBeDisabled();
      });
    });

    describe('Delete', () => {
      it('opens delete modal when clicked', async () => {
        const selectedSystems = [createSystem()];

        renderBulkActions({ selectedSystems });

        await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
        expect(mockOpenDeleteModal).toHaveBeenCalledWith(selectedSystems);
      });

      it('is disabled when no systems are selected', () => {
        renderBulkActions({ selectedSystems: [] });

        expect(screen.getByRole('button', { name: 'Delete' })).toBeDisabled();
      });

      it('is disabled when the table is not in the active state', () => {
        renderBulkActions({ activeState: 'empty' });

        expect(screen.getByRole('button', { name: 'Delete' })).toBeDisabled();
      });
    });
  });

  describe('when Kessel migration is disabled', () => {
    beforeEach(() => {
      mockUseKesselMigrationFeatureFlag.mockReturnValue(false);
    });

    it('shows Add and Remove from workspace and hides Move', async () => {
      setConditionalRBAC(true, true);

      renderBulkActions();

      await openActionsOverflowMenu();

      expect(
        screen.getByRole('menuitem', { name: 'Add to workspace' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('menuitem', { name: 'Remove from workspace' }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'Move' }),
      ).not.toBeInTheDocument();
    });

    describe('Add to workspace', () => {
      it('opens add to workspace modal when clicked', async () => {
        setConditionalRBAC(true, true);

        const selectedSystems = [createSystem()];

        renderBulkActions({ selectedSystems });

        await openActionsOverflowMenu();
        await userEvent.click(
          screen.getByRole('menuitem', { name: 'Add to workspace' }),
        );
        expect(mockOpenAddToWorkspaceModal).toHaveBeenCalledWith(
          selectedSystems,
        );
      });

      it('is disabled when user lacks groups write permission', () => {
        setConditionalRBAC(false, true);

        renderBulkActions();

        expect(getActionsOverflowMenuButton()).toBeDisabled();
      });

      it('is disabled when any selected host is already in a workspace', async () => {
        setConditionalRBAC(true, true);

        const selectedSystems = [
          createSystem({
            groups: [{ id: 'g1', name: 'Workspace A', ungrouped: false }],
          }),
        ];

        renderBulkActions({ selectedSystems });

        await openActionsOverflowMenu();

        expectOverflowMenuItemDisabled('Add to workspace');
      });

      it('is disabled when no systems are selected', () => {
        setConditionalRBAC(true, true);

        renderBulkActions({ selectedSystems: [] });

        expect(getActionsOverflowMenuButton()).toBeDisabled();
      });
    });

    describe('Remove from workspace', () => {
      it('opens remove from workspace modal when clicked', async () => {
        setConditionalRBAC(true, true);

        const selectedSystems = [
          createSystem({
            groups: [{ id: 'g1', name: 'Workspace A', ungrouped: false }],
          }),
        ];

        renderBulkActions({ selectedSystems });

        await openActionsOverflowMenu();
        await userEvent.click(
          screen.getByRole('menuitem', { name: 'Remove from workspace' }),
        );
        expect(mockOpenRemoveFromWorkspaceModal).toHaveBeenCalledWith(
          selectedSystems,
        );
      });

      it('is disabled when user lacks groups write permission', () => {
        setConditionalRBAC(false, true);

        const selectedSystems = [
          createSystem({
            groups: [{ id: 'g1', name: 'Workspace A', ungrouped: false }],
          }),
        ];

        renderBulkActions({ selectedSystems });

        expect(getActionsOverflowMenuButton()).toBeDisabled();
      });

      it('is disabled when any selected host is not in a workspace', async () => {
        setConditionalRBAC(true, true);

        const selectedSystems = [createSystem()];

        renderBulkActions({ selectedSystems });

        await openActionsOverflowMenu();

        expectOverflowMenuItemDisabled('Remove from workspace');
      });

      it('is disabled when no systems are selected', () => {
        setConditionalRBAC(true, true);

        renderBulkActions({ selectedSystems: [] });

        expect(getActionsOverflowMenuButton()).toBeDisabled();
      });
    });

    describe('Delete', () => {
      it('opens delete modal when clicked', async () => {
        setConditionalRBAC(false, true);

        const selectedSystems = [createSystem()];

        renderBulkActions({ selectedSystems });

        await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
        expect(mockOpenDeleteModal).toHaveBeenCalledWith(selectedSystems);
      });

      it('is disabled when user lacks hosts write permission', () => {
        setConditionalRBAC(false, false);

        renderBulkActions();

        expect(screen.getByRole('button', { name: 'Delete' })).toBeDisabled();
      });

      it('is disabled when no systems are selected', () => {
        setConditionalRBAC(false, true);

        renderBulkActions({ selectedSystems: [] });

        expect(screen.getByRole('button', { name: 'Delete' })).toBeDisabled();
      });
    });
  });
});
