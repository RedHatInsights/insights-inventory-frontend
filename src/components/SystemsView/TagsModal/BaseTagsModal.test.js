import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { BaseTagsModal } from './BaseTagsModal';

describe('BaseTagsModal', () => {
  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not show modal title when isOpen is false', () => {
    render(
      <BaseTagsModal isOpen={false} onClose={mockOnClose} title="Test tags">
        <span>Body</span>
      </BaseTagsModal>,
    );
    expect(
      screen.queryByRole('heading', { name: 'Test tags' }),
    ).not.toBeInTheDocument();
  });

  it('shows title and primary Close when onConfirm is omitted', async () => {
    const user = userEvent.setup();
    render(
      <BaseTagsModal isOpen onClose={mockOnClose} title="My tags">
        <span>Content</span>
      </BaseTagsModal>,
    );
    expect(
      screen.getByRole('heading', { name: 'My tags' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
    const closeButtons = screen.getAllByRole('button', { name: 'Close' });
    const footerClose = closeButtons.find((b) =>
      b.className.includes('pf-m-primary'),
    );
    expect(footerClose).toBeDefined();
    await user.click(footerClose);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  describe('with onConfirm', () => {
    it('disables Apply when not dirty', () => {
      render(
        <BaseTagsModal
          isOpen
          onClose={mockOnClose}
          title="All tags"
          onConfirm={mockOnConfirm}
          isDirty={false}
        >
          <span />
        </BaseTagsModal>,
      );
      expect(screen.getByRole('button', { name: 'Apply' })).toBeDisabled();
    });

    it('enables Apply when dirty', () => {
      render(
        <BaseTagsModal
          isOpen
          onClose={mockOnClose}
          title="All tags"
          onConfirm={mockOnConfirm}
          isDirty
        >
          <span />
        </BaseTagsModal>,
      );
      expect(screen.getByRole('button', { name: 'Apply' })).toBeEnabled();
    });

    it('calls onConfirm then onClose when Apply is clicked', async () => {
      const user = userEvent.setup();
      render(
        <BaseTagsModal
          isOpen
          onClose={mockOnClose}
          title="All tags"
          onConfirm={mockOnConfirm}
          isDirty
        >
          <span />
        </BaseTagsModal>,
      );
      await user.click(screen.getByRole('button', { name: 'Apply' }));
      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose only when Cancel is clicked', async () => {
      const user = userEvent.setup();
      render(
        <BaseTagsModal
          isOpen
          onClose={mockOnClose}
          title="All tags"
          onConfirm={mockOnConfirm}
          isDirty
        >
          <span />
        </BaseTagsModal>,
      );
      await user.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(mockOnConfirm).not.toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });
});
