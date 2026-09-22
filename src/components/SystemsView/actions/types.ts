import type { ButtonProps } from '@patternfly/react-core';
import type { ReactNode } from 'react';

/**
 * Callbacks SystemsView gives the consumer when an action runs.
 * Use after a mutation so the table refetch and bulk select stay in sync.
 */
export type ActionHelpers = {
  invalidateQuery: () => Promise<void>;
  clearSelection: () => void;
};

/**
 * Action definition a consumer passes to SystemsView
 */
export type ActionSpec<TItem = unknown> = {
  id: string;
  label: string;
  isDisabled?: (items: TItem[]) => boolean;
  isDanger?: boolean;
  isPersistent?: boolean;
  variant?: ButtonProps['variant'];
  ouiaId?: string;
  tooltip?: (items: TItem[]) => ReactNode;
  onAction: (items: TItem[], actionHelpers: ActionHelpers) => void;
};

export type ActionSeparator = {
  id: string;
  isSeparator: true;
};

export type BulkAction<TItem = unknown> = ActionSpec<TItem>;

export type RowAction<TItem = unknown> = ActionSpec<TItem> | ActionSeparator;

export function isRowActionSeparator<TItem>(
  action: RowAction<TItem>,
): action is ActionSeparator {
  return 'isSeparator' in action && action.isSeparator;
}
