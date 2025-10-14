import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import LastSeenFilter from './LastSeenFilter';
import { LAST_SEEN_OPTIONS } from '../helpers';

describe('LastSeenFilter', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('shows placeholder when selected value is not provided', () => {
    render(<LastSeenFilter onChange={mockOnChange} />);

    expect(screen.getByText('Filter by last seen')).toBeInTheDocument();
  });

  it('shows selected value when provided', () => {
    const selectedValue = {
      start: '2024-01-01T00:00:00.000Z',
      end: '2024-01-02T00:00:00.000Z',
      label: 'Within the last 24 hours',
    };
    render(<LastSeenFilter value={selectedValue} onChange={mockOnChange} />);

    expect(screen.getByText('Within the last 24 hours')).toBeInTheDocument();
  });

  it('toggles dropdown open and closed', async () => {
    const user = userEvent.setup();
    render(<LastSeenFilter onChange={mockOnChange} />);

    await user.click(screen.getByRole('button'));
    await waitFor(() => {
      LAST_SEEN_OPTIONS.forEach((option) => {
        expect(screen.getByText(option.label)).toBeInTheDocument();
      });
    });
    await user.click(screen.getByRole('button'));
    await waitFor(() => {
      LAST_SEEN_OPTIONS.forEach((option) => {
        expect(screen.queryByRole(option.label)).not.toBeInTheDocument();
      });
    });
  });

  it('calls onChange with correct data when option is selected', async () => {
    const user = userEvent.setup();
    render(<LastSeenFilter onChange={mockOnChange} />);

    await user.click(screen.getByRole('button'));
    await user.click(screen.getByText('Within the last 24 hours'));

    expect(mockOnChange).toHaveBeenCalledWith({
      ...LAST_SEEN_OPTIONS[0].value,
      label: LAST_SEEN_OPTIONS[0].label,
    });
  });

  it('does not call onChange when same option is selected', async () => {
    const user = userEvent.setup();
    const selectedValue = {
      ...LAST_SEEN_OPTIONS[0].value,
      label: LAST_SEEN_OPTIONS[0].label,
    };

    render(<LastSeenFilter value={selectedValue} onChange={mockOnChange} />);

    await user.click(screen.getByRole('button'));
    await user.click(
      screen.getByRole('option', { name: 'Within the last 24 hours' }),
    );

    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('handles undefined value prop', () => {
    render(<LastSeenFilter value={undefined} onChange={mockOnChange} />);
    expect(screen.getByText('Filter by last seen')).toBeInTheDocument();
  });

  it('handles value with missing label', () => {
    const valueWithoutLabel = {
      start: '2024-01-01T00:00:00.000Z',
      end: '2024-01-02T00:00:00.000Z',
    };

    render(
      <LastSeenFilter value={valueWithoutLabel} onChange={mockOnChange} />,
    );

    expect(screen.getByText('Filter by last seen')).toBeInTheDocument();
  });
});
