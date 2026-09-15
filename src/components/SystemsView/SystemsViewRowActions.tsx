import { ActionsColumn, type IAction } from '@patternfly/react-table';
import React from 'react';
import {
  isRowActionSeparator,
  type ActionHelpers,
  type RowAction,
} from './actions/types';

interface SystemsViewRowActionsProps<TItem> {
  system: TItem;
  rowActions: readonly RowAction<TItem>[];
  actionHelpers: ActionHelpers;
}

const SystemsViewRowActions = <TItem,>({
  system,
  rowActions,
  actionHelpers,
}: SystemsViewRowActionsProps<TItem>) => {
  const itemsForAction = [system];

  const items: IAction[] = rowActions.map((action) => {
    if (isRowActionSeparator(action)) {
      return { isSeparator: true, itemKey: action.id };
    }

    const isDisabled = action.isDisabled?.(itemsForAction) ?? false;
    const tooltip = action.tooltip?.(itemsForAction);

    return {
      title: action.label,
      itemKey: action.id,
      ouiaId: action.ouiaId,
      onClick: () => action.onAction(itemsForAction, actionHelpers),
      ...(action.isDanger && {
        isDanger: true,
        className: 'pf-v6-u-danger-color-100',
      }),
      ...(tooltip ? { tooltipProps: { content: tooltip } } : {}),
      ...(isDisabled && tooltip ? { isAriaDisabled: true } : { isDisabled }),
    };
  });

  return <ActionsColumn items={items} />;
};

export default SystemsViewRowActions;
