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
    mock.onGet(`/api/inventory/v1/account/staleness/defaults`).reply(200, {
      conventional_time_to_stale: 86400,
      conventional_time_to_stale_warning: 604800,
      conventional_time_to_delete: 1209600,
      immutable_time_to_stale: 172800,
      immutable_time_to_stale_warning: 1290600,
      immutable_time_to_delete: 15552000,
      id: 'system_default',
    });
  });

  const renderHostStalenessCard = (canModifyHostStaleness = true) => {
    return render(
      <TestWrapper store={getStore()}>
        <HostStalenessCard canModifyHostStaleness={canModifyHostStaleness} />
      </TestWrapper>
    );
  };

  it('renders table with two tabs', async () => {
    renderHostStalenessCard();

    await screen.findByRole('tab', { name: 'Conventional (RPM-DNF)' });
    await screen.findByRole('tab', { name: 'Immutable (OSTree)' });
  });

  it('editing is disabled when edit is not clicked', async () => {
    renderHostStalenessCard();

    // Wait for the component to finish loading
    const menuToggleButtons = await waitFor(() =>
      screen
        .getAllByRole('button')
        .filter((button) => button.classList.contains('pf-v5-c-menu-toggle'))
    );

    menuToggleButtons.forEach((button) => expect(button).toBeDisabled());
  });

  it('enables staleness editing when edit is clicked', async () => {
    renderHostStalenessCard();

    await screen.findByRole('button', { name: 'Edit' });
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }));

    const menuToggleButtons = await waitFor(() =>
      screen
        .getAllByRole('button')
        .filter((button) => button.classList.contains('pf-v5-c-menu-toggle'))
    );

    menuToggleButtons.forEach((button) => expect(button).toBeEnabled());

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
    );
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeEnabled()
    );
  });

  it('System Staleness Dropdown cant match or be higher than staleness warning dropdown', async () => {
    renderHostStalenessCard();

    await screen.findByRole('button', { name: 'Edit' });
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }));

    const menuToggleButtons = await waitFor(() =>
      screen
        .getAllByRole('button')
        .filter((button) => button.classList.contains('pf-v5-c-menu-toggle'))
    );

    menuToggleButtons.forEach((button) => expect(button).toBeEnabled());
    await userEvent.click(menuToggleButtons[0]);
    const option = screen.getByRole('option', {
      name: /7 days/i,
    });
    await userEvent.click(option);
    expect(
      screen.getByText(/staleness must be before stale warning/i)
    ).toBeInTheDocument();

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    );
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeEnabled()
    );
  });

  it('System Staleness Warning Dropdown cant match or be higher than staleness deleting dropdown', async () => {
    renderHostStalenessCard();

    await screen.findByRole('button', { name: 'Edit' });
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }));

    const menuToggleButtons = await waitFor(() =>
      screen
        .getAllByRole('button')
        .filter((button) => button.classList.contains('pf-v5-c-menu-toggle'))
    );

    menuToggleButtons.forEach((button) => expect(button).toBeEnabled());
    await userEvent.click(menuToggleButtons[1]);
    const option = screen.getByRole('option', {
      name: /21 days/i,
    });
    await userEvent.click(option);
    expect(
      screen.getByText(/stale warning must be before deletion/i)
    ).toBeInTheDocument();

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    );
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeEnabled()
    );
  });
});
