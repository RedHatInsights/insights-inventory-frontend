import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { expect, jest } from '@jest/globals';
import { createTestQueryClient } from '../../Utilities/TestingUtilities';
import type { System } from '../InventoryViews/hostsQueryOptions';
import {
  SystemActionModalsProvider,
  useSystemActionModalsContext,
} from './SystemActionModalsContext';

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

function renderWithProvider(ui: React.ReactNode) {
  const onInvalidate = jest.fn(async () => undefined);

  return {
    onInvalidate,
    ...render(
      <QueryClientProvider client={createTestQueryClient()}>
        <SystemActionModalsProvider onInvalidate={onInvalidate}>
          {ui}
        </SystemActionModalsProvider>
      </QueryClientProvider>,
    ),
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
