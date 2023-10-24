import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import HostStalenessCard from '../HostStalenessCard';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { getStore } from '../../../store';
import MockAdapter from 'axios-mock-adapter';
import { instance } from '@redhat-cloud-services/frontend-components-utilities/interceptors';

describe('Table Renders', () => {
  const mock = new MockAdapter(instance);
  const stalenessData = {
    conventional_staleness_delta: 86400,
    conventional_stale_warning_delta: 604800,
    conventional_culling_delta: 1209600,
    immutable_staleness_delta: 172800,
    immutable_stale_warning_delta: 1290600,
    immutable_culling_delta: 15552000,
    id: 'system_default',
  };

  it('Renders table with two tabs and updates when edit is selected', () => {
    render(
      <MemoryRouter>
        <Provider store={getStore()}>
          <HostStalenessCard canModifyHostStaleness={true} />
        </Provider>
      </MemoryRouter>
    );
    mock
      .onGet(`/api/edge/v1/devices/devicesview?limit=1`)
      .reply(200, { data: { total: 1 } });
    mock.onGet('/api/inventory/v1/account/staleness').reply(200, stalenessData);

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
