import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ViewSaveAsModal from './ViewSaveAsModal';
import type { ViewConfiguration } from '../../../api/inventoryViewsApi';

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

const mockConfiguration: ViewConfiguration = {
  columns: [
    { key: 'display_name', visible: true },
    { key: 'os', visible: true },
  ],
  sort: {
    key: 'display_name',
    direction: 'asc',
  },
};

function renderSaveAsModal(props = {}) {
  const queryClient = createTestQueryClient();

  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    currentConfiguration: mockConfiguration,
    viewsList: [],
    onSuccess: jest.fn(),
  };

  return render(
    <QueryClientProvider client={queryClient}>
      <ViewSaveAsModal {...defaultProps} {...props} />
    </QueryClientProvider>,
  );
}

describe('SaveAsModal', () => {
  beforeEach(() => {
    mockValidation = { isDuplicate: false, validated: 'default' as const };
  });

  it('should render the modal when open', () => {
    renderSaveAsModal();

    expect(screen.getByText('Save as')).toBeInTheDocument();
    expect(screen.getByText('View name')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    renderSaveAsModal({ isOpen: false });

    expect(screen.queryByText('Save as')).not.toBeInTheDocument();
  });

  it('should have Save button disabled when name is empty', () => {
    renderSaveAsModal();

    const saveButton = screen.getByRole('button', { name: 'Save' });
    expect(saveButton).toBeDisabled();
  });

  it('should enable Save button when name is entered', async () => {
    const user = userEvent.setup();
    renderSaveAsModal();

    const input = screen.getByRole('textbox');
    await user.type(input, 'My Custom View');

    const saveButton = screen.getByRole('button', { name: 'Save' });
    expect(saveButton).toBeEnabled();
  });

  it('should call onSuccess and onClose when view is created', async () => {
    const user = userEvent.setup();
    const onSuccess = jest.fn();
    const onClose = jest.fn();

    renderSaveAsModal({ onSuccess, onClose });

    const input = screen.getByRole('textbox');
    await user.type(input, 'My Custom View');

    const saveButton = screen.getByRole('button', { name: 'Save' });
    await user.click(saveButton);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(
        expect.any(String),
        'My Custom View',
      );
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('should call onClose when Cancel is clicked', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();

    renderSaveAsModal({ onClose });

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);

    expect(onClose).toHaveBeenCalled();
  });

  it('should reset form when closed', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();

    const { rerender } = renderSaveAsModal({ onClose, isOpen: true });

    const input = screen.getByRole('textbox');
    await user.type(input, 'Test View');

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);

    const queryClient = createTestQueryClient();
    rerender(
      <QueryClientProvider client={queryClient}>
        <ViewSaveAsModal
          isOpen={true}
          onClose={onClose}
          currentConfiguration={mockConfiguration}
          viewsList={[]}
        />
      </QueryClientProvider>,
    );

    const newInput = screen.getByRole('textbox');
    expect(newInput).toHaveValue('');
  });

  it('should disable Save and show error when name is a duplicate', async () => {
    mockValidation = { isDuplicate: true, validated: 'error' as const };

    const user = userEvent.setup();
    renderSaveAsModal();

    const input = screen.getByRole('textbox');
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
    renderSaveAsModal({ onSuccess });

    const input = screen.getByRole('textbox');
    await user.type(input, 'Existing View');

    const saveButton = screen.getByRole('button', { name: 'Save' });
    await user.click(saveButton);

    expect(onSuccess).not.toHaveBeenCalled();
  });
});
