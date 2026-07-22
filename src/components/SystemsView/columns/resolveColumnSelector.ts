import allColumnDefinitions, { type Column } from './allColumnDefinitions';

export type ColumnSelector = (
  allColumns: readonly Column[],
) => readonly Column[];

export const defaultColumnSelector: ColumnSelector = (all) => all;

export const selectInventoryColumns: ColumnSelector = (all) =>
  all.filter((col) => col.appName === 'inventory');

export const resolveColumnSelector = (
  selector: ColumnSelector = defaultColumnSelector,
): readonly Column[] => selector(allColumnDefinitions);
