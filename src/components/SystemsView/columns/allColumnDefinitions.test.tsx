import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import allColumns from './allColumnDefinitions';
import { InventoryViewHost } from '../hooks/useInventoryViewsQuery';

const inventoryKeys = ['name', 'workspace', 'tags', 'os', 'last_seen'];
const nonInventoryColumns = allColumns.filter(
  (col) => !inventoryKeys.includes(col.key),
);

describe('allColumnDefinitions', () => {
  it('should export columns in the correct order', () => {
    const keys = allColumns.map((col) => col.key);
    expect(keys).toEqual([
      'name',
      'workspace',
      'tags',
      'os',
      'last_seen',
      'recommendations',
      'incidents',
      'critical',
      'important',
      'moderate',
      'low',
    ]);
  });

  it('should have no duplicate keys', () => {
    const keys = allColumns.map((col) => col.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('should show inventory columns by default', () => {
    const inventoryColumns = allColumns.filter((col) =>
      inventoryKeys.includes(col.key),
    );
    inventoryColumns.forEach((col) => {
      expect(col.isShownByDefault).toBe(true);
      expect(col.isShown).toBe(true);
    });
  });

  it('should not show non-inventory columns by default', () => {
    nonInventoryColumns.forEach((col) => {
      expect(col.isShownByDefault).toBe(false);
      expect(col.isShown).toBe(false);
    });
  });

  it.each(allColumns)(
    'should have required properties for "$key"',
    (column) => {
      expect(column).toHaveProperty('key');
      expect(column).toHaveProperty('title');
      expect(column).toHaveProperty('renderCell');
      expect(column).toHaveProperty('isShownByDefault');
      expect(column).toHaveProperty('isShown');
      expect(typeof column.renderCell).toBe('function');
    },
  );

  it.each(nonInventoryColumns)(
    'should render N/A when app data is missing for "$key"',
    (column) => {
      const system = {} as unknown as InventoryViewHost;
      render(<>{column.renderCell(system)}</>);
      expect(screen.getByText('N/A')).toBeInTheDocument();
    },
  );
});
