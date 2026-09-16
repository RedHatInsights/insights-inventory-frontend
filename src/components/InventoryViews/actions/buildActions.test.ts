import { expect, jest } from '@jest/globals';
import {
  MOVE_SYSTEM_MENU_TEXT,
  NO_MODIFY_HOSTS_TOOLTIP_MESSAGE,
  NO_MODIFY_HOST_TOOLTIP_MESSAGE,
  NO_MODIFY_WORKSPACE_TOOLTIP_MESSAGE,
  NO_MODIFY_WORKSPACES_TOOLTIP_MESSAGE,
  NO_MOVE_SYSTEM_KESSEL_TOOLTIP_MESSAGE,
} from '../../../constants';
import { isRowActionSeparator } from '../../SystemsView/actions/types';
import type { ActionHelpers } from '../../SystemsView/actions/types';
import { buildBulkActions, buildRowActions } from './buildActions';
import { ACTION_IDS, type ActionItem } from './types';

const actionHelpers: ActionHelpers = {
  invalidateQuery: jest.fn(async () => {}),
  clearSelection: jest.fn(),
};

const callbacks = {
  onDelete: jest.fn(),
  onMove: jest.fn(),
  onAddToWorkspace: jest.fn(),
  onRemoveFromWorkspace: jest.fn(),
  onEdit: jest.fn(),
};

const workspaceGroup = {
  id: 'g1',
  name: 'Workspace A',
  ungrouped: false,
} as const;

const ungroupedHost: ActionItem = { id: 'host-1', display_name: 'Host 1' };
const groupedHost: ActionItem = {
  id: 'host-2',
  display_name: 'Host 2',
  groups: [workspaceGroup],
};

const permittedHost: ActionItem = {
  ...ungroupedHost,
  permissions: {
    hasUpdate: true,
    hasDelete: true,
    hasWorkspaceEdit: true,
  },
};

function findAction<T extends { id: string }>(
  actions: readonly T[],
  id: string,
) {
  return actions.find((action) => action.id === id);
}

