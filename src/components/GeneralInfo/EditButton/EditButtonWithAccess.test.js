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
  })
);

jest.mock('react-redux', () => ({
  esModule: true,
  useSelector: () => ({}),
}));

describe('EditButton with access', () => {
  let onClick;
  let link;

  beforeEach(() => {
    onClick = jest.fn();
    link = 'some-link';
  });

  it('enables with permission', () => {
    render(<EditButton onClick={onClick} link={link} />);

    expect(screen.getByRole('link', { name: /edit/i })).toBeVisible();
    expect(screen.getByRole('link', { name: /edit/i })).toHaveAttribute(
      'href',
      'http://localhost:5000//some-link'
    );
  });

  it('click on link', async () => {
    render(<EditButton onClick={onClick} link={link} />);

    expect(onClick).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('link', { name: /edit/i }));
    await waitFor(() => expect(onClick).toHaveBeenCalled());
  });
});
