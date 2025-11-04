import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import WorkspaceFilter from './WorkspaceFilter';
import {
  QueryClientWrapper,
  createTestQueryClient,
  flushPromises,
} from '../../../../../../Utilities/TestingUtilities';
import { getGroups } from '../../../../../../components/InventoryGroups/utils/api';

jest.mock('../../../../../../components/InventoryGroups/utils/api', () => ({
  __esModule: true,
  getGroups: jest.fn(),
}));

describe('WorkspaceFilter', () => {
  const mockOnChange = jest.fn();
  const mockGroupsResponse = {
    results: [
      { name: 'Workspace 1', id: '1' },
      { name: 'Workspace 2', id: '2' },
      { name: 'Test Workspace', id: '3' },
    ],
    total: 3,
    page: 1,
    per_page: 50,
  };

  beforeEach(() => {
    mockOnChange.mockClear();
    getGroups.mockClear();
    getGroups.mockResolvedValue(mockGroupsResponse);
  });

  const renderWithWrapper = (props = {}) => {
    const client = createTestQueryClient();
    return render(
      <QueryClientWrapper client={client}>
        <WorkspaceFilter onChange={mockOnChange} {...props} />
      </QueryClientWrapper>,
    );
  };

  it('shows placeholder', () => {
    renderWithWrapper();

    expect(
      screen.getByPlaceholderText('Filter by workspace'),
    ).toBeInTheDocument();
  });

  it('toggles dropdown open and closed', async () => {
    const user = userEvent.setup();
    renderWithWrapper();

    await user.click(screen.getByRole('button'));

    await flushPromises();
    await waitFor(() => {
      expect(screen.getByText('Workspace 1')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(screen.queryByText('Workspace 1')).not.toBeInTheDocument();
    });
  });

  it('calls onChange with correct data when workspace is selected', async () => {
    const user = userEvent.setup();
    renderWithWrapper();

    await user.click(screen.getByRole('button'));

    await flushPromises();
    await waitFor(() => {
      expect(screen.getByText('Workspace 1')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Workspace 1'));

    expect(mockOnChange).toHaveBeenCalledWith(['Workspace 1']);
  });

  it('toggles workspace selection when clicked again', async () => {
    const user = userEvent.setup();
    const selectedWorkspaces = ['Workspace 1'];
    renderWithWrapper({ value: selectedWorkspaces });

    await user.click(screen.getByRole('button'));

    await flushPromises();
    await waitFor(() => {
      expect(screen.getByText('Workspace 1')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Workspace 1'));

    expect(mockOnChange).toHaveBeenCalledWith([]);
  });

  it('filters workspaces based on input value', async () => {
    const user = userEvent.setup();

    // Mock filtered response
    getGroups.mockResolvedValueOnce(mockGroupsResponse).mockResolvedValueOnce({
      results: [{ name: 'Workspace 1', id: '1' }],
      total: 1,
      page: 1,
      per_page: 50,
    });

    renderWithWrapper();

    const input = screen.getByPlaceholderText('Filter by workspace');
    await user.type(input, '1');

    await flushPromises();

    // Wait for debounced search
    await waitFor(
      () => {
        expect(getGroups).toHaveBeenCalledWith(
          { type: 'standard', name: '1' },
          { page: 1, per_page: 50 },
        );
      },
      { timeout: 500 },
    );

    await waitFor(() => {
      expect(screen.getByText('Workspace 1')).toBeInTheDocument();
    });
  });

  it('shows "No workspaces available" when no matches for input', async () => {
    const user = userEvent.setup();

    // Mock empty response
    getGroups.mockResolvedValueOnce(mockGroupsResponse).mockResolvedValueOnce({
      results: [],
      total: 0,
      page: 1,
      per_page: 50,
    });

    renderWithWrapper();

    await user.click(screen.getByRole('button'));
    const input = screen.getByPlaceholderText('Filter by workspace');
    await user.type(input, 'nonexistent');

    await flushPromises();

    await waitFor(
      () => {
        expect(screen.getByText('No workspaces available')).toBeInTheDocument();
      },
      { timeout: 500 },
    );
  });

  it('handles undefined value prop', () => {
    renderWithWrapper({ value: undefined });

    expect(
      screen.getByPlaceholderText('Filter by workspace'),
    ).toBeInTheDocument();
  });

  it('preserves input value when toggling dropdown via button', async () => {
    const user = userEvent.setup();
    renderWithWrapper();

    const input = screen.getByPlaceholderText('Filter by workspace');
    await user.type(input, 'test');

    await user.click(screen.getByRole('button'));
    await flushPromises();
    await user.click(screen.getByRole('button'));

    expect(input).toHaveValue('test');
  });

  it('shows Ungrouped hosts option when not searching', async () => {
    const user = userEvent.setup();
    renderWithWrapper();

    await user.click(screen.getByRole('button'));
    await flushPromises();
    await waitFor(() => {
      expect(screen.getByText('Ungrouped hosts')).toBeInTheDocument();
    });
  });
});
