import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import EditButton from './EditButton';

jest.mock(
  '@redhat-cloud-services/frontend-components-utilities/RBACHook',
  () => ({
    __esModule: true,
    usePermissionsWithContext: () => ({ hasAccess: false }),
  }),
);

jest.mock('@redhat-cloud-services/frontend-components/useChrome', () => ({
  __esModule: true,
  default: () => ({
    isProd: () => true,
  }),
}));

jest.mock('react-redux', () => ({
  esModule: true,
  useSelector: () => ({}),
}));

describe('EditButton with no access', () => {
  let onClick;

  beforeEach(() => {
    onClick = jest.fn();
  });

  it('renders on production', () => {
    render(<EditButton onClick={onClick} />);

    expect(screen.getByRole('button', { name: /edit/i })).toBeVisible();
  });
});
