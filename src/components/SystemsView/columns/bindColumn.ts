import type { Column, ColumnBinding, ColumnSpec } from './types';

/**
 * Merges a shared column spec with a per-app accessor binding. The only place `TValue` is
 * asserted when wrapping `renderCell` for a mixed-column table. Exposed to selectors as
 * `catalog.custom`.
 *  @param spec    Shared column identity and renderer over a cell DTO.
 *  @param binding Consumer accessor (`getValue`) and optional overrides.
 *  @returns       Runtime column with `TValue` erased and `TItem` preserved.
 */
export const bindColumn = <TItem, TValue>(
  spec: ColumnSpec<TValue>,
  binding: ColumnBinding<TItem, TValue>,
): Column<TItem> => {
  const isShownByDefault = binding.isShownByDefault ?? true;
  const sortBy = binding.sortBy ?? spec.sortBy;

  return {
    key: spec.key,
    title: spec.title,
    isShownByDefault,
    isShown: isShownByDefault,
    ...(spec.isUntoggleable !== undefined
      ? { isUntoggleable: spec.isUntoggleable }
      : {}),
    ...(spec.minWidth !== undefined ? { minWidth: spec.minWidth } : {}),
    appName: spec.appName,
    ...(sortBy !== undefined ? { sortBy } : {}),
    getValue: binding.getValue,
    renderCell: (value: unknown) => spec.renderCell(value as TValue),
  };
};
