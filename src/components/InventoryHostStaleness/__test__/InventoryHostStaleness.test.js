import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import HostStalenessCard from '../HostStalenessCard';
import { getStore } from '../../../store';
import MockAdapter from 'axios-mock-adapter';
import { instance } from '@redhat-cloud-services/frontend-components-utilities/interceptors';
import { TestWrapper } from '../../../Utilities/TestingUtilities';
import userEvent from '@testing-library/user-event';

describe('Table Renders', () => {
  beforeAll(() => {
    const mock = new MockAdapter(instance);
    mock
      .onGet(`/api/edge/v1/devices/devicesview?limit=1`)
      .reply(200, { data: { total: 1 } });
    mock.onGet('/api/inventory/v1/account/staleness').reply(200, {
      conventional_time_to_stale: 86400,
      conventional_time_to_stale_warning: 604800,
      conventional_time_to_delete: 1209600,
      immutable_time_to_stale: 172800,
      immutable_time_to_stale_warning: 1290600,
      immutable_time_to_delete: 15552000,
      id: 'system_default',
    });
  });

  it('renders table with two tabs', async () => {
    render(
      <TestWrapper store={getStore()}>
        <HostStalenessCard canModifyHostStaleness={true} />
      </TestWrapper>
    );

    await waitFor(() => {
      screen.getByRole('tab', { name: 'Conventional (RPM-DNF)' });
      screen.getByRole('tab', { name: 'Immutable (OSTree)' });
    });
  });

  it('enables staleness options when edit is clicked', async () => {
    render(
      <TestWrapper store={getStore()}>
        <HostStalenessCard canModifyHostStaleness={true} />
      </TestWrapper>
    );

    await userEvent.click(screen.getByRole('button', { name: 'Edit' }));
    const menuToggleButtons = screen
      .getAllByRole('button')
      .filter((button) => button.classList.contains('pf-v5-c-menu-toggle'));

    menuToggleButtons.forEach((button) => expect(button).toBeEnabled());

    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeEnabled();
  });
});
