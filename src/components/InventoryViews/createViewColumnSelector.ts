import type { ViewConfiguration } from '../../api/inventoryViewsApi';
import type { Column } from '../SystemsView/columns/allColumnDefinitions';
import type { ColumnSelector } from '../SystemsView/columns/resolveColumnSelector';

export const createViewColumnSelector = (
  configuration?: ViewConfiguration,
): ColumnSelector | undefined => {
  if (!configuration) {
    return undefined;
  }

  const configColumns = configuration.columns ?? [];

  return (allColumns) => {
    const catalogByKey = new Map(allColumns.map((col) => [col.key, col]));
    const matchedKeys = new Set<string>();
    const result: Column[] = [];

    for (const configCol of configColumns) {
      const catalogCol = catalogByKey.get(configCol.key);
      if (!catalogCol) continue;

      matchedKeys.add(configCol.key);
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
