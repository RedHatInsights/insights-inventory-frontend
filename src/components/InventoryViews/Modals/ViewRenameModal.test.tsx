import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ViewRenameModal from './ViewRenameModal';

jest.mock(
  '@redhat-cloud-services/frontend-components-notifications/hooks',
  () => ({
    useAddNotification: () => jest.fn(),
  }),
);

let mockValidation: { isDuplicate: boolean; validated: 'default' | 'error' } = {
  isDuplicate: false,
  validated: 'default',
};

jest.mock('../hooks/useViewNameValidation', () => ({
  validateViewName: () => mockValidation,
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

function renderRenameModal(props = {}) {
  const queryClient = createTestQueryClient();

  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    viewId: 'view-123',
    currentName: 'My View',
    viewsList: [],
    onSuccess: jest.fn(),
  };

  return render(
    <QueryClientProvider client={queryClient}>
      <ViewRenameModal {...defaultProps} {...props} />
    </QueryClientProvider>,
  );
}

describe('ViewRenameModal', () => {
  beforeEach(() => {
    mockValidation = { isDuplicate: false, validated: 'default' as const };
  });

  it('should render the modal when open', () => {
    renderRenameModal();

    expect(screen.getByText('Rename view')).toBeInTheDocument();
    expect(screen.getByText('View name')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    renderRenameModal({ isOpen: false });

    expect(screen.queryByText('Rename view')).not.toBeInTheDocument();
  });

  it('should pre-fill input with current view name', () => {
    renderRenameModal({ currentName: 'My Custom View' });

    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('My Custom View');
  });

  it('should have Save button disabled when name is unchanged', () => {
    renderRenameModal({ currentName: 'My View' });

    const saveButton = screen.getByRole('button', { name: 'Save' });
    expect(saveButton).toBeDisabled();
  });

  it('should enable Save button when name is changed', async () => {
    const user = userEvent.setup();
    renderRenameModal({ currentName: 'My View' });

    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, 'Renamed View');

    const saveButton = screen.getByRole('button', { name: 'Save' });
    expect(saveButton).toBeEnabled();
  });

  it('should disable Save and show error when name is a duplicate', async () => {
    mockValidation = { isDuplicate: true, validated: 'error' as const };

    const user = userEvent.setup();
    renderRenameModal({ currentName: 'My View' });

    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, 'Existing View');

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    expect(
      screen.getByText('A view with this name already exists.'),
    ).toBeInTheDocument();
  });

  it('should not call mutate when name is a duplicate', async () => {
    mockValidation = { isDuplicate: true, validated: 'error' as const };

    const user = userEvent.setup();
    const onSuccess = jest.fn();
    renderRenameModal({ onSuccess, currentName: 'My View' });

    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, 'Existing View');

    const saveButton = screen.getByRole('button', { name: 'Save' });
    await user.click(saveButton);

    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('should call onSuccess and onClose when view is renamed', async () => {
    const user = userEvent.setup();
    const onSuccess = jest.fn();
    const onClose = jest.fn();

    renderRenameModal({ onSuccess, onClose, currentName: 'My View' });

    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, 'Renamed View');

    const saveButton = screen.getByRole('button', { name: 'Save' });
    await user.click(saveButton);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(
        expect.any(String),
        'Renamed View',
      );
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('should call onClose when Cancel is clicked', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();

    renderRenameModal({ onClose });

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);

    expect(onClose).toHaveBeenCalled();
  });

  it('should reset form to current name when closed', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();

    renderRenameModal({ onClose, currentName: 'My View' });

    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, 'Different Name');

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);

    expect(input).toHaveValue('My View');
  });
});
