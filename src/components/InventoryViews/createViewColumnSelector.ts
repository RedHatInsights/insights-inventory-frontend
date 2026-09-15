import type { ViewConfiguration } from '../../api/inventoryViewsApi';
import {
  bindInventoryViewColumns,
  type BoundColumn,
} from '../SystemsView/columns/inventoryViewColumns';
import type { ColumnSelector } from '../SystemsView/columns/resolveColumnSelector';
import type { InventoryBindableItem } from '../SystemsView/columns/inventory/columnDefinitions';

export const createViewColumnSelector = (
  configuration?: ViewConfiguration,
): ColumnSelector<InventoryBindableItem> | undefined => {
  if (!configuration) {
    return undefined;
  }

  const configColumns = configuration.columns;

  return (_catalog) => {
    const allColumns = bindInventoryViewColumns();
    const catalogByKey = new Map(allColumns.map((col) => [col.key, col]));
    const matchedKeys = new Set<string>(configColumns.map((col) => col.key));
    const result: BoundColumn<InventoryBindableItem>[] = [];

    for (const configCol of configColumns) {
      const catalogCol = catalogByKey.get(configCol.key);
      if (!catalogCol) continue;

      result.push({
        ...catalogCol,
        isShown: true,
        isShownByDefault: true,
      });
    }

    for (const catalogCol of allColumns) {
      if (matchedKeys.has(catalogCol.key)) continue;
      result.push({
        ...catalogCol,
        isShown: false,
        isShownByDefault: false,
      });
    }

    return result;
  };
};
