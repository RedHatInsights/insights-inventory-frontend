import type { TdProps, ThProps } from '@patternfly/react-table';
import { SYSTEMS_VIEW_COLUMN_MIN_WIDTHS } from './columnMinWidths';

/**
 * Left inset for the Name column so it clears the bulk-select column when both stick.
 * Keep aligned with `th:first-child` / `td:first-child` min-width in SystemsView.scss.
 */
export const STICKY_NAME_LEFT_OFFSET = 'var(--pf-t--global--spacer--2xl)';

const stickyNameShared: Pick<
  ThProps,
  'isStickyColumn' | 'hasRightBorder' | 'stickyMinWidth' | 'stickyLeftOffset'
> = {
  isStickyColumn: true,
  hasRightBorder: true,
  stickyMinWidth: SYSTEMS_VIEW_COLUMN_MIN_WIDTHS.name,
  stickyLeftOffset: STICKY_NAME_LEFT_OFFSET,
};

/** Forwarded through DataView column `props` → composable `Th` (via DataViewTh `thProps`). */
export const STICKY_NAME_HEADER_PROPS: Pick<
  ThProps,
  'isStickyColumn' | 'hasRightBorder' | 'stickyMinWidth' | 'stickyLeftOffset'
> = stickyNameShared;

/** Forwarded through DataView body cell `{ props }` → composable `Td`. */
export const STICKY_NAME_BODY_PROPS: Pick<
  TdProps,
  | 'isStickyColumn'
  | 'hasRightBorder'
  | 'stickyMinWidth'
  | 'stickyLeftOffset'
  | 'modifier'
> = {
  ...stickyNameShared,
  modifier: 'nowrap',
};
