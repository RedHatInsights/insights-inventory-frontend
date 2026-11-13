import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { AddTagColumn } from './AddTagColumn';

jest.mock('../InventoryViews/hooks/useAccountTagCatalog', () => ({
  useAccountTagCatalog: () => ({
    data: [
      {
        tag: {
          namespace: 'insights-client',
          key: 'environment',
          value: 'prod',
        },
        count: 1,
      },
      {
        tag: { namespace: 'satellite', key: 'environment', value: 'stage' },
        count: 1,
      },
      {
        tag: { namespace: 'satellite', key: 'owner', value: 'alice' },
        count: 1,
      },
    ],
    isLoading: false,
    isError: false,
  }),
}));

describe('AddTagColumn', () => {
  it('keeps Add disabled until a tag is selected, then adds it once', async () => {
    const user = userEvent.setup();
    const onAdd = jest.fn();
    render(<AddTagColumn columns={[]} onAdd={onAdd} />);

    expect(screen.getByRole('button', { name: 'Add column' })).toBeDisabled();
    expect(screen.queryByText('Tag to add as column')).not.toBeInTheDocument();

    await user.type(
      screen.getByPlaceholderText('Add tag as a column...'),
      'environment',
    );
    expect(screen.getByText('insights-client/environment')).toBeInTheDocument();
    expect(screen.getByText('satellite/environment')).toBeInTheDocument();
    expect(screen.queryByText('satellite/owner')).not.toBeInTheDocument();

    await user.click(screen.getByText('satellite/environment'));
    expect(
      screen.getByDisplayValue('satellite/environment'),
    ).toBeInTheDocument();

    // Selecting fills the field and clears the filter, so reopening lists every tag.
    screen.getByRole('textbox', { name: 'Add tag as a column' }).focus();
    expect(
      screen.getByRole('option', { name: 'insights-client/environment' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: 'satellite/environment' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: 'satellite/owner' }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Add column' }));

    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(onAdd.mock.calls[0][0].key).toBe('tag:satellite/environment');
    expect(onAdd.mock.calls[0][0].isShown).toBe(true);
  });

  it('does not offer a tag column that is already in the list', async () => {
    const user = userEvent.setup();
    render(
      <AddTagColumn
        columns={[{ key: 'tag:satellite/owner' }]}
        onAdd={jest.fn()}
      />,
    );

    await user.type(
      screen.getByPlaceholderText('Add tag as a column...'),
      'satellite',
    );

    expect(screen.getByText('satellite/environment')).toBeInTheDocument();
    expect(screen.queryByText('satellite/owner')).not.toBeInTheDocument();
  });
});