describe('buildBulkActions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when Kessel migration is enabled', () => {
    const bulkActions = () =>
      buildBulkActions({
        isKesselEnabled: true,
        hasGroupsWrite: false,
        hasHostsWrite: false,
        callbacks,
      });

    it('shows persistent Move and Delete and hides legacy workspace actions', () => {
      const actions = bulkActions();

      expect(actions.map((action) => action.id)).toEqual([
        ACTION_IDS.move,
        ACTION_IDS.delete,
      ]);
      expect(findAction(actions, ACTION_IDS.move)?.isPersistent).toBe(true);
      expect(findAction(actions, ACTION_IDS.move)?.variant).toBe('primary');
      expect(findAction(actions, ACTION_IDS.delete)?.isPersistent).toBe(true);
      expect(findAction(actions, ACTION_IDS.delete)?.variant).toBe('secondary');
      expect(findAction(actions, ACTION_IDS.delete)?.ouiaId).toBe(
        'bulk-delete-button',
      );
    });

    it('disables Move and Delete when nothing is selected', () => {
      const actions = bulkActions();

      expect(findAction(actions, ACTION_IDS.move)?.isDisabled?.([])).toBe(true);
      expect(findAction(actions, ACTION_IDS.delete)?.isDisabled?.([])).toBe(
        true,
      );
      expect(
        findAction(actions, ACTION_IDS.move)?.tooltip?.([]),
      ).toBeUndefined();
      expect(
        findAction(actions, ACTION_IDS.delete)?.tooltip?.([]),
      ).toBeUndefined();
    });

    it('enables Move and Delete when every selected system is permitted', () => {
      const actions = bulkActions();

      expect(
        findAction(actions, ACTION_IDS.move)?.isDisabled?.([permittedHost]),
      ).toBe(false);
      expect(
        findAction(actions, ACTION_IDS.delete)?.isDisabled?.([permittedHost]),
      ).toBe(false);
      expect(
        findAction(actions, ACTION_IDS.move)?.tooltip?.([permittedHost]),
      ).toBeUndefined();
      expect(
        findAction(actions, ACTION_IDS.delete)?.tooltip?.([permittedHost]),
      ).toBeUndefined();
    });

    it('disables Move when any selected system lacks workspace edit', () => {
      const actions = bulkActions();
      const denied = {
        ...permittedHost,
        permissions: { ...permittedHost.permissions, hasWorkspaceEdit: false },
      };
      const selected = [permittedHost, denied];

      expect(findAction(actions, ACTION_IDS.move)?.isDisabled?.(selected)).toBe(
        true,
      );
      expect(findAction(actions, ACTION_IDS.move)?.tooltip?.(selected)).toBe(
        NO_MOVE_SYSTEM_KESSEL_TOOLTIP_MESSAGE,
      );
    });

    it('disables Delete when any selected system lacks delete permission', () => {
      const actions = bulkActions();
      const denied = {
        ...permittedHost,
        permissions: { ...permittedHost.permissions, hasDelete: false },
      };
      const selected = [permittedHost, denied];

      expect(
        findAction(actions, ACTION_IDS.delete)?.isDisabled?.(selected),
      ).toBe(true);
      expect(findAction(actions, ACTION_IDS.delete)?.tooltip?.(selected)).toBe(
        NO_MODIFY_HOSTS_TOOLTIP_MESSAGE,
      );
    });

    it('calls onMove and onDelete with the selected systems', () => {
      const actions = bulkActions();
      const selected = [ungroupedHost];

      findAction(actions, ACTION_IDS.move)?.onAction(selected, actionHelpers);
      findAction(actions, ACTION_IDS.delete)?.onAction(selected, actionHelpers);

      expect(callbacks.onMove).toHaveBeenCalledWith(selected, actionHelpers);
      expect(callbacks.onDelete).toHaveBeenCalledWith(selected, actionHelpers);
    });
  });

  describe('when Kessel migration is disabled', () => {
    const bulkActions = (hasGroupsWrite = true, hasHostsWrite = true) =>
      buildBulkActions({
        isKesselEnabled: false,
        hasGroupsWrite,
        hasHostsWrite,
        callbacks,
      });

    it('shows Delete plus workspace actions and hides Move', () => {
      const actions = bulkActions();

      expect(actions.map((action) => action.id)).toEqual([
        ACTION_IDS.delete,
        ACTION_IDS.addToWorkspace,
        ACTION_IDS.removeFromWorkspace,
      ]);
      expect(findAction(actions, ACTION_IDS.delete)?.isPersistent).toBe(true);
      expect(findAction(actions, ACTION_IDS.delete)?.variant).toBe('secondary');
      expect(
        findAction(actions, ACTION_IDS.addToWorkspace)?.isPersistent,
      ).toBeUndefined();
    });

    it('disables Delete when the user lacks hosts write', () => {
      const actions = bulkActions(true, false);

      expect(
        findAction(actions, ACTION_IDS.delete)?.isDisabled?.([ungroupedHost]),
      ).toBe(true);
    });

    it('disables Add to workspace when any selected host is already grouped', () => {
      const actions = bulkActions();

      expect(
        findAction(actions, ACTION_IDS.addToWorkspace)?.isDisabled?.([
          groupedHost,
          ungroupedHost,
        ]),
      ).toBe(true);
    });

    it('disables Remove from workspace when any selected host is ungrouped', () => {
      const actions = bulkActions();

      expect(
        findAction(actions, ACTION_IDS.removeFromWorkspace)?.isDisabled?.([
          groupedHost,
          ungroupedHost,
        ]),
      ).toBe(true);
    });

    it('disables workspace actions when the user lacks groups write', () => {
      const actions = bulkActions(false, true);

      expect(
        findAction(actions, ACTION_IDS.addToWorkspace)?.isDisabled?.([
          ungroupedHost,
        ]),
      ).toBe(true);
      expect(
        findAction(actions, ACTION_IDS.removeFromWorkspace)?.isDisabled?.([
          groupedHost,
        ]),
      ).toBe(true);
    });
  });
});

