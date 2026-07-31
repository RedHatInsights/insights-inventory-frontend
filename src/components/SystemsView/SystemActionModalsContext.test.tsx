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

jest.mock('../../Utilities/hooks/useKesselMigrationFeatureFlag', () => ({
  useKesselMigrationFeatureFlag: jest.fn(() => false),
}));

const testSystem = {
  id: 'host-1',
  display_name: 'Test Host',
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

function renderWithProvider() {
  const onInvalidate = jest.fn(async () => undefined);
  return {
    onInvalidate,
    ...render(
      <QueryClientProvider client={createTestQueryClient()}>
        <SystemActionModalsProvider onInvalidate={onInvalidate}>
          <OpenDeleteModalButton />
        </SystemActionModalsProvider>
      </QueryClientProvider>,
    ),
  };
}

describe('SystemActionModalsProvider (delete modal)', () => {
  it('does not show the delete modal until openDeleteModal is called', () => {
    renderWithProvider();

    expect(
      screen.queryByText(/Delete system from inventory\?/i),
    ).not.toBeInTheDocument();
  });

  it('opens the delete modal with the selected systems', async () => {
    renderWithProvider();

    await userEvent.click(
      screen.getByRole('button', { name: /open delete modal/i }),
    );

    expect(
      screen.getByText(/Delete system from inventory\?/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Test Host will be removed from all localhost:5000 applications and services/i,
      ),
    ).toBeInTheDocument();
  });

  it('closes the delete modal when cancel is clicked', async () => {
    renderWithProvider();

    await userEvent.click(
      screen.getByRole('button', { name: /open delete modal/i }),
    );
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));

    expect(
      screen.queryByText(/Delete system from inventory\?/i),
    ).not.toBeInTheDocument();
  });
});
