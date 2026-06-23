import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import DateRangePicker from './DateRangePicker';

describe('DateRangePicker', () => {
  const mockOnDateRangeChange = jest.fn();

  beforeEach(() => {
    mockOnDateRangeChange.mockClear();
  });

  it('shows placeholder text when dateRange value is not provided', () => {
    render(<DateRangePicker onDateRangeChange={mockOnDateRangeChange} />);

    expect(screen.getByPlaceholderText('Start')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('End')).toBeInTheDocument();
    expect(screen.getByText('to')).toBeInTheDocument();
  });

  it('shows date values when dateRange value is provided', () => {
    const dateRange = {
      start: '2025-01-01',
      end: '2025-01-31',
    };

    render(
      <DateRangePicker
        dateRange={dateRange}
        onDateRangeChange={mockOnDateRangeChange}
      />,
    );

    const startDateInput = screen.getByLabelText('Start date');
    expect(startDateInput).toHaveValue('2025-01-01');

    const endDateInput = screen.getByLabelText('End date');
    expect(endDateInput).toHaveValue('2025-01-31');
  });

  it('calls onDateRangeChange when start date is changed', async () => {
    const user = userEvent.setup();
    render(<DateRangePicker onDateRangeChange={mockOnDateRangeChange} />);

    const startDateInput = screen.getByLabelText('Start date');
    await user.type(startDateInput, '2025-01-01');

    expect(mockOnDateRangeChange).toHaveBeenCalledWith({
      start: '2025-01-01',
      end: undefined,
    });
  });

  it('calls onDateRangeChange when end date is changed', async () => {
    const user = userEvent.setup();
    render(<DateRangePicker onDateRangeChange={mockOnDateRangeChange} />);

    const endDateInput = screen.getByLabelText('End date');
    await user.type(endDateInput, '2025-01-31');

    expect(mockOnDateRangeChange).toHaveBeenCalledWith({
      start: undefined,
      end: '2025-01-31',
    });
  });

  it('calls onDateRangeChange with both dates when valid range is provided', async () => {
    const user = userEvent.setup();
    render(<DateRangePicker onDateRangeChange={mockOnDateRangeChange} />);

    const startDateInput = screen.getByLabelText('Start date');
    const endDateInput = screen.getByLabelText('End date');

    await user.type(startDateInput, '2025-01-01');
    await user.type(endDateInput, '2025-01-31');

    expect(mockOnDateRangeChange).toHaveBeenCalledWith({
      start: '2025-01-01',
      end: '2025-01-31',
    });
  });

  it('does not call onDateRangeChange when invalid date is entered', async () => {
    const user = userEvent.setup();
    render(<DateRangePicker onDateRangeChange={mockOnDateRangeChange} />);

    const startDateInput = screen.getByLabelText('Start date');
    await user.type(startDateInput, 'invalid-date');

    expect(mockOnDateRangeChange).not.toHaveBeenCalled();
  });

  it('calls onDateRangeChange when start date is cleared', async () => {
    const user = userEvent.setup();
    const dateRange = {
      start: '2025-01-01',
      end: '2025-01-31',
    };

    render(
      <DateRangePicker
        dateRange={dateRange}
        onDateRangeChange={mockOnDateRangeChange}
      />,
    );

    const startDateInput = screen.getByLabelText('Start date');
    await user.clear(startDateInput);

    expect(mockOnDateRangeChange).toHaveBeenCalledWith({
      start: undefined,
      end: '2025-01-31',
    });
  });

  it('calls onDateRangeChange when end date is cleared', async () => {
    const user = userEvent.setup();
    const dateRange = {
      start: '2025-01-01',
      end: '2025-01-31',
    };

    render(
      <DateRangePicker
        dateRange={dateRange}
        onDateRangeChange={mockOnDateRangeChange}
      />,
    );

    const endDateInput = screen.getByLabelText('End date');
    await user.clear(endDateInput);

    expect(mockOnDateRangeChange).toHaveBeenCalledWith({
      start: '2025-01-01',
      end: undefined,
    });
  });

  it('handles undefined dateRange prop', () => {
    render(
      <DateRangePicker
        dateRange={undefined}
        onDateRangeChange={mockOnDateRangeChange}
      />,
    );

    expect(screen.getByLabelText('Start date')).toBeInTheDocument();
    expect(screen.getByLabelText('End date')).toBeInTheDocument();
  });

  it('handles dateRange with missing start date', () => {
    const dateRange = {
      end: '2025-01-31',
    };

    render(
      <DateRangePicker
        dateRange={dateRange}
        onDateRangeChange={mockOnDateRangeChange}
      />,
    );

    expect(screen.getByDisplayValue('2025-01-31')).toBeInTheDocument();
    expect(screen.getByLabelText('Start date')).toHaveValue('');
  });

  it('handles dateRange with missing end date', () => {
    const dateRange = {
      start: '2025-01-01',
    };

    render(
      <DateRangePicker
        dateRange={dateRange}
        onDateRangeChange={mockOnDateRangeChange}
      />,
    );

    expect(screen.getByDisplayValue('2025-01-01')).toBeInTheDocument();
    expect(screen.getByLabelText('End date')).toHaveValue('');
  });

  it('shows invalid format text for invalid dates', async () => {
    const user = userEvent.setup();
    render(<DateRangePicker onDateRangeChange={mockOnDateRangeChange} />);

    const startDateInput = screen.getByLabelText('Start date');
    await user.type(startDateInput, 'invalid');
    await user.tab();

    expect(screen.getByText('Invalid date YYYY-MM-DD')).toBeInTheDocument();
  });
});
