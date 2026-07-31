import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { expect, jest } from '@jest/globals';
import { createTestQueryClient } from '../../Utilities/TestingUtilities';
import type { System } from '../InventoryViews/hooks/useHostsQuery';
import {
  SystemActionModalsProvider,
  useSystemActionModalsContext,
} from './SystemActionModalsContext';
import type { OpenTagsModalOptions } from './SystemActionModalsContext';
import {
  DataViewFiltersContext,
  INITIAL_INVENTORY_FILTERS,
} from './DataViewFiltersContext';

jest.mock('./hooks/useDeleteSystemsMutation', () => ({
  useDeleteSystemsMutation: jest.fn(() => ({
    onDeleteConfirm: jest.fn(),
  })),
}));

jest.mock('./hooks/usePatchSystemsMutation', () => ({
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

jest.mock('../../Utilities/hooks/useDebouncedValue', () => ({
  useDebouncedValue: (value: string) => value,
}));

jest.mock('./hooks/useTagsQuery', () => ({
  __esModule: true,
  useTagsQuery: jest.fn(() => ({
    data: [],
    total: 0,
    isLoading: false,
    isFetching: false,
    isError: false,
    error: null,
  })),
}));

const testSystem = {
  id: 'host-1',
  display_name: 'Test Host',
} as System;

const testSystemInWorkspace = {
  id: 'host-1',
  display_name: 'Test Host',
  groups: [{ id: 'workspace-1', name: 'My Workspace' }],
} as System;

function OpenDeleteModalButton({
  systems = [testSystem],
}: {
  systems?: System[];
}) {
  const { openDeleteModal } = useSystemActionModalsContext();
  return (
    <button type="button" onClick={() => openDeleteModal(systems)}>
      Open delete modal
    </button>
  );
}

function OpenAddToWorkspaceModalButton({
  systems = [testSystem],
}: {
  systems?: System[];
}) {
  const { openAddToWorkspaceModal } = useSystemActionModalsContext();
  return (
    <button type="button" onClick={() => openAddToWorkspaceModal(systems)}>
      Open add to workspace modal
    </button>
  );
}

function OpenMoveSystemsToWorkspaceModalButton({
  systems = [testSystemInWorkspace],
}: {
  systems?: System[];
}) {
  const { openMoveSystemsToWorkspaceModal } = useSystemActionModalsContext();
  return (
    <button
      type="button"
      onClick={() => openMoveSystemsToWorkspaceModal(systems)}
    >
      Open move systems to workspace modal
    </button>
  );
}

function OpenRemoveFromWorkspaceModalButton({
  systems = [testSystemInWorkspace],
}: {
  systems?: System[];
}) {
  const { openRemoveFromWorkspaceModal } = useSystemActionModalsContext();
  return (
    <button type="button" onClick={() => openRemoveFromWorkspaceModal(systems)}>
      Open remove from workspace modal
    </button>
  );
}

function OpenEditModalButton({
  systems = [testSystem],
}: {
  systems?: System[];
}) {
  const { openEditModal } = useSystemActionModalsContext();
  return (
    <button type="button" onClick={() => openEditModal(systems)}>
      Open edit modal
    </button>
  );
}

function OpenTagsModalButton({
  systems = [testSystem],
  options,
}: {
  systems?: System[];
  options?: OpenTagsModalOptions;
}) {
  const { openTagsModal } = useSystemActionModalsContext();
  return (
    <button type="button" onClick={() => openTagsModal(systems, options)}>
      Open tags modal
    </button>
  );
}

function renderWithProvider(
  ui: React.ReactNode,
  { withFilters = false }: { withFilters?: boolean } = {},
) {
  const onInvalidate = jest.fn(async () => undefined);
  const onSetFilters = jest.fn();
  const provider = (
    <QueryClientProvider client={createTestQueryClient()}>
      <SystemActionModalsProvider onInvalidate={onInvalidate}>
        {ui}
      </SystemActionModalsProvider>
    </QueryClientProvider>
  );

  const tree = withFilters ? (
    <DataViewFiltersContext.Provider
      value={{
        filters: { ...INITIAL_INVENTORY_FILTERS },
        onSetFilters,
        clearAllFilters: jest.fn(),
        lastSeenCustomRange: null,
        setLastSeenCustomRange: jest.fn(),
        ungroupedWorkspaceId: undefined,
      }}
    >
      {provider}
    </DataViewFiltersContext.Provider>
  ) : (
    provider
  );

  return {
    onInvalidate,
    onSetFilters,
    ...render(tree),
  };
}

describe('SystemActionModalsProvider (delete modal)', () => {
  it('does not show the delete modal until openDeleteModal is called', () => {
    renderWithProvider(<OpenDeleteModalButton />);

    expect(
      screen.queryByText(/Delete system from inventory\?/i),
    ).not.toBeInTheDocument();
  });

  it('opens the delete modal with the selected systems', async () => {
    renderWithProvider(<OpenDeleteModalButton />);

    await userEvent.click(
      screen.getByRole('button', { name: /open delete modal/i }),
    );

    expect(
      screen.getByText(/Delete system from inventory\?/i),
    ).toBeInTheDocument();
  });
});

describe('SystemActionModalsProvider (add to workspace modal)', () => {
  it('does not show the add to workspace modal until openAddToWorkspaceModal is called', () => {
    renderWithProvider(<OpenAddToWorkspaceModalButton />);

    expect(
      screen.queryByRole('heading', { name: /add to workspace/i }),
    ).not.toBeInTheDocument();
  });

  it('opens the add to workspace modal with the selected systems', async () => {
    renderWithProvider(<OpenAddToWorkspaceModalButton />);

    await userEvent.click(
      screen.getByRole('button', { name: /open add to workspace modal/i }),
    );

    expect(
      screen.getByRole('heading', { name: /add to workspace/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('Test Host')).toBeInTheDocument();
  });
});

describe('SystemActionModalsProvider (move systems to workspace modal)', () => {
  it('does not show the move modal until openMoveSystemsToWorkspaceModal is called', () => {
    renderWithProvider(<OpenMoveSystemsToWorkspaceModalButton />);

    expect(
      screen.queryByRole('heading', { name: /move system/i }),
    ).not.toBeInTheDocument();
  });

  it('opens the move modal with the selected systems', async () => {
    renderWithProvider(<OpenMoveSystemsToWorkspaceModalButton />);

    await userEvent.click(
      screen.getByRole('button', {
        name: /open move systems to workspace modal/i,
      }),
    );

    expect(
      screen.getByRole('heading', { name: /move system/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('Test Host')).toBeInTheDocument();
    expect(screen.getByText('My Workspace')).toBeInTheDocument();
  });
});

describe('SystemActionModalsProvider (remove from workspace modal)', () => {
  it('does not show the remove modal until openRemoveFromWorkspaceModal is called', () => {
    renderWithProvider(<OpenRemoveFromWorkspaceModalButton />);

    expect(
      screen.queryByRole('heading', { name: /remove from workspace/i }),
    ).not.toBeInTheDocument();
  });

  it('opens the remove modal with the selected systems', async () => {
    renderWithProvider(<OpenRemoveFromWorkspaceModalButton />);

    await userEvent.click(
      screen.getByRole('button', { name: /open remove from workspace modal/i }),
    );

    expect(
      screen.getByRole('heading', { name: /remove from workspace/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('Test Host')).toBeInTheDocument();
    expect(screen.getByText('My Workspace')).toBeInTheDocument();
  });
});

describe('SystemActionModalsProvider (edit display name modal)', () => {
  it('does not show the edit modal until openEditModal is called', () => {
    renderWithProvider(<OpenEditModalButton />);

    expect(
      screen.queryByRole('heading', { name: /edit display name/i }),
    ).not.toBeInTheDocument();
  });

  it('opens the edit modal with the selected system display name', async () => {
    renderWithProvider(<OpenEditModalButton />);

    await userEvent.click(
      screen.getByRole('button', { name: /open edit modal/i }),
    );

    expect(
      screen.getByRole('heading', { name: /edit display name/i }),
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Host')).toBeInTheDocument();
  });
});

describe('SystemActionModalsProvider (single-host tags modal)', () => {
  it('does not show the tags modal until openTagsModal is called', () => {
    renderWithProvider(<OpenTagsModalButton />);

    expect(
      screen.queryByRole('heading', { name: /test host/i }),
    ).not.toBeInTheDocument();
  });

  it('opens the single-host tags modal for the selected system', async () => {
    renderWithProvider(<OpenTagsModalButton />);

    await userEvent.click(
      screen.getByRole('button', { name: /open tags modal/i }),
    );

    expect(
      screen.getByRole('heading', { name: 'Test Host (0)' }),
    ).toBeInTheDocument();
  });
});

describe('SystemActionModalsProvider (all tags modal)', () => {
  it('does not show the all-tags modal until openTagsModal is called with no systems', () => {
    renderWithProvider(<OpenTagsModalButton systems={[]} />, {
      withFilters: true,
    });

    expect(
      screen.queryByRole('heading', { name: /all tags in inventory/i }),
    ).not.toBeInTheDocument();
  });

  it('opens the all-tags modal when openTagsModal is called with an empty selection', async () => {
    renderWithProvider(<OpenTagsModalButton systems={[]} />, {
      withFilters: true,
    });

    await userEvent.click(
      screen.getByRole('button', { name: /open tags modal/i }),
    );

    expect(
      screen.getByRole('heading', { name: /all tags in inventory/i }),
    ).toBeInTheDocument();
  });
});