describe('buildRowHostActions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when Kessel migration is enabled', () => {
    const rowActions = () =>
      buildRowActions({
        isKesselEnabled: true,
        hasGroupsWrite: false,
        hasHostsWrite: false,
        callbacks,
      });

    it('shows Move system, Edit, a separator, and Delete', () => {
      const actions = rowActions();

      expect(actions.map((action) => action.id)).toEqual([
        ACTION_IDS.move,
        ACTION_IDS.edit,
        ACTION_IDS.deleteSeparator,
        ACTION_IDS.delete,
      ]);
      expect(
        isRowActionSeparator(findAction(actions, ACTION_IDS.deleteSeparator)!),
      ).toBe(true);
      expect(findAction(actions, ACTION_IDS.move)).toMatchObject({
        label: MOVE_SYSTEM_MENU_TEXT,
      });
      expect(findAction(actions, ACTION_IDS.delete)).toMatchObject({
        label: 'Delete',
        isDanger: true,
      });
    });

    it('disables Move system without workspace edit and attaches a tooltip', () => {
      const actions = rowActions();
      const denied = {
        ...permittedHost,
        permissions: { ...permittedHost.permissions, hasWorkspaceEdit: false },
      };
      const move = findAction(actions, ACTION_IDS.move);

      expect(
        move && !isRowActionSeparator(move) && move.isDisabled?.([denied]),
      ).toBe(true);
      expect(
        move && !isRowActionSeparator(move) && move.tooltip?.([denied]),
      ).toBe(NO_MOVE_SYSTEM_KESSEL_TOOLTIP_MESSAGE);
    });

    it('disables Edit and Delete without the matching permission', () => {
      const actions = rowActions();
      const denied = {
        ...permittedHost,
        permissions: {
          hasUpdate: false,
          hasDelete: false,
          hasWorkspaceEdit: true,
        },
      };
      const edit = findAction(actions, ACTION_IDS.edit);
      const del = findAction(actions, ACTION_IDS.delete);

      expect(
        edit && !isRowActionSeparator(edit) && edit.isDisabled?.([denied]),
      ).toBe(true);
      expect(
        edit && !isRowActionSeparator(edit) && edit.tooltip?.([denied]),
      ).toBe(NO_MODIFY_HOST_TOOLTIP_MESSAGE);
      expect(
        del && !isRowActionSeparator(del) && del.isDisabled?.([denied]),
      ).toBe(true);
    });

    it('calls onAction with the row host', () => {
      const actions = rowActions();
      const move = findAction(actions, ACTION_IDS.move);
      const edit = findAction(actions, ACTION_IDS.edit);
      const del = findAction(actions, ACTION_IDS.delete);

      if (move && !isRowActionSeparator(move)) {
        move.onAction([permittedHost], actionHelpers);
      }
      if (edit && !isRowActionSeparator(edit)) {
        edit.onAction([permittedHost], actionHelpers);
      }
      if (del && !isRowActionSeparator(del)) {
        del.onAction([permittedHost], actionHelpers);
      }

      expect(callbacks.onMove).toHaveBeenCalledWith(
        [permittedHost],
        actionHelpers,
      );
      expect(callbacks.onEdit).toHaveBeenCalledWith(
        [permittedHost],
        actionHelpers,
      );
      expect(callbacks.onDelete).toHaveBeenCalledWith(
        [permittedHost],
        actionHelpers,
      );
    });
  });

  describe('when Kessel migration is disabled', () => {
    const rowActions = (hasGroupsWrite = true, hasHostsWrite = true) =>
      buildRowActions({
        isKesselEnabled: false,
        hasGroupsWrite,
        hasHostsWrite,
        callbacks,
      });

    it('shows workspace, edit, and delete items and hides Move system', () => {
      const actions = rowActions();

      expect(actions.map((action) => action.id)).toEqual([
        ACTION_IDS.addToWorkspace,
        ACTION_IDS.removeFromWorkspace,
        ACTION_IDS.edit,
        ACTION_IDS.delete,
      ]);
      expect(findAction(actions, ACTION_IDS.edit)).toMatchObject({
        label: 'Edit display name',
      });
      expect(findAction(actions, ACTION_IDS.delete)).toMatchObject({
        label: 'Delete from inventory',
      });
    });

    it('disables Add to workspace when the host is already grouped', () => {
      const actions = rowActions();
      const add = findAction(actions, ACTION_IDS.addToWorkspace);

      expect(
        add && !isRowActionSeparator(add) && add.isDisabled?.([groupedHost]),
      ).toBe(true);
      expect(
        add && !isRowActionSeparator(add) && add.tooltip?.([groupedHost]),
      ).toBeUndefined();
    });

    it('aria-disables workspace actions without groups write', () => {
      const actions = rowActions(false, true);
      const add = findAction(actions, ACTION_IDS.addToWorkspace);
      const remove = findAction(actions, ACTION_IDS.removeFromWorkspace);

      expect(
        add && !isRowActionSeparator(add) && add.tooltip?.([ungroupedHost]),
      ).toBe(NO_MODIFY_WORKSPACES_TOOLTIP_MESSAGE);
      expect(
        remove &&
          !isRowActionSeparator(remove) &&
          remove.tooltip?.([groupedHost]),
      ).toBe(NO_MODIFY_WORKSPACE_TOOLTIP_MESSAGE);
    });

    it('disables edit and delete without hosts write', () => {
      const actions = rowActions(true, false);
      const edit = findAction(actions, ACTION_IDS.edit);
      const del = findAction(actions, ACTION_IDS.delete);

      expect(
        edit &&
          !isRowActionSeparator(edit) &&
          edit.isDisabled?.([ungroupedHost]),
      ).toBe(true);
      expect(
        edit && !isRowActionSeparator(edit) && edit.tooltip?.([ungroupedHost]),
      ).toBe(NO_MODIFY_HOST_TOOLTIP_MESSAGE);
      expect(
        del && !isRowActionSeparator(del) && del.isDisabled?.([ungroupedHost]),
      ).toBe(true);
    });
  });
});
