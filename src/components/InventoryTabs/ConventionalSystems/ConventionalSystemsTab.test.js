import '@testing-library/jest-dom';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import { useGetRegistry } from '../../../Utilities/constants';
import { mockSystemProfile } from '../../../__mocks__/hostApi';
import { hosts } from '../../../api';
import ConventionalSystemsTab from './ConventionalSystemsTab';
import { calculatePagination } from './Utilities';
import { shouldDispatch } from '../../../Utilities/testUtils';
import useFeatureFlag from '../../../Utilities/useFeatureFlag';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => () => jest.fn(),
}));
jest.mock('../../../Utilities//constants', () => ({
  ...jest.requireActual('../../../Utilities/constants'),
  useGetRegistry: jest.fn(() => ({
    getRegistry: () => ({}),
  })),
}));
jest.mock(
  '@redhat-cloud-services/frontend-components-utilities/RBACHook',
  () => ({
    esModule: true,
    usePermissionsWithContext: () => ({ hasAccess: true }),
  })
);
jest.mock('../../../Utilities/useFeatureFlag');

describe('ConventionalSystemsTab', () => {
  let mockStore;

  const system1 = {
    account: '6089719',
    ansible_host: null,
    bios_uuid: 'fe4f7cc3-799c-48e9-abc3-8a050040b876',
    created: '2020-10-27T10:07:14.453067+00:00',
    culled_timestamp: '2020-11-11T12:07:14.263615+00:00',
    display_name: 'RHIQE.31ea86a9-a439-4422-9516-27c879057535.test',
    external_id: null,
    facts: {},
    fqdn: 'RHIQE.31ea86a9-a439-4422-9516-27c879057535.test',
    id: 'ed190a06-de88-4d62-aba1-88ad402720a8',
    insights_id: 'e562e636-ea85-4427-97be-fcbc3aede49b',
    ip_addresses: null,
    mac_addresses: ['fa:16:3e:72:a6:99', '00:00:00:00:00:00'],
    rawFacts: [],
    reporter: 'puptoo',
    satellite_id: null,
    stale_timestamp: '2020-10-28T12:07:14.263615+00:00',
    stale_warning_timestamp: '2020-11-04T12:07:14.263615+00:00',
    subscription_manager_id: 'dd9714be-20fc-46c7-8fc0-ef2e4d5112cf',
    tags: [],
    updated: '2020-10-27T10:07:14.453072+00:00',
    groups: [],
  };

  const initialStore = {
    entities: {
      activeFilters: [
        { staleFilter: ['fresh', 'stale'] },
        { registeredWithFilter: ['insights'] },
      ],
      additionalTagsCount: 1,
      allTags: [
        {
          name: 'null',
          tags: [
            {
              count: 1,
              tag: {
                namespace: null,
                key: 'EZaLSÇa}{?:',
                value: 'vOSshUSIRIɌ𝓢ȚЦ𝒱Ѡ𝓧ƳȤ',
              },
            },
          ],
        },
      ],
      allTagsLoaded: true,
      allTagsPagination: { perPage: 10, page: 1 },
      columns: [
        {
          key: 'display_name',
          title: 'Name',
          renderFunc: (value) => value,
        },
        {
          key: 'tags',
          title: 'Tags',
          props: { width: 25, isStatic: true },
          renderFunc: (value) => value,
        },
        {
          key: 'updated',
          title: 'Last seen',
          renderFunc: (value) => value,
          props: { width: 25 },
        },
      ],
      count: 1,
      invConfig: {},
      loaded: true,
      page: 1,
      perPage: 50,
      rows: [system1],
      sortBy: { key: 'updated', direction: 'desc' },
      tagsLoaded: false,
      total: 1,
      operatingSystems: [],
      operatingSystemsLoaded: true,
    },
    notifications: [],
    routerData: { params: {}, path: '/' },
    systemProfileStore: { systemProfile: { loaded: false } },
  };

  const renderWithProviders = (children, store) =>
    render(
      <MemoryRouter>
        <Provider store={store}>{children}</Provider>
      </MemoryRouter>
    );

  /* beforeAll(() => {
    InventoryList.mockImplementation(() => (
      <div data-testid="inventory-table-list">InventoryTable</div>
    ));
  });
 */
  beforeEach(() => {
    mockStore = configureStore();
    useGetRegistry.mockImplementation(() => () => ({ register: () => ({}) }));
    mockSystemProfile.onGet().reply(200, { results: [] });
  });

  it('renders correctly when write permissions', async () => {
    const store = mockStore(initialStore);
    renderWithProviders(
      <ConventionalSystemsTab initialLoading={false} />,
      store
    );

    await waitFor(() => {
      screen.getByTestId('inventory-table-top-toolbar');
      screen.getByTestId('inventory-table-bottom-toolbar');
      screen.getByTestId('inventory-table-list');
    });

    expect(
      screen.getByRole('button', {
        name: /delete/i,
      })
    ).toBeEnabled();

    expect(
      within(screen.getAllByRole('row')[1]).getByRole('button', {
        name: /kebab toggle/i,
      })
    ).toBeEnabled();
  });

  it('can delete items', async () => {
    hosts.apiHostDeleteHostById = jest.fn();
    const selected = new Map();
    selected.set(system1.id, system1);

    const store = mockStore({
      ...initialStore,
      entities: {
        ...initialStore.entities,
        rows: [{ ...system1, selected: true }],
        selected,
      },
    });
    renderWithProviders(
      <ConventionalSystemsTab initialLoading={false} />,
      store
    );

    await userEvent.click(
      screen.getByRole('button', {
        name: /delete/i,
      })
    );
    expect(
      screen.getByRole('heading', {
        name: /delete from inventory/i,
      })
    ).toBeVisible();
    await userEvent.click(screen.getByTestId('confirm-inventory-delete'));
    expect(
      screen.queryByRole('heading', {
        name: /delete from inventory/i,
      })
    ).not.toBeInTheDocument();
    shouldDispatch(store, {
      payload: {
        description: `Removal of ${system1.display_name} started.`,
        dismissable: false,
        id: 'remove-initiated',
        title: 'Delete operation initiated',
        variant: 'warning',
      },
      type: '@@INSIGHTS-CORE/NOTIFICATIONS/ADD_NOTIFICATION',
    });
    shouldDispatch(store, {
      type: 'REMOVE_ENTITY',
    });
  });

  describe('Export', () => {
    it('should show the export when enabled', async () => {
      useFeatureFlag.mockImplementation(() => true);
      const store = mockStore(initialStore);
      renderWithProviders(
        <ConventionalSystemsTab initialLoading={false} />,
        store
      );

      await waitFor(() => {
        screen.getByTestId('inventory-table-top-toolbar');
        screen.getByTestId('inventory-table-bottom-toolbar');
        screen.getByTestId('inventory-table-list');
      });

      expect(
        screen.getByRole('button', {
          name: 'Export',
        })
      ).toBeInTheDocument();
    });

    it('should NOT show the export when disabled', async () => {
      useFeatureFlag.mockImplementation(() => false);
      const store = mockStore(initialStore);
      renderWithProviders(
        <ConventionalSystemsTab initialLoading={false} />,
        store
      );

      await waitFor(() => {
        screen.getByTestId('inventory-table-top-toolbar');
        screen.getByTestId('inventory-table-bottom-toolbar');
        screen.getByTestId('inventory-table-list');
      });

      expect(
        screen.queryByRole('button', {
          name: 'Export',
        })
      ).not.toBeInTheDocument();
    });
  });
});

describe('calculatePagination', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        search: '?page=5&per_page=20',
      },
    });
  });

  it('should calculate from new values', () => {
    const searchParams = new URLSearchParams();
    calculatePagination(searchParams, 1, 50);
    expect(searchParams.get('page')).toBe('1');
    expect(searchParams.get('per_page')).toBe('50');
  });

  it('should calculate from old values', () => {
    const searchParams = new URLSearchParams();
    calculatePagination(searchParams);
    expect(searchParams.get('page')).toBe('5');
    expect(searchParams.get('per_page')).toBe('20');
  });

  it('should calculate from mixed values', () => {
    const searchParams = new URLSearchParams();
    calculatePagination(searchParams, 2);
    expect(searchParams.get('page')).toBe('2');
    expect(searchParams.get('per_page')).toBe('20');
  });
});
