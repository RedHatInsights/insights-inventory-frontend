import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
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
      expect(column.appName).toBe('inventory');
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
