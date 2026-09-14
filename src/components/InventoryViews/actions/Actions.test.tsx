import '@testing-library/jest-dom';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { expect, jest } from '@jest/globals';
import { createTestQueryClient } from '../../../Utilities/TestingUtilities';
import type {
  ActionHelpers,
  ActionSpec,
} from '../../SystemsView/actions/types';
import { isRowActionSeparator } from '../../SystemsView/actions/types';
import { ACTION_IDS, type ActionItem } from './types';

const mockUseKesselMigrationFeatureFlag = jest.fn(() => false);

jest.mock('../../../Utilities/hooks/useKesselMigrationFeatureFlag', () => ({
  useKesselMigrationFeatureFlag: () => mockUseKesselMigrationFeatureFlag(),
}));

jest.mock('../../../Utilities/hooks/useConditionalRBAC', () => ({
  useConditionalRBAC: jest.fn(() => ({ hasAccess: true })),
}));

jest.mock('../../SystemsView/hooks/useDeleteSystemsMutation', () => ({
  useDeleteSystemsMutation: jest.fn(() => ({
    onDeleteConfirm: jest.fn(),
  })),
}));

jest.mock('../../SystemsView/hooks/usePatchSystemsMutation', () => ({
  usePatchSystemsMutation: jest.fn(() => ({
    onPatchConfirm: jest.fn(),
  })),
}));

jest.mock('@redhat-cloud-services/frontend-components/useChrome', () => ({
  __esModule: true,
  default: () => ({
    getUserPermissions: jest.fn(),
  }),
}));

jest.mock(
  '@redhat-cloud-services/frontend-components-notifications/hooks',
  () => ({
    useAddNotification: () => jest.fn(),
  }),
);

jest.mock('../../InventoryGroups/Modals/AddSelectedHostsToGroupModal', () => ({
  __esModule: true,
  default: ({
    modalState,
    reloadData,
  }: {
    modalState: ActionItem[];
    reloadData: () => void | Promise<void>;
  }) => (
    <div>
      <h1>Add to workspace</h1>
      {modalState.map((system) => (
        <p key={system.id}>{system.display_name}</p>
      ))}
      <button type="button" onClick={() => void reloadData()}>
        Confirm add
      </button>
    </div>
  ),
}));

jest.mock('../../InventoryTable/MoveSystemsToWorkspaceModal', () => ({
  __esModule: true,
  default: ({
    modalState,
    reloadData,
  }: {
    modalState: ActionItem[];
    reloadData: () => void | Promise<void>;
  }) => (
    <div>
      <h1>Move system</h1>
      {modalState.map((system) => (
        <div key={system.id}>
          <p>{system.display_name}</p>
          <p>{system.groups?.[0]?.name}</p>
        </div>
      ))}
      <button type="button" onClick={() => void reloadData()}>
        Confirm move
      </button>
    </div>
  ),
}));

jest.mock('../../InventoryGroups/Modals/RemoveHostsFromGroupModal', () => ({
  __esModule: true,
  default: ({
    modalState,
    reloadData,
  }: {
    modalState: ActionItem[];
    reloadData: () => void | Promise<void>;
  }) => (
    <div>
      <h1>Remove from workspace</h1>
      {modalState.map((system) => (
        <div key={system.id}>
          <p>{system.display_name}</p>
          <p>{system.groups?.[0]?.name}</p>
        </div>
      ))}
      <button type="button" onClick={() => void reloadData()}>
        Confirm remove
      </button>
    </div>
  ),
}));

const { Actions } = require('./Actions') as typeof import('./Actions');

const { useDeleteSystemsMutation } =
  require('../../SystemsView/hooks/useDeleteSystemsMutation') as {
    useDeleteSystemsMutation: jest.Mock;
  };

const { usePatchSystemsMutation } =
  require('../../SystemsView/hooks/usePatchSystemsMutation') as {
    usePatchSystemsMutation: jest.Mock;
  };

const testSystem: ActionItem = {
  id: 'host-1',
  display_name: 'Test Host',
};

const testSystemInWorkspace: ActionItem = {
  id: 'host-1',
  display_name: 'Test Host',
  groups: [{ id: 'workspace-1', name: 'My Workspace', ungrouped: false }],
};

const actionHelpers: ActionHelpers = {
  invalidateQuery: jest.fn(async () => {}),
  clearSelection: jest.fn(),
};

function findAction(actions: readonly ActionSpec<ActionItem>[], id: string) {
  const action = actions.find((item) => item.id === id);
  if (!action || isRowActionSeparator(action)) {
    throw new Error(`Expected action ${id}`);
  }
  return action;
}

function renderHostActions(
  onReady: (actions: {
    bulkActions: readonly ActionSpec<ActionItem>[];
    rowActions: readonly ActionSpec<ActionItem>[];
  }) => void,
) {
  return render(
    <QueryClientProvider client={createTestQueryClient()}>
      <Actions>
        {({ bulkActions, rowActions }) => {
          onReady({
            bulkActions,
            rowActions: rowActions.filter(
              (action): action is ActionSpec<ActionItem> =>
                !isRowActionSeparator(action),
            ),
          });
          return <div>host actions ready</div>;
        }}
      </Actions>
    </QueryClientProvider>,
  );
}

