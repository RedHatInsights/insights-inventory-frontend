import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import HostStalenessCard from '../HostStalenessCard';

jest.mock('react-redux', () => {
  return {
    ...jest.requireActual('react-redux'),
    useDispatch: () => {},
  };
});

describe('Table Renders', () => {
  it('Renders table with two tabs and updates when edit is selected', () => {
    render(<HostStalenessCard canModifyHostStaleness={true} />);

    expect(
      screen.getByRole('tab', { name: 'Conventional (RPM-DNF)' })
    ).toBeVisible();
    expect(
      screen.getByRole('tab', { name: 'Immutable (OSTree)' })
    ).toBeVisible();

    screen.getByRole('button', { name: 'Edit' }).click();

    expect(screen.getByRole('button', { name: 'Save' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible();
  });
});
