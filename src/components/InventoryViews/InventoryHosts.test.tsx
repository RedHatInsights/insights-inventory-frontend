import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { expect, jest } from '@jest/globals';
import {
  createTestQueryClient,
  TestWrapper,
} from '../../Utilities/TestingUtilities';

jest.mock('./hostsQueryOptions', () => ({
  HOSTS_QUERY_KEY: 'inventory-hosts-test',
  fetchHosts: jest.fn(async () => ({
    results: [{ id: 'host-1', display_name: 'Test Host' }],
    total: 1,
  })),
}));

jest.mock('./actions', () => ({
  Actions: ({ children }: { children: (props: unknown) => React.ReactNode }) =>
    children({ bulkActions: [], rowActions: [] }),
}));

jest.mock('../../Utilities/hooks/useHostIdsWithKessel', () => ({
  useHostIdsWithKessel: (hosts: unknown) => ({
    hostIds: [],
    isKesselEnabled: false,
    hostsWithPermissions: hosts,
    permissionsLoading: false,
    permissionsError: null,
  }),
}));

jest.mock('../../Utilities/useInventoryViewsFeatureFlag', () => ({
  __esModule: true,
  default: () => false,
}));

jest.mock('@redhat-cloud-services/frontend-components/useChrome', () => ({
  __esModule: true,
  default: () => ({
    getBundle: () => 'inventory',
    auth: {
      getUser: () =>
        Promise.resolve({
          identity: {
            account_number: '1234567',
            type: 'User',
            user: { username: 'inventory-hosts-test-user', is_org_admin: true },
          },
        }),
    },
  }),
}));

jest.mock('../../Utilities/useFeatureFlag', () => ({
  __esModule: true,
  default: jest.fn(() => false),
}));

jest.mock(
  '@redhat-cloud-services/frontend-components-utilities/interceptors',
  () => ({
    useAxiosWithPlatformInterceptors: jest.fn(() => ({})),
  }),
);

// @swc/jest does not hoist jest.mock above the compiled requires (unlike
// babel-jest), so the component under test must be required AFTER the mock
// registrations above. Same pattern as SystemsViewBulkActions.test.tsx.
const InventoryHosts = require('./InventoryHosts')
  .default as (typeof import('./InventoryHosts'))['default'];

describe('InventoryHosts', () => {
  it('renders the export menu with the legacy all-systems labels', async () => {
    // Regression test: the export became config-gated when the export
    // contract landed, and InventoryHosts (the stable systems table) must
    // still pass an export config — otherwise the button that exported all
    // systems disappears from stable. The stable table keeps the legacy
    // interaction: all systems, regardless of filters or sorting.
    render(
      <TestWrapper client={createTestQueryClient()}>
        <InventoryHosts />
      </TestWrapper>,
    );

    expect(await screen.findByText('Test Host')).toBeInTheDocument();
    const exportButton = screen.getByRole('button', { name: 'Export' });
    expect(exportButton).toBeInTheDocument();

    await userEvent.click(exportButton);
    expect(
      screen.getByRole('menuitem', { name: 'Export all systems to CSV' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', { name: 'Export all systems to JSON' }),
    ).toBeInTheDocument();
  });
});
