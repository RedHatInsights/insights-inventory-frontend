import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SystemDetailsModal, {
  SystemDetailsModalProps,
} from './SystemDetailsModal';

describe('SystemDetailsModal', () => {
  const mockHandleModalToggle = jest.fn();
  const mockOnSort = jest.fn();

  const defaultProps: SystemDetailsModalProps = {
    isModalOpen: true,
    modalTitle: 'Test Modal',
    modalVariant: 'medium',
    modalData: {
      cells: [{ title: 'Name' }, { title: 'Value' }],
      rows: [
        ['Row 1 Name', 'Row 1 Value'],
        ['Row 2 Name', 'Row 2 Value'],
      ],
      expandable: false,
      filters: [],
    },
    onSort: mockOnSort,
    handleModalToggle: mockHandleModalToggle,
  };

  // Helper functions
  const renderModal = (
    overrides: Partial<SystemDetailsModalProps> = {},
  ): ReturnType<typeof render> =>
    render(<SystemDetailsModal {...defaultProps} {...overrides} />);

  const getModal = () => screen.getByRole('dialog');

  const getPrimaryCloseButton = () => screen.getByTestId('primary-close');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render modal when isModalOpen is true', () => {
      renderModal();

      expect(getModal()).toBeInTheDocument();
      expect(screen.getByText('Test Modal')).toBeInTheDocument();
    });

    it('should not render modal when isModalOpen is false', () => {
      renderModal({ isModalOpen: false });

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should render with empty title gracefully and use default', () => {
      renderModal({ modalTitle: '' });

      expect(getModal()).toBeInTheDocument();
      expect(screen.getByText('System details')).toBeInTheDocument();
    });

    it('should render InfoTable with correct data', () => {
      renderModal();

      expect(screen.getByText('Row 1 Name')).toBeInTheDocument();
      expect(screen.getByText('Row 1 Value')).toBeInTheDocument();
      expect(screen.getByText('Row 2 Name')).toBeInTheDocument();
      expect(screen.getByText('Row 2 Value')).toBeInTheDocument();
    });
  });

  describe('Close button', () => {
    it('should call handleModalToggle when Close button is clicked', async () => {
      renderModal();

      await userEvent.click(getPrimaryCloseButton());

      expect(mockHandleModalToggle).toHaveBeenCalledTimes(1);
    });

    it('should close modal when Close button is clicked', async () => {
      const { rerender } = renderModal();

      // Verify modal is open
      expect(getModal()).toBeInTheDocument();

      // Click close button
      await userEvent.click(getPrimaryCloseButton());

      // Simulate parent component updating isModalOpen to false
      rerender(<SystemDetailsModal {...defaultProps} isModalOpen={false} />);

      // Modal should be closed
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('different modal variants', () => {
    test.each<SystemDetailsModalProps['modalVariant']>([
      'small',
      'medium',
      'large',
    ])('should render with %s variant', (variant) => {
      renderModal({ modalVariant: variant });
      expect(getModal()).toBeInTheDocument();
    });
  });

  describe('real-world scenarios', () => {
    const scenarios = [
      {
        title: 'CPU flags',
        modalVariant: 'large' as const,
        cells: [{ title: 'Flag' }],
        rows: [['fpu'], ['vme'], ['de'], ['pse']],
        expectations: ['CPU flags', 'fpu', 'vme'],
      },
      {
        title: 'IPv4',
        modalVariant: 'medium' as const,
        cells: [{ title: 'Address' }],
        rows: [['192.168.1.1'], ['10.0.0.1']],
        expectations: ['IPv4', '192.168.1.1', '10.0.0.1'],
      },
    ];

    test.each(scenarios)(
      'should render $title modal data',
      ({ title, modalVariant, cells, rows, expectations }) => {
        renderModal({
          modalTitle: title,
          modalVariant,
          modalData: {
            cells,
            rows,
            expandable: false,
            filters: [],
          },
        });

        expectations.forEach((text) =>
          expect(screen.getByText(text)).toBeInTheDocument(),
        );
      },
    );
  });
});
