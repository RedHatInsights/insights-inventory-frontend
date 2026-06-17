import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { expect, jest } from '@jest/globals';
import { MOVE_SYSTEM_MENU_TEXT } from '../../constants';
import { MoveSystemActionDropdownItem } from './MoveSystemActionDropdownItem';

const mockOnClick = jest.fn();

jest.mock('../../Utilities/hooks/useConditionalRBAC', () => ({
  useConditionalRBAC: jest.fn(() => ({ hasAccess: true })),
}));

describe('MoveSystemActionDropdownItem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const useConditionalRBACMock =
      require('../../Utilities/hooks/useConditionalRBAC')
        .useConditionalRBAC as jest.Mock;
    useConditionalRBACMock.mockReturnValue({ hasAccess: true });
  });

  it('renders Move system label', () => {
    render(<MoveSystemActionDropdownItem onClick={mockOnClick} />);

    expect(
      screen.getByRole('menuitem', { name: MOVE_SYSTEM_MENU_TEXT }),
    ).toBeInTheDocument();
  });

  it('is disabled when isAriaDisabled is true', () => {
    render(
      <MoveSystemActionDropdownItem onClick={mockOnClick} isAriaDisabled />,
    );

    expect(
      screen.getByRole('menuitem', { name: MOVE_SYSTEM_MENU_TEXT }),
    ).toHaveAttribute('aria-disabled', 'true');
  });
});
