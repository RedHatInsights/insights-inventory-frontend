import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { expect, jest } from '@jest/globals';
import SystemsViewRowActions from './SystemsViewRowActions';
import type {
  ActionHelpers,
  ActionSpec,
  SystemsViewRowAction,
} from './actions/types';
import type { SystemsViewItem } from './types';

const system: SystemsViewItem = { id: 'host-1' };

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

function renderRowActions(
  rowActions: readonly SystemsViewRowAction<SystemsViewItem>[],
) {
  return render(
    <SystemsViewRowActions
      system={system}
      rowActions={rowActions}
      actionHelpers={actionHelpers}
    />,
  );
}

async function openKebabMenu() {
  await userEvent.click(screen.getByRole('button', { name: /kebab toggle/i }));
}

describe('SystemsViewRowActions', () => {
  beforeEach(() => {
    (actionHelpers.invalidateQuery as jest.Mock).mockClear();
    (actionHelpers.clearSelection as jest.Mock).mockClear();
  });

  it('maps action definitions to kebab menu items', async () => {
    renderRowActions([
      createAction({ id: 'edit', label: 'Edit' }),
      createAction({ id: 'delete', label: 'Delete' }),
    ]);
    await openKebabMenu();

    expect(screen.getByRole('menuitem', { name: 'Edit' })).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', { name: 'Delete' }),
    ).toBeInTheDocument();
  });

  it('calls onAction with the row item and actionHelpers', async () => {
    const onAction = jest.fn();

    renderRowActions([
      createAction({ id: 'delete', label: 'Delete', onAction }),
    ]);
    await openKebabMenu();
    await userEvent.click(screen.getByRole('menuitem', { name: 'Delete' }));

    expect(onAction).toHaveBeenCalledWith([system], actionHelpers);
  });

  it('renders a separator between actions', async () => {
    renderRowActions([
      createAction({ id: 'edit', label: 'Edit' }),
      { id: 'divider', isSeparator: true },
      createAction({ id: 'delete', label: 'Delete' }),
    ]);
    await openKebabMenu();

    expect(screen.getByRole('separator')).toBeInTheDocument();
  });

  it('applies danger styling when isDanger is true', async () => {
    renderRowActions([
      createAction({ id: 'delete', label: 'Delete', isDanger: true }),
    ]);
    await openKebabMenu();

    expect(screen.getByRole('menuitem', { name: 'Delete' })).toHaveClass(
      'pf-v6-u-danger-color-100',
    );
  });

  it('aria-disables the item and attaches a tooltip when disabled with a tooltip', async () => {
    const tooltip = jest.fn((_: SystemsViewItem[]) => 'No permission');

    renderRowActions([
      createAction({
        id: 'delete',
        label: 'Delete',
        isDisabled: () => true,
        tooltip,
      }),
    ]);
    await openKebabMenu();

    const deleteItem = screen.getByRole('menuitem', { name: 'Delete' });
    expect(deleteItem).toHaveAttribute('aria-disabled', 'true');
    expect(tooltip).toHaveBeenCalledWith([system]);

    await userEvent.hover(deleteItem);
    expect(await screen.findByText('No permission')).toBeInTheDocument();
  });

  it('disables the item without a tooltip when isDisabled returns true', async () => {
    renderRowActions([
      createAction({
        id: 'edit',
        label: 'Edit',
        isDisabled: () => true,
      }),
    ]);
    await openKebabMenu();

    const editItem = screen.getByRole('menuitem', { name: 'Edit' });
    expect(
      editItem.hasAttribute('aria-disabled') ||
        editItem.hasAttribute('disabled') ||
        editItem.className.includes('disabled'),
    ).toBe(true);
  });
});
