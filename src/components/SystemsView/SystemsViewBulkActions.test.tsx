import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { expect, jest } from '@jest/globals';
import type { ActionHelpers, ActionSpec } from './actions/types';
import type { SystemsViewItem } from './types';

const mockOpenColumnManagementModal = jest.fn();
const mockUseInventoryViewsFeatureFlag = jest.fn(() => false);

jest.mock('./ColumnManagementModalContext', () => ({
  useColumnManagementModalContext: () => ({
    openColumnManagementModal: mockOpenColumnManagementModal,
  }),
}));

jest.mock('./SystemsViewExport', () => ({
  SystemsViewExport: () =>
    React.createElement('div', { 'data-testid': 'systems-view-export' }),
}));

jest.mock('../../Utilities/useInventoryViewsFeatureFlag', () => ({
  __esModule: true,
  default: () => mockUseInventoryViewsFeatureFlag(),
}));

const { SystemsViewBulkActions } =
  require('./SystemsViewBulkActions') as typeof import('./SystemsViewBulkActions');

const selectedSystems: SystemsViewItem[] = [{ id: 'host-1' }, { id: 'host-2' }];

const actionHelpers: ActionHelpers = {
  invalidateQuery: jest.fn(async () => {}),
  clearSelection: jest.fn(),
};

function createAction(
  overrides: Partial<ActionSpec<SystemsViewItem>> &
    Pick<ActionSpec<SystemsViewItem>, 'id' | 'label'>,
): ActionSpec<SystemsViewItem> {
  return {
    onAction: jest.fn(),
    ...overrides,
  };
}

function renderBulkActions({
  bulkActions = [] as readonly ActionSpec<SystemsViewItem>[],
  selected = selectedSystems,
  activeState = 'active' as const,
}: {
  bulkActions?: readonly ActionSpec<SystemsViewItem>[];
  selected?: SystemsViewItem[];
  activeState?: 'loading' | 'error' | 'empty' | 'active';
} = {}) {
  return render(
    <SystemsViewBulkActions
      selectedSystems={selected}
      activeState={activeState}
      bulkActions={bulkActions}
      actionHelpers={actionHelpers}
    />,
  );
}

function getActionsOverflowMenuButton() {
  return screen.getByRole('button', { name: /actions overflow menu/i });
}

describe('SystemsViewBulkActions', () => {
  beforeEach(() => {
    mockOpenColumnManagementModal.mockClear();
    mockUseInventoryViewsFeatureFlag.mockReturnValue(false);
    (actionHelpers.invalidateQuery as jest.Mock).mockClear();
    (actionHelpers.clearSelection as jest.Mock).mockClear();
  });

  it('always renders Export chrome', () => {
    renderBulkActions();

    expect(screen.getByTestId('systems-view-export')).toBeInTheDocument();
  });

  it('renders persistent actions as toolbar buttons', () => {
    renderBulkActions({
      bulkActions: [
        createAction({ id: 'move', label: 'Move', isPersistent: true }),
        createAction({ id: 'delete', label: 'Delete', isPersistent: true }),
      ],
    });

    expect(screen.getByRole('button', { name: 'Move' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /actions overflow menu/i }),
    ).not.toBeInTheDocument();
  });

  it('puts non-persistent actions in the overflow menu', async () => {
    renderBulkActions({
      bulkActions: [
        createAction({ id: 'add', label: 'Add to workspace' }),
        createAction({
          id: 'delete',
          label: 'Delete',
          isPersistent: true,
        }),
      ],
    });

    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Add to workspace' }),
    ).not.toBeInTheDocument();

    await userEvent.click(getActionsOverflowMenuButton());

    expect(
      screen.getByRole('menuitem', { name: 'Add to workspace' }),
    ).toBeInTheDocument();
  });

  it('calls onAction with selected items and actionHelpers', async () => {
    const onAction = jest.fn();

    renderBulkActions({
      bulkActions: [
        createAction({
          id: 'delete',
          label: 'Delete',
          isPersistent: true,
          onAction,
        }),
      ],
    });

    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));

    expect(onAction).toHaveBeenCalledWith(selectedSystems, actionHelpers);
  });

  it('disables an action when isDisabled returns true', () => {
    renderBulkActions({
      bulkActions: [
        createAction({
          id: 'delete',
          label: 'Delete',
          isPersistent: true,
          isDisabled: () => true,
        }),
      ],
    });

    expect(screen.getByRole('button', { name: 'Delete' })).toBeDisabled();
  });

  it('disables consumer actions when the table is not in the active state', () => {
    renderBulkActions({
      activeState: 'loading',
      bulkActions: [
        createAction({
          id: 'delete',
          label: 'Delete',
          isPersistent: true,
          isDisabled: () => false,
        }),
      ],
    });

    expect(screen.getByRole('button', { name: 'Delete' })).toBeDisabled();
  });

  it('applies danger styling when isDanger is true', () => {
    renderBulkActions({
      bulkActions: [
        createAction({
          id: 'delete',
          label: 'Delete',
          isPersistent: true,
          isDanger: true,
          variant: 'secondary',
        }),
      ],
    });

    expect(screen.getByRole('button', { name: 'Delete' })).toHaveClass(
      'pf-m-danger',
    );
  });

  it('uses variant from the action definition', () => {
    renderBulkActions({
      bulkActions: [
        createAction({
          id: 'delete',
          label: 'Delete',
          isPersistent: true,
          variant: 'secondary',
        }),
      ],
    });

    expect(screen.getByRole('button', { name: 'Delete' })).toHaveClass(
      'pf-m-secondary',
    );
  });

  it('uses ouiaId from the action definition', () => {
    renderBulkActions({
      bulkActions: [
        createAction({
          id: 'delete',
          label: 'Delete',
          isPersistent: true,
          ouiaId: 'bulk-delete-button',
        }),
      ],
    });

    expect(screen.getByRole('button', { name: 'Delete' })).toHaveAttribute(
      'data-ouia-component-id',
      'bulk-delete-button',
    );
  });

  it('aria-disables the action when a tooltip is provided', () => {
    renderBulkActions({
      bulkActions: [
        createAction({
          id: 'delete',
          label: 'Delete',
          isPersistent: true,
          isDisabled: () => true,
          tooltip: () => 'No permission',
        }),
      ],
    });

    const deleteButton = screen.getByRole('button', { name: 'Delete' });
    expect(deleteButton).toHaveAttribute('aria-disabled', 'true');
    expect(deleteButton).toBeDisabled();
  });

  it('renders Manage columns when inventory views are enabled', async () => {
    mockUseInventoryViewsFeatureFlag.mockReturnValue(true);

    renderBulkActions();

    await userEvent.click(getActionsOverflowMenuButton());
    await userEvent.click(
      screen.getByRole('menuitem', { name: 'Manage columns' }),
    );

    expect(mockOpenColumnManagementModal).toHaveBeenCalled();
  });

  it('does not render Manage columns when inventory views are disabled', () => {
    renderBulkActions();

    expect(
      screen.queryByRole('button', { name: /actions overflow menu/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('menuitem', { name: 'Manage columns' }),
    ).not.toBeInTheDocument();
  });
});
