import type { ViewConfiguration } from '../../api/inventoryViewsApi';
import type { Column } from '../SystemsView/columns/allColumnDefinitions';
import type { ColumnSelector } from '../SystemsView/columns/resolveColumnSelector';

export const createViewColumnSelector = (
  configuration?: ViewConfiguration,
): ColumnSelector | undefined => {
  if (!configuration?.columns?.length) {
    return undefined;
  }

  const configColumns = configuration.columns;

  return (allColumns) => {
    const catalogByKey = new Map(allColumns.map((col) => [col.key, col]));
    const configuredKeys = new Set(configColumns.map((c) => c.key));
    const result: Column[] = [];

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
      if (configuredKeys.has(catalogCol.key)) continue;
      result.push({
        ...catalogCol,
        isShown: false,
        isShownByDefault: false,
      });
    }

    return result;
  };
};
