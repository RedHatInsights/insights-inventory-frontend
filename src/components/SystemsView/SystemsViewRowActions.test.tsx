import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { expect } from '@jest/globals';
import { SystemActionModalsContext } from './SystemActionModalsContext';
import { MOVE_SYSTEM_MENU_TEXT } from '../../constants';
import {
  createSystem,
  createSystemWithPermissions,
  expectMenuItemDisabled,
  mockOpenAddToWorkspaceModal,
  mockOpenDeleteModal,
  mockOpenEditModal,
  mockOpenMoveSystemsToWorkspaceModal,
  mockOpenRemoveFromWorkspaceModal,
  mockSystemActionModalsContextValue,
  mockUseKesselMigrationFeatureFlag,
  resetSystemsViewActionsTestState,
  setConditionalRBAC,
  testWorkspaceGroup,
} from './__fixtures__/systemsViewActionsTestHelpers';

function renderWithProvider(ui: React.ReactElement) {
  return render(
    <SystemActionModalsContext.Provider
      value={mockSystemActionModalsContextValue}
    >
      {ui}
    </SystemActionModalsContext.Provider>,
  );
}

const SystemsViewRowActions = require('./SystemsViewRowActions')
  .default as typeof import('./SystemsViewRowActions').default;

function expectMoveMenuItemDisabled() {
  expectMenuItemDisabled(MOVE_SYSTEM_MENU_TEXT);
}

describe('SystemsViewRowActions', () => {
  beforeEach(() => {
    resetSystemsViewActionsTestState();
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

    describe('Edit display name', () => {
      it('opens edit modal when clicked', async () => {
        const system = createSystemWithPermissions({
          hasWorkspaceEdit: true,
          hasUpdate: true,
          hasDelete: true,
        });

        renderWithProvider(<SystemsViewRowActions system={system} />);
        await openKebabMenu();

        await userEvent.click(screen.getByRole('menuitem', { name: 'Edit' }));
        expect(mockOpenEditModal).toHaveBeenCalledWith([system]);
      });

      it('is disabled when missing update permission', async () => {
        const system = createSystemWithPermissions({
          hasWorkspaceEdit: true,
          hasUpdate: false,
          hasDelete: true,
        });

        renderWithProvider(<SystemsViewRowActions system={system} />);
        await openKebabMenu();

        expect(screen.getByRole('menuitem', { name: 'Edit' })).toHaveAttribute(
          'aria-disabled',
          'true',
        );
      });
    });

    describe('Delete from inventory', () => {
      it('opens delete modal when clicked', async () => {
        const system = createSystemWithPermissions({
          hasWorkspaceEdit: true,
          hasUpdate: true,
          hasDelete: true,
        });

        renderWithProvider(<SystemsViewRowActions system={system} />);
        await openKebabMenu();

        await userEvent.click(screen.getByRole('menuitem', { name: 'Delete' }));
        expect(mockOpenDeleteModal).toHaveBeenCalledWith([system]);
      });

      it('is disabled when missing delete permission', async () => {
        const system = createSystemWithPermissions({
          hasWorkspaceEdit: true,
          hasUpdate: true,
          hasDelete: false,
        });

        renderWithProvider(<SystemsViewRowActions system={system} />);
        await openKebabMenu();

        expect(
          screen.getByRole('menuitem', { name: 'Delete' }),
        ).toHaveAttribute('aria-disabled', 'true');
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
          groups: [testWorkspaceGroup],
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
          groups: [testWorkspaceGroup],
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
          groups: [testWorkspaceGroup],
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
