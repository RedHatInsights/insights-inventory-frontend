import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import EditButton from './EditButton';

jest.mock(
  '@redhat-cloud-services/frontend-components-utilities/RBACHook',
  () => ({
    __esModule: true,
    usePermissionsWithContext: () => ({ hasAccess: false }),
  })
);

jest.mock('react-redux', () => ({
  esModule: true,
  useSelector: () => ({}),
}));

const checkDisabledEditButton = async () => {
  const button = await screen.findByRole('button', { name: /edit/i });
  await userEvent.hover(button);
  await waitFor(() => {
    expect(screen.queryByRole('tooltip')).toBeVisible();
  });
  expect(screen.queryByRole('tooltip')).toHaveTextContent(
    'You do not have the necessary permissions to modify this host.'
  );
  expect(screen.queryByRole('link')).not.toBeInTheDocument();
};

describe('EditButton with no access', () => {
  let onClick;
  let link;

  beforeEach(() => {
    onClick = jest.fn();
    link = 'some-link';
  });

  it('disables with no permission', async () => {
    render(<EditButton onClick={onClick} link={link} />);
    await checkDisabledEditButton();
  });

  it('disables with no permission - write permissions set to false', async () => {
    render(
      <EditButton onClick={onClick} link={link} writePermissions={false} />
    );
    await checkDisabledEditButton();
  });

  it('enables when write permissions are set to true', () => {
    render(
      <EditButton onClick={onClick} link={link} writePermissions={true} />
    );

    expect(screen.getByRole('link', { name: /edit/i })).toBeVisible();
    expect(screen.getByRole('link', { name: /edit/i })).toHaveAttribute(
      'href',
      'http://localhost:5000//some-link'
    );
  });
});
