import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import HostStalenessCard from '../HostStalenessCard';

jest.mock(
  '@redhat-cloud-services/frontend-components-utilities/interceptors',
  () => ({
    __esModule: true,
    useAxiosWithPlatformInterceptors: () => ({
      get: jest.fn(() =>
        Promise.resolve({
          id: '7299435d-35ee-4fee-8adf-79683632fe32',
          conventional_staleness_delta: '86400',
          conventional_stale_warning_delta: '1814400',
          conventional_culling_delta: '2592000',
          immutable_staleness_delta: '172800',
          immutable_stale_warning_delta: '10368000',
          immutable_culling_delta: '15552000',
        })
      ),
    }),
  })
);

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
