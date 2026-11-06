import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { ColumnManagementModal } from './ColumnManagementModal';

const nameColumn = {
  key: 'display_name',
  title: 'Name',
  isShown: true,
  isShownByDefault: true,
  appName: 'inventory',
};

const tagColumn = {
  key: 'tag:owner',
  title: 'owner',
  isShown: true,
  isShownByDefault: true,
  appName: 'tag',
  isRemovable: true,
};

describe('ColumnManagementModal tag rows', () => {
  it('removes only the tag column', async () => {
    const user = userEvent.setup();
    const applyColumns = jest.fn();
    render(
      <ColumnManagementModal
        isOpen
        appliedColumns={[nameColumn, tagColumn]}
        defaultColumns={[nameColumn]}
        applyColumns={applyColumns}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Remove owner' }));
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(applyColumns).toHaveBeenCalledWith([
      expect.objectContaining({ key: 'display_name' }),
    ]);
    expect(screen.queryByText('owner')).not.toBeInTheDocument();
  });
});
