import { expect } from '@jest/globals';
import allColumns from './allColumnDefinitions';
import inventoryColumns from './inventory/columnDefinitions';
import {
  type ColumnSelector,
  defaultColumnSelector,
  resolveColumnSelector,
  selectInventoryColumns,
} from './resolveColumnSelector';

const inventoryKeys = inventoryColumns.map((col) => col.key);

describe('resolveColumnSelector', () => {
  it('returns the full catalog with the default selector', () => {
    expect(resolveColumnSelector()).toBe(allColumns);
    expect(defaultColumnSelector(allColumns)).toBe(allColumns);
  });

  it('returns only inventory columns with selectInventoryColumns', () => {
    const selected = selectInventoryColumns(allColumns);

    expect(selected.every((col) => col.appName === 'inventory')).toBe(true);
    expect(selected.map((col) => col.key)).toEqual(inventoryKeys);
  });

  it('allows custom selectors to reorder and override visibility', () => {
    const customSelector: ColumnSelector = (all) => {
      const byKey = Object.fromEntries(all.map((col) => [col.key, col]));
      return [
        { ...byKey.os, isShown: true, isShownByDefault: true },
        { ...byKey.name, isShown: true, isShownByDefault: true },
      ];
    };

    const selected = resolveColumnSelector(customSelector);

    expect(selected.map((col) => col.key)).toEqual(['os', 'name']);
    expect(selected.every((col) => col.isShown)).toBe(true);
  });
});
