import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { expect, jest } from '@jest/globals';
import { SystemsViewBulkActions } from './SystemsViewBulkActions';
import { SystemActionModalsContext } from './SystemActionModalsContext';
import { ColumnManagementModalProvider } from './ColumnManagementModalContext';
import type { Column } from './columns/allColumnDefinitions';
import type { System } from './hooks/useSystemsQuery';

const mockOpenDeleteModal = jest.fn();
const mockOpenAddToWorkspaceModal = jest.fn();
const mockOpenRemoveFromWorkspaceModal = jest.fn();
const mockOpenEditModal = jest.fn();
const mockOpenTagsModal = jest.fn();

const mockContextValue = {
  openDeleteModal: mockOpenDeleteModal,
  openAddToWorkspaceModal: mockOpenAddToWorkspaceModal,
  openRemoveFromWorkspaceModal: mockOpenRemoveFromWorkspaceModal,
  openEditModal: mockOpenEditModal,
  openTagsModal: mockOpenTagsModal,
};

const mockColumns: Column[] = [
  {
    key: 'display_name',
    title: 'Name',
    isShownByDefault: true,
    renderCell: () => null,
  },
];

jest.mock('./SystemsViewExport', () => ({
  SystemsViewExport: () => null,
}));

jest.mock('../ColumnManagementModal', () => ({
  ColumnManagementModal: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="column-management-modal" /> : null,
}));

jest.mock('../../Utilities/hooks/useKesselMigrationFeatureFlag', () => ({
  useKesselMigrationFeatureFlag: jest.fn(() => false),
}));

jest.mock('../../Utilities/useFeatureFlag', () => ({
  __esModule: true,
  default: jest.fn((key: string) => key === 'ui.inventory-views'),
}));

jest.mock('../../Utilities/hooks/useConditionalRBAC', () => ({
  useConditionalRBAC: jest.fn(() => ({ hasAccess: true })),
}));

function renderBulkActions(
  activeState: string,
  selectedSystems: System[] = [],
) {
  return render(
    <SystemActionModalsContext.Provider value={mockContextValue}>
      <ColumnManagementModalProvider
        columns={mockColumns}
        setColumns={jest.fn()}
      >
        <SystemsViewBulkActions
          activeState={activeState}
          selectedSystems={selectedSystems}
        />
      </ColumnManagementModalProvider>
    </SystemActionModalsContext.Provider>,
  );
}

const openActionsOverflowMenu = async () => {
  await userEvent.click(
    screen.getByRole('button', { name: 'Actions overflow menu' }),
  );
};

const getManageColumnsAction = () =>
  screen.getByRole('menuitem', { name: 'Manage columns' });

const expectActionDisabled = (action: HTMLElement) => {
  expect(
    action.hasAttribute('disabled') ||
      action.getAttribute('aria-disabled') === 'true' ||
      action.className.includes('disabled'),
  ).toBe(true);
};

const expectActionEnabled = (action: HTMLElement) => {
  expect(action).toBeEnabled();
  expect(action.getAttribute('aria-disabled')).not.toBe('true');
};

describe('SystemsViewBulkActions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();

    const useFeatureFlag = require('../../Utilities/useFeatureFlag')
      .default as jest.Mock;
    useFeatureFlag.mockImplementation(
      (key: unknown) => key === 'ui.inventory-views',
    );

    const useKesselMigrationFeatureFlag =
      require('../../Utilities/hooks/useKesselMigrationFeatureFlag')
        .useKesselMigrationFeatureFlag as jest.Mock;
    useKesselMigrationFeatureFlag.mockReturnValue(false);
  });

  describe('Manage columns button', () => {
    it('is not rendered when inventory views feature flag is disabled', async () => {
      const useFeatureFlag = require('../../Utilities/useFeatureFlag')
        .default as jest.Mock;
      useFeatureFlag.mockReturnValue(false);

      renderBulkActions('active');
      await openActionsOverflowMenu();

      expect(
        screen.queryByRole('menuitem', { name: 'Manage columns' }),
      ).not.toBeInTheDocument();
    });

    it.each(['loading', 'error', 'empty'])(
      'is disabled when activeState is "%s"',
      async (activeState) => {
        renderBulkActions(activeState);
        await openActionsOverflowMenu();

        expectActionDisabled(getManageColumnsAction());
      },
    );

    it('is enabled when activeState is "active"', async () => {
      renderBulkActions('active');
      await openActionsOverflowMenu();

      expectActionEnabled(getManageColumnsAction());
    });

    it('opens the column management modal when enabled and clicked', async () => {
      renderBulkActions('active');
      await openActionsOverflowMenu();
      await userEvent.click(getManageColumnsAction());

      await waitFor(() => {
        expect(
          screen.getByRole('dialog', { name: 'Manage columns' }),
        ).toBeInTheDocument();
      });
    });

    it('does not open the column management modal when disabled and clicked', async () => {
      renderBulkActions('loading');
      await openActionsOverflowMenu();
      await userEvent.click(getManageColumnsAction());

      expect(
        screen.queryByRole('dialog', { name: 'Manage columns' }),
      ).not.toBeInTheDocument();
    });

    describe('when Kessel migration is enabled', () => {
      beforeEach(() => {
        const useKesselMigrationFeatureFlag =
          require('../../Utilities/hooks/useKesselMigrationFeatureFlag')
            .useKesselMigrationFeatureFlag as jest.Mock;
        useKesselMigrationFeatureFlag.mockReturnValue(true);
      });

      it.each(['loading', 'error', 'empty'])(
        'is disabled when activeState is "%s"',
        async (activeState) => {
          renderBulkActions(activeState);
          await openActionsOverflowMenu();

          expectActionDisabled(getManageColumnsAction());
        },
      );

      it('is enabled when activeState is "active"', async () => {
        renderBulkActions('active');
        await openActionsOverflowMenu();

        expectActionEnabled(getManageColumnsAction());
      });
    });
  });
});
