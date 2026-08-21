import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import allColumns, { type Column } from './allColumnDefinitions';
import { InventoryViewSystem } from '../../InventoryViews/inventoryViewsQueryOptions';
import {
  DEFAULT_NAME_COLUMN_MIN_WIDTH,
  getColumnMinWidthStyle,
  getNameColumnMinWidth,
  resolveColumnMinWidth,
} from '../utils/columnMinWidths';
import { NOT_AVAILABLE } from './CellValue';
import inventoryColumns from './inventory/columnDefinitions';

const inventoryKeys = inventoryColumns.map((col) => col.key);
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

  it('should show all catalog columns by default', () => {
    allColumns.forEach((col) => {
      expect(col.isShownByDefault).toBe(true);
      expect(col.isShown).toBe(true);
    });
  });

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
      expect(resolveColumnMinWidth({ key: 'display_name' })).toBe(
        DEFAULT_NAME_COLUMN_MIN_WIDTH,
      );
      expect(getNameColumnMinWidth({})).toBe(DEFAULT_NAME_COLUMN_MIN_WIDTH);
    });
  });

  it.each(nonInventoryColumns)(
    `should render ${NOT_AVAILABLE} when app data is missing for "$key"`,
    (column) => {
      const system = {} as unknown as InventoryViewSystem;
      render(<>{column.renderCell(system)}</>);
      expect(screen.getByText(NOT_AVAILABLE)).toBeInTheDocument();
    },
  );
});
