import type { TdProps, ThProps } from '@patternfly/react-table';

/**
 * Left inset for the Name column so it clears the bulk-select column when both stick.
 * Keep aligned with `th:first-child` / `td:first-child` min-width in SystemsView.scss.
 */
export const STICKY_NAME_LEFT_OFFSET = 'var(--pf-t--global--spacer--2xl)';

const getStickyNameShared = (
  minWidth: string,
): Pick<
  ThProps,
  'isStickyColumn' | 'hasRightBorder' | 'stickyMinWidth' | 'stickyLeftOffset'
> => ({
  isStickyColumn: true,
  hasRightBorder: true,
  stickyMinWidth: minWidth,
  stickyLeftOffset: STICKY_NAME_LEFT_OFFSET,
});

/**
 * Forwarded through DataView column `props` → composable `Th` (via DataViewTh `thProps`).
 *  @param minWidth - CSS min-width for the sticky Name column (from column `minWidth`).
 *  @returns        Sticky header props for the Name column.
 */
export const getStickyNameHeaderProps = (
  minWidth: string,
): Pick<
  ThProps,
  'isStickyColumn' | 'hasRightBorder' | 'stickyMinWidth' | 'stickyLeftOffset'
> => getStickyNameShared(minWidth);

/**
 * Forwarded through DataView body cell `{ props }` → composable `Td`.
 *  @param minWidth - CSS min-width for the sticky Name column (from column `minWidth`).
 *  @returns        Sticky body cell props for the Name column.
 */
export const getStickyNameBodyProps = (
  minWidth: string,
): Pick<
  TdProps,
  | 'isStickyColumn'
  | 'hasRightBorder'
  | 'stickyMinWidth'
  | 'stickyLeftOffset'
  | 'modifier'
> => ({
  ...getStickyNameShared(minWidth),
  modifier: 'nowrap',
});
