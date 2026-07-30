import allColumns from './allColumnDefinitions';
import { COLS_SHOWN_BY_DEFAULT } from '../../InventoryViews/selectLegacyInventoryColumns';
import { selectLegacyInventoryColumns } from '../../InventoryViews/selectLegacyInventoryColumns';

describe('inventoryViewsColumnSelector', () => {
  it('shows the inventory default columns', () => {
    const columns = selectLegacyInventoryColumns(allColumns);

    columns.forEach((col) => {
      const shouldShow = (COLS_SHOWN_BY_DEFAULT as readonly string[]).includes(
        col.key,
      );
      expect(col.isShown).toBe(shouldShow);
      expect(col.isShownByDefault).toBe(shouldShow);
    });
  });
});
