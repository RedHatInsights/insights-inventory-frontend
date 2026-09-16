import {
  MOVE_SYSTEM_MENU_TEXT,
  NO_MODIFY_HOSTS_TOOLTIP_MESSAGE,
  NO_MODIFY_HOST_TOOLTIP_MESSAGE,
  NO_MODIFY_WORKSPACE_TOOLTIP_MESSAGE,
  NO_MODIFY_WORKSPACES_TOOLTIP_MESSAGE,
  NO_MOVE_SYSTEM_KESSEL_TOOLTIP_MESSAGE,
} from '../../../constants';
import {
  isKesselBulkMoveSystemsDisabled,
  isKesselMoveSystemRowDisabled,
} from '../../InventoryTable/helpers';
import { hasWorkspace } from '../../SystemsView/utils/systemHelpers';
import type {
  ActionSpec,
  BulkAction,
  RowAction,
} from '../../SystemsView/actions/types';
import { ACTION_IDS, type ActionItem } from './types';

export type HostActionCallbacks<TItem extends ActionItem> = {
  onDelete: ActionSpec<TItem>['onAction'];
  onMove: ActionSpec<TItem>['onAction'];
  onAddToWorkspace: ActionSpec<TItem>['onAction'];
  onRemoveFromWorkspace: ActionSpec<TItem>['onAction'];
  onEdit: ActionSpec<TItem>['onAction'];
};

export type BuildHostActionsParams<TItem extends ActionItem> = {
  isKesselEnabled: boolean;
  hasGroupsWrite: boolean;
  hasHostsWrite: boolean;
  callbacks: HostActionCallbacks<TItem>;
};

const isEmptySelection = <TItem>(items: TItem[]) => items.length === 0;

const firstItem = <TItem>(items: TItem[]) => items[0];

const isKesselBulkDeleteDisabled = <TItem extends ActionItem>(items: TItem[]) =>
  isEmptySelection(items) ||
  items.some((item) => !(item.permissions?.hasDelete ?? false));

export const buildBulkActions = <TItem extends ActionItem>({
  isKesselEnabled,
  hasGroupsWrite,
  hasHostsWrite,
  callbacks,
}: BuildHostActionsParams<TItem>): BulkAction<TItem>[] => {
  if (isKesselEnabled) {
    return [
      {
        id: ACTION_IDS.move,
        label: 'Move',
        isPersistent: true,
        variant: 'primary',
        isDisabled: (items) => isKesselBulkMoveSystemsDisabled(true, items),
        tooltip: (items) => {
          if (
            isEmptySelection(items) ||
            !isKesselBulkMoveSystemsDisabled(true, items)
          ) {
            return undefined;
          }
          return NO_MOVE_SYSTEM_KESSEL_TOOLTIP_MESSAGE;
        },
        onAction: callbacks.onMove,
      },
      {
        id: ACTION_IDS.delete,
        label: 'Delete',
        isPersistent: true,
        variant: 'secondary',
        ouiaId: 'bulk-delete-button',
        isDisabled: isKesselBulkDeleteDisabled,
        tooltip: (items) => {
          if (isEmptySelection(items) || !isKesselBulkDeleteDisabled(items)) {
            return undefined;
          }
          return NO_MODIFY_HOSTS_TOOLTIP_MESSAGE;
        },
        onAction: callbacks.onDelete,
      },
    ];
  }

  return [
    {
      id: ACTION_IDS.delete,
      label: 'Delete',
      isPersistent: true,
      variant: 'secondary',
      ouiaId: 'bulk-delete-button',
      isDisabled: (items) => isEmptySelection(items) || !hasHostsWrite,
      onAction: callbacks.onDelete,
    },
    {
      id: ACTION_IDS.addToWorkspace,
      label: 'Add to workspace',
      isDisabled: (items) =>
        isEmptySelection(items) ||
        !hasGroupsWrite ||
        items.some((item) => hasWorkspace(item)),
      onAction: callbacks.onAddToWorkspace,
    },
    {
      id: ACTION_IDS.removeFromWorkspace,
      label: 'Remove from workspace',
      isDisabled: (items) =>
        isEmptySelection(items) ||
        !hasGroupsWrite ||
        items.some((item) => !hasWorkspace(item)),
      onAction: callbacks.onRemoveFromWorkspace,
    },
  ];
};

export const buildRowActions = <TItem extends ActionItem>({
  isKesselEnabled,
  hasGroupsWrite,
  hasHostsWrite,
  callbacks,
}: BuildHostActionsParams<TItem>): RowAction<TItem>[] => {
  if (isKesselEnabled) {
    return [
      {
        id: ACTION_IDS.move,
        label: MOVE_SYSTEM_MENU_TEXT,
        isDisabled: (items) => {
          const item = firstItem(items);
          return !item || isKesselMoveSystemRowDisabled(item, true);
        },
        tooltip: (items) => {
          const item = firstItem(items);
          if (!item || !isKesselMoveSystemRowDisabled(item, true)) {
            return undefined;
          }
          return NO_MOVE_SYSTEM_KESSEL_TOOLTIP_MESSAGE;
        },
        onAction: callbacks.onMove,
      },
      {
        id: ACTION_IDS.edit,
        label: 'Edit',
        isDisabled: (items) =>
          !(firstItem(items)?.permissions?.hasUpdate ?? false),
        tooltip: (items) =>
          firstItem(items)?.permissions?.hasUpdate
            ? undefined
            : NO_MODIFY_HOST_TOOLTIP_MESSAGE,
        onAction: callbacks.onEdit,
      },
      { id: ACTION_IDS.deleteSeparator, isSeparator: true },
      {
        id: ACTION_IDS.delete,
        label: 'Delete',
        isDanger: true,
        isDisabled: (items) =>
          !(firstItem(items)?.permissions?.hasDelete ?? false),
        tooltip: (items) =>
          firstItem(items)?.permissions?.hasDelete
            ? undefined
            : NO_MODIFY_HOST_TOOLTIP_MESSAGE,
        onAction: callbacks.onDelete,
      },
    ];
  }

  return [
    {
      id: ACTION_IDS.addToWorkspace,
      label: 'Add to workspace',
      isDisabled: (items) => {
        const item = firstItem(items);
        return !item || !hasGroupsWrite || hasWorkspace(item);
      },
      tooltip: (items) =>
        hasGroupsWrite ? undefined : NO_MODIFY_WORKSPACES_TOOLTIP_MESSAGE,
      onAction: callbacks.onAddToWorkspace,
    },
    {
      id: ACTION_IDS.removeFromWorkspace,
      label: 'Remove from workspace',
      isDisabled: (items) => {
        const item = firstItem(items);
        return !item || !hasGroupsWrite || !hasWorkspace(item);
      },
      tooltip: (items) =>
        hasGroupsWrite ? undefined : NO_MODIFY_WORKSPACE_TOOLTIP_MESSAGE,
      onAction: callbacks.onRemoveFromWorkspace,
    },
    {
      id: ACTION_IDS.edit,
      label: 'Edit display name',
      isDisabled: () => !hasHostsWrite,
      tooltip: () =>
        hasHostsWrite ? undefined : NO_MODIFY_HOST_TOOLTIP_MESSAGE,
      onAction: callbacks.onEdit,
    },
    {
      id: ACTION_IDS.delete,
      label: 'Delete from inventory',
      isDisabled: () => !hasHostsWrite,
      tooltip: () =>
        hasHostsWrite ? undefined : NO_MODIFY_HOST_TOOLTIP_MESSAGE,
      onAction: callbacks.onDelete,
    },
  ];
};
