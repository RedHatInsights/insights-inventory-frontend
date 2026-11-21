import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { NOT_AVAILABLE } from '../CellValue';
import { bindTagKeyColumns } from './tagKeyColumns';
import type { InventoryBindableItem } from './columnDefinitions';

const identities = [
  { namespace: 'insights-client', key: 'env' },
  { namespace: 'satellite', key: 'env' },
  { namespace: null, key: 'owner' },
];

const system = {
  id: 'host-1',
  tagsByKey: {
    'insights-client/env': ['prod', 'stage'],
    'satellite/env': ['dev'],
    owner: [],
  },
} as InventoryBindableItem;

describe('tag key columns', () => {
  const columns = bindTagKeyColumns(identities);

  it('builds a hidden column per namespace and key', () => {
    expect(columns.map((column) => column.key)).toEqual([
      'tag:insights-client/env',
      'tag:satellite/env',
      'tag:owner',
    ]);
    expect(columns.map((column) => column.title)).toEqual([
      'insights-client/env',
      'satellite/env',
      'owner',
    ]);
    columns.forEach((column) => {
      expect(column.isShown).toBe(false);
      expect(column.isShownByDefault).toBe(false);
      expect(column.sortBy).toBeUndefined();
      expect(column.appName).toBe('tag');
      expect(column.isRemovable).toBe(true);
    });
    expect(columns[2].tableHeader).toBeUndefined();
  });

  it('shows the key in the table header and the full identity in a tooltip', async () => {
    const user = userEvent.setup();
    render(<>{columns[0].tableHeader}</>);

    expect(screen.getByText('env')).toBeInTheDocument();
    expect(screen.queryByText('insights-client/env')).not.toBeInTheDocument();

    await user.hover(screen.getByText('env'));

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toHaveTextContent(
        'insights-client/env',
      );
    });
  });

  it('renders each value of a multi-value tag', () => {
    render(<>{columns[0].renderCell(columns[0].getValue(system))}</>);

    expect(screen.getByText('prod')).toBeInTheDocument();
    expect(screen.getByText('stage')).toBeInTheDocument();
  });

  it(`renders ${NOT_AVAILABLE} when the system has no value for the tag`, () => {
    render(<>{columns[2].renderCell(columns[2].getValue(system))}</>);

    expect(screen.getByText(NOT_AVAILABLE)).toBeInTheDocument();
  });
});
