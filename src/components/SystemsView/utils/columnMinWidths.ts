import type { CSSProperties } from 'react';
import type { Column } from '../columns/allColumnDefinitions';

/** Last column (row actions kebab); not a managed inventory column key. */
export const SYSTEMS_VIEW_ROW_ACTIONS_MIN_WIDTH = '2rem';

/** Fallback when the Name column omits `minWidth` (sticky column requires a width). */
export const DEFAULT_NAME_COLUMN_MIN_WIDTH = '11rem';

export function resolveColumnMinWidth(
  col: Pick<Column, 'key' | 'minWidth'>,
): string | undefined {
  if (col.minWidth) {
    return col.minWidth;
  }
  if (col.key === 'name') {
    return DEFAULT_NAME_COLUMN_MIN_WIDTH;
  }
  return undefined;
}

/**
 * Resolved min-width for the sticky Name column (always returns a CSS length).
 *  @param col - Column (or column-like object) with optional `minWidth`.
 *  @returns   CSS min-width for the Name column.
 */
export function getNameColumnMinWidth(col: Pick<Column, 'minWidth'>): string {
  return col.minWidth ?? DEFAULT_NAME_COLUMN_MIN_WIDTH;
}

export function getColumnMinWidthStyle(
  col: Pick<Column, 'key' | 'minWidth'>,
): { style: CSSProperties } | undefined {
  const minWidth = resolveColumnMinWidth(col);
  return minWidth ? { style: { minWidth } } : undefined;
}