function runAction(action: ActionSpec<ActionItem>, items: ActionItem[]) {
  act(() => {
    action.onAction(items, actionHelpers);
  });
}

describe('Actions', () => {
  beforeEach(() => {
    mockUseKesselMigrationFeatureFlag.mockReturnValue(false);
    useDeleteSystemsMutation.mockClear();
    usePatchSystemsMutation.mockClear();
    (actionHelpers.invalidateQuery as jest.Mock).mockClear();
    (actionHelpers.clearSelection as jest.Mock).mockClear();
  });

  it('does not show action modals until an action runs', () => {
    renderHostActions(() => undefined);

    expect(
      screen.queryByText(/Delete system from inventory\?/i),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: /add to workspace/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: /edit display name/i }),
    ).not.toBeInTheDocument();
  });

  it('opens the delete modal from onAction', async () => {
    let bulkActions: readonly ActionSpec<ActionItem>[] = [];
    renderHostActions((actions) => {
      bulkActions = actions.bulkActions;
    });

    runAction(findAction(bulkActions, ACTION_IDS.delete), [testSystem]);

    expect(
      await screen.findByText(/Delete system from inventory\?/i),
    ).toBeInTheDocument();
  });

  it('opens the add to workspace modal from onAction', async () => {
    let bulkActions: readonly ActionSpec<ActionItem>[] = [];
    renderHostActions((actions) => {
      bulkActions = actions.bulkActions;
    });

    runAction(findAction(bulkActions, ACTION_IDS.addToWorkspace), [testSystem]);

    expect(
      await screen.findByRole('heading', { name: /add to workspace/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('Test Host')).toBeInTheDocument();
  });

  it('opens the move modal from onAction when Kessel is enabled', async () => {
    mockUseKesselMigrationFeatureFlag.mockReturnValue(true);

    let bulkActions: readonly ActionSpec<ActionItem>[] = [];
    renderHostActions((actions) => {
      bulkActions = actions.bulkActions;
    });

    runAction(findAction(bulkActions, ACTION_IDS.move), [
      testSystemInWorkspace,
    ]);

    expect(
      await screen.findByRole('heading', { name: /move system/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('Test Host')).toBeInTheDocument();
    expect(screen.getByText('My Workspace')).toBeInTheDocument();
  });

  it('opens the remove from workspace modal from onAction', async () => {
    let bulkActions: readonly ActionSpec<ActionItem>[] = [];
    renderHostActions((actions) => {
      bulkActions = actions.bulkActions;
    });

    runAction(findAction(bulkActions, ACTION_IDS.removeFromWorkspace), [
      testSystemInWorkspace,
    ]);

    expect(
      await screen.findByRole('heading', { name: /remove from workspace/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('Test Host')).toBeInTheDocument();
    expect(screen.getByText('My Workspace')).toBeInTheDocument();
  });

  it('opens the edit modal from a row action', async () => {
    let rowActions: readonly ActionSpec<ActionItem>[] = [];
    renderHostActions((actions) => {
      rowActions = actions.rowActions;
    });

    runAction(findAction(rowActions, ACTION_IDS.edit), [testSystem]);

    expect(
      await screen.findByRole('heading', { name: /edit display name/i }),
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Host')).toBeInTheDocument();
  });

  it('uses stashed actionHelpers when the delete mutation succeeds', () => {
    let bulkActions: readonly ActionSpec<ActionItem>[] = [];
    renderHostActions((actions) => {
      bulkActions = actions.bulkActions;
    });

    runAction(findAction(bulkActions, ACTION_IDS.delete), [testSystem]);

    const params = useDeleteSystemsMutation.mock.calls.at(-1)?.[0] as {
      onInvalidate: () => void | Promise<void>;
      onSuccess?: () => void;
    };

    params.onSuccess?.();
    void params.onInvalidate();

    expect(actionHelpers.clearSelection).toHaveBeenCalled();
    expect(actionHelpers.invalidateQuery).toHaveBeenCalled();
  });

  it('uses stashed actionHelpers when the edit mutation succeeds', () => {
    let rowActions: readonly ActionSpec<ActionItem>[] = [];
    renderHostActions((actions) => {
      rowActions = actions.rowActions;
    });

    runAction(findAction(rowActions, ACTION_IDS.edit), [testSystem]);

    const params = usePatchSystemsMutation.mock.calls.at(-1)?.[0] as {
      onInvalidate: () => void | Promise<void>;
      onSuccess?: () => void;
    };

    params.onSuccess?.();
    void params.onInvalidate();

    expect(actionHelpers.clearSelection).toHaveBeenCalled();
    expect(actionHelpers.invalidateQuery).toHaveBeenCalled();
  });

  it('uses stashed actionHelpers when a workspace modal reloads data', async () => {
    let bulkActions: readonly ActionSpec<ActionItem>[] = [];
    renderHostActions((actions) => {
      bulkActions = actions.bulkActions;
    });

    runAction(findAction(bulkActions, ACTION_IDS.addToWorkspace), [testSystem]);

    await userEvent.click(screen.getByRole('button', { name: 'Confirm add' }));

    expect(actionHelpers.clearSelection).toHaveBeenCalled();
    expect(actionHelpers.invalidateQuery).toHaveBeenCalled();
  });
});
