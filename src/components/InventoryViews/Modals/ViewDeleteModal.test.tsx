import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ViewDeleteModal from './ViewDeleteModal';

jest.mock('../../../api/inventoryViewsApi', () => ({
  deleteViewApi: jest.fn().mockResolvedValue(undefined),
}));

jest.mock(
  '@redhat-cloud-services/frontend-components-notifications/hooks',
  () => ({
    useAddNotification: () => jest.fn(),
  }),
);

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

function renderDeleteModal(props = {}) {
  const queryClient = createTestQueryClient();

  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    viewId: 'view-123',
    viewName: 'My Custom View',
    onSuccess: jest.fn(),
  };

  return render(
    <QueryClientProvider client={queryClient}>
      <ViewDeleteModal {...defaultProps} {...props} />
    </QueryClientProvider>,
  );
}

describe('ViewDeleteModal', () => {
  it('should render the modal when open', () => {
    renderDeleteModal();

    expect(screen.getByText('Delete view')).toBeInTheDocument();
    expect(
      screen.getByText(/My Custom View/, { exact: false }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/will be permanently deleted/, { exact: false }),
    ).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    renderDeleteModal({ isOpen: false });

    expect(screen.queryByText('Delete view')).not.toBeInTheDocument();
  });

  it('should show view name in warning text', () => {
    renderDeleteModal({ viewName: 'Production Systems' });

    expect(
      screen.getByText(/Production Systems/, { exact: false }),
    ).toBeInTheDocument();
  });

  it('should have Delete button enabled by default', () => {
    renderDeleteModal();

    const deleteButton = screen.getByRole('button', { name: 'Delete' });
    expect(deleteButton).toBeEnabled();
  });

  it('should call onSuccess and onClose when confirmed', async () => {
    const user = userEvent.setup();
    const onSuccess = jest.fn();
    const onClose = jest.fn();

    renderDeleteModal({ onSuccess, onClose });

    const deleteButton = screen.getByRole('button', { name: 'Delete' });
    await user.click(deleteButton);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith('view-123');
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('should call onClose when Cancel is clicked', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();

    renderDeleteModal({ onClose });

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);

    expect(onClose).toHaveBeenCalled();
  });
});
