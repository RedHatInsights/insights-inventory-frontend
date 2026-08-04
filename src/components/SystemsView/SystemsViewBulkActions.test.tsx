import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { expect, jest } from '@jest/globals';
import { SystemActionModalsContext } from './SystemActionModalsContext';
import type { System } from '../InventoryViews/hooks/useHostsQuery';
import {
  createSystem,
  mockOpenAddToWorkspaceModal,
  mockOpenDeleteModal,
  mockOpenMoveSystemsToWorkspaceModal,
  mockOpenRemoveFromWorkspaceModal,
  mockSystemActionModalsContextValue,
  mockUseKesselMigrationFeatureFlag,
  resetSystemsViewActionsTestState,
  setConditionalRBAC,
  testWorkspaceGroup,
} from './__fixtures__/systemsViewActionsTestHelpers';

const mockOpenColumnManagementModal = jest.fn();

jest.mock('./ColumnManagementModalContext', () => ({
  useColumnManagementModalContext: () => ({
    openColumnManagementModal: mockOpenColumnManagementModal,
  }),
}));

jest.mock('./SystemsViewExport', () => ({
  SystemsViewExport: () => null,
}));

jest.mock('../../Utilities/useInventoryViewsFeatureFlag', () => ({
  __esModule: true,
  default: () => false,
}));

const { SystemsViewBulkActions } =
  require('./SystemsViewBulkActions') as typeof import('./SystemsViewBulkActions');

function renderBulkActions({
  selectedSystems = [createSystem()],
  activeState = 'active',
}: {
  selectedSystems?: System[];
  activeState?: string;
} = {}) {
  return render(
    <SystemActionModalsContext.Provider
      value={mockSystemActionModalsContextValue}
    >
      <SystemsViewBulkActions
        selectedSystems={selectedSystems}
        activeState={activeState}
      />
    </SystemActionModalsContext.Provider>,
  );
}

function getActionsOverflowMenuButton() {
  return screen.getByRole('button', { name: /actions overflow menu/i });
}

async function openActionsOverflowMenu() {
  await userEvent.click(getActionsOverflowMenuButton());
}

describe('SystemsViewBulkActions', () => {
  beforeEach(() => {
    resetSystemsViewActionsTestState();
    mockOpenColumnManagementModal.mockClear();
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

      it('is disabled when the table is is in the loading state', () => {
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

      it('is disabled when the table is in the loading state', () => {
        renderBulkActions({ activeState: 'loading' });

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

      it('is disabled when any selected host is already in a workspace', () => {
        setConditionalRBAC(true, true);

        const selectedSystems = [
          createSystem({
            id: 'host-in-workspace',
            groups: [testWorkspaceGroup],
          }),
          createSystem({ id: 'host-not-in-workspace' }),
        ];

        renderBulkActions({ selectedSystems });

        expect(getActionsOverflowMenuButton()).toBeDisabled();
      });

      it('is disabled when no systems are selected', () => {
        setConditionalRBAC(true, true);

        renderBulkActions({ selectedSystems: [] });

        expect(getActionsOverflowMenuButton()).toBeDisabled();
      });

      it('is disabled when the table is in the loading state', () => {
        setConditionalRBAC(true, true);

        renderBulkActions({ activeState: 'loading' });

        expect(getActionsOverflowMenuButton()).toBeDisabled();
      });
    });

    describe('Remove from workspace', () => {
      it('opens remove from workspace modal when clicked', async () => {
        setConditionalRBAC(true, true);

        const selectedSystems = [
          createSystem({
            groups: [testWorkspaceGroup],
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
            groups: [testWorkspaceGroup],
          }),
        ];

        renderBulkActions({ selectedSystems });

        expect(getActionsOverflowMenuButton()).toBeDisabled();
      });

      it('is disabled when any selected host is not in a workspace', () => {
        setConditionalRBAC(true, true);

        const selectedSystems = [
          createSystem({
            id: 'host-in-workspace',
            groups: [testWorkspaceGroup],
          }),
          createSystem({ id: 'host-not-in-workspace' }),
        ];

        renderBulkActions({ selectedSystems });

        expect(getActionsOverflowMenuButton()).toBeDisabled();
      });

      it('is disabled when no systems are selected', () => {
        setConditionalRBAC(true, true);

        renderBulkActions({ selectedSystems: [] });

        expect(getActionsOverflowMenuButton()).toBeDisabled();
      });

      it('is disabled when the table is in the loading state', () => {
        setConditionalRBAC(true, true);

        const selectedSystems = [
          createSystem({
            groups: [testWorkspaceGroup],
          }),
        ];

        renderBulkActions({ selectedSystems, activeState: 'loading' });

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

      it('is disabled when the table is in the loading state', () => {
        setConditionalRBAC(false, true);

        renderBulkActions({ activeState: 'loading' });

        expect(screen.getByRole('button', { name: 'Delete' })).toBeDisabled();
      });
    });
  });
});
