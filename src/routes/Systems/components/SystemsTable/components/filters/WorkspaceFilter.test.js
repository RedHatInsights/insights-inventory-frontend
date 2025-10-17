import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import WorkspaceFilter from './WorkspaceFilter';

describe('WorkspaceFilter', () => {
  const mockOnChange = jest.fn();
  const mockGroups = [
    { name: 'Workspace 1', id: '1' },
    { name: 'Workspace 2', id: '2' },
    { name: 'Test Workspace', id: '3' },
  ];

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('shows placeholder', () => {
    render(<WorkspaceFilter onChange={mockOnChange} items={mockGroups} />);

    expect(
      screen.getByPlaceholderText('Filter by workspace'),
    ).toBeInTheDocument();
  });

  it('toggles dropdown open and closed', async () => {
    const user = userEvent.setup();
    render(<WorkspaceFilter onChange={mockOnChange} items={mockGroups} />);

    await user.click(screen.getByRole('button'));
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
    render(<WorkspaceFilter onChange={mockOnChange} items={mockGroups} />);

    await user.click(screen.getByRole('button'));
    await user.click(screen.getByText('Workspace 1'));

    expect(mockOnChange).toHaveBeenCalledWith(['Workspace 1']);
  });

  it('toggles workspace selection when clicked again', async () => {
    const user = userEvent.setup();
    const selectedWorkspaces = ['Workspace 1'];
    render(
      <WorkspaceFilter
        value={selectedWorkspaces}
        onChange={mockOnChange}
        items={mockGroups}
      />,
    );

    await user.click(screen.getByRole('button'));
    await user.click(screen.getByText('Workspace 1'));

    expect(mockOnChange).toHaveBeenCalledWith([]);
  });

  it('filters workspaces based on input value', async () => {
    const user = userEvent.setup();
    render(<WorkspaceFilter onChange={mockOnChange} items={mockGroups} />);

    await user.click(screen.getByRole('button'));
    const input = screen.getByPlaceholderText('Filter by workspace');
    await user.type(input, '1');

    await waitFor(() => {
      expect(screen.getByText('Workspace 1')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.queryByText('Test Workspace')).not.toBeInTheDocument();
    });
  });

  it('shows "No workspaces available" when no matches for input', async () => {
    const user = userEvent.setup();
    render(<WorkspaceFilter onChange={mockOnChange} items={mockGroups} />);

    await user.click(screen.getByRole('button'));
    const input = screen.getByPlaceholderText('Filter by workspace');
    await user.type(input, 'nonexistent');

    await waitFor(() => {
      expect(screen.getByText('No workspaces available')).toBeInTheDocument();
    });
  });

  it('shows "No workspaces available" when no groups provided', async () => {
    const user = userEvent.setup();
    render(<WorkspaceFilter onChange={mockOnChange} items={[]} />);

    await user.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(screen.getByText('No workspaces available')).toBeInTheDocument();
    });
  });

  it('handles undefined value prop', () => {
    render(
      <WorkspaceFilter
        value={undefined}
        onChange={mockOnChange}
        items={mockGroups}
      />,
    );
    expect(
      screen.getByPlaceholderText('Filter by workspace'),
    ).toBeInTheDocument();
  });

  it('resets input value when dropdown is closed', async () => {
    const user = userEvent.setup();
    render(<WorkspaceFilter onChange={mockOnChange} items={mockGroups} />);

    await user.click(screen.getByRole('button'));
    const input = screen.getByPlaceholderText('Filter by workspace');
    await user.type(input, 'test');

    await user.click(screen.getByRole('button'));
    await user.click(screen.getByRole('button'));

    expect(input.value).toBe('');
  });
});
