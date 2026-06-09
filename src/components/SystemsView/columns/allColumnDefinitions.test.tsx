import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import allColumns, { type Column } from './allColumnDefinitions';
import { InventoryViewSystem } from '../hooks/useInventoryViewsQuery';
import {
  DEFAULT_NAME_COLUMN_MIN_WIDTH,
  getColumnMinWidthStyle,
  getNameColumnMinWidth,
  resolveColumnMinWidth,
} from '../utils/columnMinWidths';

const inventoryKeys = ['name', 'workspace', 'tags', 'os', 'last_seen'];
const nonInventoryColumns = allColumns.filter(
  (col) => !inventoryKeys.includes(col.key),
);

const columnsWithMinWidth = (allColumns as readonly Column[]).filter(
  (col): col is Column & { minWidth: string } => col.minWidth !== undefined,
);

describe('allColumnDefinitions', () => {
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

  it.each(columnsWithMinWidth)(
    'should use a valid minWidth format when minWidth is defined on "$key"',
    (column) => {
      expect(column.minWidth).toMatch(/^\d+(\.\d+)?rem$/);
    },
  );

  describe('optional minWidth', () => {
    it('returns undefined for non-name columns without minWidth', () => {
      expect(resolveColumnMinWidth({ key: 'tags' })).toBeUndefined();
      expect(getColumnMinWidthStyle({ key: 'tags' })).toBeUndefined();
    });

    it('uses the provided minWidth when set', () => {
      expect(resolveColumnMinWidth({ key: 'tags', minWidth: '6rem' })).toBe(
        '6rem',
      );
      expect(getColumnMinWidthStyle({ key: 'tags', minWidth: '6rem' })).toEqual(
        { style: { minWidth: '6rem' } },
      );
    });

    it('falls back for the Name column when minWidth is omitted', () => {
      expect(resolveColumnMinWidth({ key: 'name' })).toBe(
        DEFAULT_NAME_COLUMN_MIN_WIDTH,
      );
      expect(getNameColumnMinWidth({})).toBe(DEFAULT_NAME_COLUMN_MIN_WIDTH);
    });
  });

  it.each(nonInventoryColumns)(
    'should render N/A when app data is missing for "$key"',
    (column) => {
      const system = {} as unknown as InventoryViewSystem;
      render(<>{column.renderCell(system)}</>);
      expect(screen.getByText('N/A')).toBeInTheDocument();
    },
  );
});
