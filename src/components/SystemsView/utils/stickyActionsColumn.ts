import type { TdProps, ThProps } from '@patternfly/react-table';
import { SYSTEMS_VIEW_ROW_ACTIONS_MIN_WIDTH } from './columnMinWidths';

const stickyActionsShared: Pick<
  ThProps,
  'isStickyColumn' | 'stickyMinWidth' | 'stickyLeftOffset' | 'stickyRightOffset'
> = {
  isStickyColumn: true,
  stickyMinWidth: SYSTEMS_VIEW_ROW_ACTIONS_MIN_WIDTH,
  // Right-edge sticky: keep inline-start `auto` so the cell is not pinned to the left (see Td/Th inline style merge).
  stickyLeftOffset: 'auto',
  stickyRightOffset: '0',
};

/** Trailing actions column header (kebab). */
export const STICKY_ACTIONS_HEADER_PROPS: Pick<
  ThProps,
  | 'isStickyColumn'
  | 'stickyMinWidth'
  | 'stickyLeftOffset'
  | 'stickyRightOffset'
  | 'screenReaderText'
> = {
  ...stickyActionsShared,
  screenReaderText: 'Actions',
};

/** Trailing actions cell; use with `isActionCell` (kebab menu). */
export const STICKY_ACTIONS_BODY_PROPS: Pick<
  TdProps,
  'isStickyColumn' | 'stickyMinWidth' | 'stickyLeftOffset' | 'stickyRightOffset'
> = stickyActionsShared;
