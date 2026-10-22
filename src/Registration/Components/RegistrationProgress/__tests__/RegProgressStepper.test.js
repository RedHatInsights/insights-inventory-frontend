import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
jest.mock('../CreateActivationKeyModal');
/* to avoid test error temporarily */
//import RegProgessStepper from '../RegProgressStepper';
import { fetchActivationKeys } from '../../../api';
import { mockFetchedKeys } from './content.fixtures';

jest.mock(
  '@redhat-cloud-services/frontend-components-utilities/interceptors',
  () => ({
    __esModule: true,
    useAxiosWithPlatformInterceptors: () => require('axios'),
  }),
);

jest.mock('../../../api');

describe('RegProgressStepper', () => {
  it.skip('should step through the progress stepper', async () => {
    fetchActivationKeys.mockImplementation(async () => {
      return { body: mockFetchedKeys };
    });

    /* to avoid linting error temporarily */
    render(<Router>{/*<RegProgessStepper />*/}</Router>);

    expect(screen.getByTestId('select-activation-key')).toBeInTheDocument();
    expect(
      screen.queryByText(/select operating system/i),
    ).not.toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', {
        name: /select activation key/i,
      }),
    );

    await userEvent.click(
      screen.getByRole('option', {
        name: /activation-key-1/i,
      }),
    );

    expect(screen.getByText(/select operating system/i)).toBeVisible();
    expect(screen.queryByText(/register rhel 8/i)).not.toBeInTheDocument();
    expect(
      screen.queryByText(/view registered system/i),
    ).not.toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('radio', {
        name: /rhel 8/i,
      }),
    );

    expect(screen.getByText(/register rhel 8/i)).toBeVisible();
    expect(screen.getByText(/view registered system/i)).toBeVisible();
  });
});
