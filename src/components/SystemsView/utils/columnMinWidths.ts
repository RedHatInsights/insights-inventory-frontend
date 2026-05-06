import type { CSSProperties } from 'react';

/**
 * Minimum widths for Systems View table columns (CSS lengths).
 * When the inventory views feature flag is on and combined minimum widths exceed the scroll
 * container, {@link ../SystemsView.tsx InnerScrollContainer} shows horizontal scroll.
 *
 * **Where to edit:** add or change entries keyed by `Column.key` for each column
 * listed in {@link ../columns/allColumnDefinitions.ts allColumnDefinitions.ts}
 * (and the per-app `columnDefinitions` modules it pulls in).
 * New columns should get an entry here once you know how wide they need to be.
 *
 * The Name column width is also read by {@link ./stickyNameColumn.ts} for
 * `stickyMinWidth` — keep a single value here for that key.
 */
export const SYSTEMS_VIEW_COLUMN_MIN_WIDTHS: Record<string, string> = {
  name: '11rem',
  workspace: '10rem',
  tags: '6rem',
  os: '11rem',
  last_seen: '9rem',
};

/** Last column (row actions kebab); not a managed inventory column key. */
export const SYSTEMS_VIEW_ROW_ACTIONS_MIN_WIDTH = '2rem';

export function getSystemsViewColumnMinWidthStyle(
  key: string,
): { style: CSSProperties } | undefined {
  const minWidth = SYSTEMS_VIEW_COLUMN_MIN_WIDTHS[key];
  return minWidth ? { style: { minWidth } } : undefined;
}
