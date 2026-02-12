/// <reference types='@testing-library/jest-dom/jest-globals' />
import React from 'react';
import { jest, expect } from '@jest/globals';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import BaseDropdown from './BaseDropdown';
import userEvent from '@testing-library/user-event';

const user = userEvent.setup();

const defaultProps = {
  title: 'test-title',
  ouiaId: 'test-ouiaid',
  apiKey: 'conventional_time_to_stale' as const,
  staleness: {},
  setStaleness: jest.fn(),
  currentItem: 1,
  items: [
    { name: 'test-name1', value: 1 },
    { name: 'test-name2', value: 2 },
  ],
  isFormValid: true,
  setIsFormValid: jest.fn(),
  modalMessage: 'This is testing modal message',
};

describe('BaseDropdown', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders ouia-id', () => {
    render(<BaseDropdown {...defaultProps} />);

    expect(
      screen.getByRole('button', {
        name: /test-name1/i,
      }),
    ).toHaveAttribute('data-ouia-component-id', defaultProps.ouiaId);
  });

  it('shows title', () => {
    render(<BaseDropdown {...defaultProps} />);

    expect(screen.getByText(defaultProps.title)).toBeVisible();
  });

  it("shows currentItem's value", () => {
    render(<BaseDropdown {...defaultProps} currentItem={2} />);

    expect(
      screen.getByRole('button', {
        name: /test-name2/i,
      }),
    ).toBeVisible();
  });

  it('shows modalMessage in popover', async () => {
    render(<BaseDropdown {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: /help/i }));
    expect(screen.getByText(defaultProps.modalMessage)).toBeVisible();
  });

  it('shows correct value on selection', async () => {
    render(<BaseDropdown {...defaultProps} />);

    expect(screen.getByRole('button', { name: /test-name1/i })).toBeVisible();

    await user.click(screen.getByRole('button', { name: /test-name1/i }));
    await user.click(screen.getByRole('option', { name: /test-name2/i }));

    expect(screen.getByRole('button', { name: /test-name2/i })).toBeVisible();
  });

  it('updates staleness on selection', async () => {
    render(<BaseDropdown {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: /test-name1/i }));
    await user.click(screen.getByRole('option', { name: /test-name2/i }));

    expect(defaultProps.setStaleness).toHaveBeenCalledTimes(1);
    expect(defaultProps.setStaleness).toHaveBeenCalledWith({
      [defaultProps.apiKey]: defaultProps.items[1].value,
    });
  });

  it('calls validation on staleness change', async () => {
    const { rerender } = render(<BaseDropdown {...defaultProps} />);

    expect(defaultProps.setIsFormValid).toHaveBeenCalled();
    defaultProps.setIsFormValid.mockClear();

    rerender(<BaseDropdown {...defaultProps} />);
    expect(defaultProps.setIsFormValid).not.toHaveBeenCalled();

    rerender(
      <BaseDropdown
        {...defaultProps}
        staleness={{
          [defaultProps.apiKey]: defaultProps.items[1].value,
        }}
      />,
    );
    expect(defaultProps.setIsFormValid).toHaveBeenCalled();
  });
});
