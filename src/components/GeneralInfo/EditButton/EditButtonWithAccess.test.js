import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import EditButton from './EditButton';

jest.mock(
  '@redhat-cloud-services/frontend-components-utilities/RBACHook',
  () => ({
    esModule: true,
    usePermissionsWithContext: () => ({ hasAccess: true }),
  }),
);

jest.mock('react-redux', () => ({
  esModule: true,
  useSelector: () => ({}),
}));

describe('EditButton with access', () => {
  let onClick;

  beforeEach(() => {
    onClick = jest.fn();
  });

  it('enables with permission', () => {
    render(<EditButton onClick={onClick} />);

    expect(screen.getByRole('button', { name: /edit/i })).toBeVisible();
  });

  it('click on link', async () => {
    render(<EditButton onClick={onClick} />);

    expect(onClick).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: /edit/i }));
    await waitFor(() => expect(onClick).toHaveBeenCalled());
  });
});
