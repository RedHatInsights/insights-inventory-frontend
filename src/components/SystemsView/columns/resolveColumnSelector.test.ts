import { expect } from '@jest/globals';
import allColumns from './allColumnDefinitions';
import inventoryColumns from './inventory/columnDefinitions';
import {
  type ColumnSelector,
  defaultColumnSelector,
  resolveColumnSelector,
} from './resolveColumnSelector';

const inventoryKeys = inventoryColumns.map((col) => col.key);

describe('resolveColumnSelector', () => {
  it('returns no columns with the default selector', () => {
    expect(resolveColumnSelector()).toEqual([]);
    expect(defaultColumnSelector(allColumns)).toEqual([]);
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
