import '@testing-library/jest-dom';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MockAdapter from 'axios-mock-adapter';
import React from 'react';
import { Provider } from 'react-redux';
import { useParams } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import promiseMiddleware from 'redux-promise-middleware';
import { renderWithRouter } from '../../../Utilities/TestingUtilities';
import mockedData from '../../../__mocks__/mockedData.json';
import { rhsmFacts, testProperties } from '../../../__mocks__/selectors';
import { hosts } from '../../../api/api';
import SystemCard from './SystemCard';

const fields = [
  'Host name',
  'Display name',
  'Ansible hostname',
  'SAP',
  'System purpose',
  'Number of CPUs',
  'Sockets',
  'Cores per socket',
  'CPU flags',
  'RAM',
];

const mock = new MockAdapter(hosts.axios, { onNoMatch: 'throwException' });

const location = { pathname: 'some-path' };
const removeLabelledBy = ({
  'aria-labelledby': labelledBy,
  'aria-describedby': describedby,
  id: id,
  ...restProps
}) => restProps;

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => location,
  useParams: jest.fn(() => ({
    modalId: 'testModal',
  })),
}));

jest.mock(
  '@redhat-cloud-services/frontend-components-utilities/RBACHook',
  () => ({
    esModule: true,
    usePermissionsWithContext: () => ({ hasAccess: true }),
  })
);

describe('SystemCard', () => {
  let initialState;
  let mockStore;

  beforeEach(() => {
    mockStore = configureStore([promiseMiddleware]);
    mock
      .onGet('/api/inventory/v1/hosts/test-id/system_profile')
      .reply(200, mockedData);
    mock.onGet('/api/inventory/v1/hosts/test-id').reply(200, mockedData);
        mock.onGet('/api/inventory/v1/hosts/test-id/system_profile?fields%5Bsystem_profile%5D%5B%5D=operating_system').reply(200, mockedData); // eslint-disable-line

    location.pathname = 'localhost:3000/example/path';

    initialState = {
      entityDetails: {
        entity: {
          display_name: 'test-display-name',
          ansible_host: 'test-ansible-host',
          id: 'test-id',
          facts: {
            rhsm: rhsmFacts,
          },
        },
      },
      systemProfileStore: {
        systemProfile: {
          loaded: true,
          ...testProperties,
        },
      },
    };
  });

  it('should render correctly - no data', () => {
    const store = mockStore({ systemProfileStore: {}, entityDetails: {} });
    renderWithRouter(
      <Provider store={store}>
        <SystemCard />
      </Provider>,
      ['Test detail page', '/inventory/:inventoryId']
    );

    screen.getByRole('heading', {
      name: /system properties/i,
    });
    fields.forEach(screen.getByText);
    expect(
      screen
        .getAllByRole('definition')
        .reduce((prev, cur) => prev.concat(cur.textContent), '')
    ).toBe('');
    screen.getByRole('button', {
      name: /action for host name/i,
    });
    screen.getByRole('button', {
      name: /action for display name/i,
    });
    screen.getByRole('button', {
      name: /action for ansible hostname/i,
    });
  });

  it('should render correctly with data', () => {
    const store = mockStore(initialState);
    renderWithRouter(
      <Provider store={store}>
        <SystemCard />
      </Provider>,
      ['Test detail page', '/inventory/:inventoryId']
    );

    expect(
      screen
        .getAllByRole('definition')
        .reduce((prev, cur) => prev.concat(cur.textContent), '')
    ).toBe(
      'Not availabletest-display-nametest-ansible-hostNot availableProduction1110 flags5 MB'
    );
  });

  it('should render correctly with SAP IDS', () => {
    const store = mockStore({
      ...initialState,
      systemProfileStore: {
        systemProfile: {
          loaded: true,
          ...testProperties,
          sap_sids: ['AAA', 'BBB'],
        },
      },
    });
    renderWithRouter(
      <Provider store={store}>
        <SystemCard />
      </Provider>,
      ['Test detail page', '/inventory/:inventoryId']
    );

    expect(
      screen.getByRole('definition', {
        name: /sap value/i,
      })
    ).toHaveTextContent('2 identifiers');
  });

  it('should render correctly with rhsm facts', () => {
    const store = mockStore({
      ...initialState,
      systemProfileStore: {
        systemProfile: {
          loaded: true,
        },
      },
    });
    renderWithRouter(
      <Provider store={store}>
        <SystemCard />
      </Provider>,
      ['Test detail page', '/inventory/:inventoryId']
    );

    expect(
      screen
        .getAllByRole('definition')
        .reduce((prev, cur) => prev.concat(cur.textContent), '')
    ).toBe(
      'Not availabletest-display-nametest-ansible-hostNot availableNot available212Not available2 GB'
    );
  });

  describe('API', () => {
    it('should calculate correct ansible host - direct ansible host', () => {
      const store = mockStore(initialState);
      renderWithRouter(
        <Provider store={store}>
          <SystemCard />
        </Provider>,
        ['Test detail page', '/inventory/:inventoryId']
      );

      expect(
        screen.getByRole('definition', {
          name: /ansible hostname value/i,
        })
      ).toHaveTextContent('test-ansible-host');
    });

    it('should calculate correct ansible host - fqdn', () => {
      const store = mockStore({
        ...initialState,
        entityDetails: {
          entity: {
            ...initialState.entity,
            ansible_host: undefined,
            fqdn: 'test-fqdn',
          },
        },
      });
      renderWithRouter(
        <Provider store={store}>
          <SystemCard />
        </Provider>,
        ['Test detail page', '/inventory/:inventoryId']
      );

      expect(
        screen.getByRole('definition', {
          name: /ansible hostname value/i,
        })
      ).toHaveTextContent('test-fqdn');
    });

    it('should calculate correct ansible host - fqdn', () => {
      const store = mockStore({
        ...initialState,
        entityDetails: {
          entity: {
            ...initialState.entity,
            ansible_host: undefined,
            id: 'test-id',
          },
        },
      });
      renderWithRouter(
        <Provider store={store}>
          <SystemCard />
        </Provider>,
        ['Test detail page', '/inventory/:inventoryId']
      );

      expect(
        screen.getByRole('definition', {
          name: /ansible hostname value/i,
        })
      ).toHaveTextContent('test-id');
    });

    it('should show edit display name', async () => {
      const store = mockStore(initialState);
      renderWithRouter(
        <Provider store={store}>
          <SystemCard />
        </Provider>,
        ['Test detail page', '/inventory/:inventoryId']
      );

      await userEvent.click(
        within(
          screen.getByRole('definition', {
            name: /display name value/i,
          })
        ).getByRole('img', {
          hidden: true,
        })
      );

      screen.getByRole('heading', {
        name: /edit display name/i,
      });
      screen.getByRole('textbox', {
        name: /host inventory display name/i,
      });
    });

    it('should show edit ansible hostname', async () => {
      const store = mockStore(initialState);
      renderWithRouter(
        <Provider store={store}>
          <SystemCard />
        </Provider>,
        ['Test detail page', '/inventory/:inventoryId']
      );

      await userEvent.click(
        within(
          screen.getByRole('definition', {
            name: /ansible hostname value/i,
          })
        ).getByRole('img', {
          hidden: true,
        })
      );

      screen.getByRole('heading', {
        name: /edit ansible host/i,
      });
      screen.getByRole('textbox', {
        name: /ansible host/i,
      });
    });

    it('should not call edit display name actions', async () => {
      mock.onPatch('/api/inventory/v1/hosts/test-id').reply(200, mockedData);
      mock
        .onGet('/api/inventory/v1/hosts/test-id/system_profile')
        .reply(200, mockedData);
      const store = mockStore(initialState);
      renderWithRouter(
        <Provider store={store}>
          <SystemCard />
        </Provider>,
        ['Test detail page', '/inventory/:inventoryId']
      );

      await userEvent.click(
        within(
          screen.getByRole('definition', {
            name: /display name value/i,
          })
        ).getByRole('img', {
          hidden: true,
        })
      );
      expect(store.getActions().length).toBe(0); // the button is disabled since the input hasn't been changed
    });

    it('should not call edit ansible hostname actions', async () => {
      mock.onPatch('/api/inventory/v1/hosts/test-id').reply(200, mockedData);
      mock
        .onGet('/api/inventory/v1/hosts/test-id/system_profile')
        .reply(200, mockedData);
      const store = mockStore(initialState);
      renderWithRouter(
        <Provider store={store}>
          <SystemCard />
        </Provider>,
        ['Test detail page', '/inventory/:inventoryId']
      );

      await userEvent.click(
        within(
          screen.getByRole('definition', {
            name: /ansible hostname value/i,
          })
        ).getByRole('img', {
          hidden: true,
        })
      );
      expect(store.getActions().length).toBe(0); // the button is disabled since the input hasn't been changed
    });

    it('should handle click on SAP identifiers', async () => {
      const store = mockStore({
        ...initialState,
        systemProfileStore: {
          systemProfile: {
            loaded: true,
            ...testProperties,
            sap_sids: ['AAA', 'BBB'],
          },
        },
      });
      const handleClick = jest.fn();
      location.pathname = 'localhost:3000/example/sap_sids';
      useParams.mockImplementation(() => ({ modalId: 'sap_sids' }));
      renderWithRouter(
        <Provider store={store}>
          <SystemCard handleClick={handleClick} />
        </Provider>,
        ['Test detail page', '/inventory/testModal']
      );

      await userEvent.click(
        screen.getByRole('link', {
          name: /2 identifiers/i,
        })
      );
      expect(handleClick).toHaveBeenCalledWith('SAP IDs (SID)', {
        cells: [
          {
            title: 'SID',
            transforms: expect.any(Array),
          },
        ],
        filters: [{ type: 'textual' }],
        rows: [['AAA'], ['BBB']],
      });
    });

    it('should handle click on cpu flags identifiers', async () => {
      const store = mockStore({
        ...initialState,
        systemProfileStore: {
          systemProfile: {
            loaded: true,
            ...testProperties,
            cpu_flags: ['flag_1', 'flag_2'],
          },
        },
      });
      const handleClick = jest.fn();
      location.pathname = 'localhost:3000/example/flag';
      useParams.mockImplementation(() => ({ modalId: 'flag' }));
      renderWithRouter(
        <Provider store={store}>
          <SystemCard handleClick={handleClick} />
        </Provider>,
        ['Test detail page', '/inventory/inventoryId']
      );

      await userEvent.click(
        screen.getByRole('link', {
          name: /2 flags/i,
        })
      );
      expect(handleClick).toHaveBeenCalledWith('CPU flags', {
        cells: [
          {
            title: 'flag name',
            transforms: expect.any(Array),
          },
        ],
        filters: [{ type: 'textual' }],
        rows: [['flag_1'], ['flag_2']],
      });
    });
  });

  [
    'hasHostName',
    'hasDisplayName',
    'hasAnsibleHostname',
    'hasSAP',
    'hasSystemPurpose',
    'hasCPUs',
    'hasSockets',
    'hasCores',
    'hasCPUFlags',
    'hasRAM',
  ].map((item, index) =>
    it(`should not render ${item}`, () => {
      const store = mockStore(initialState);
      renderWithRouter(
        <Provider store={store}>
          <SystemCard {...{ [item]: false }} />
        </Provider>,
        ['Test detail page', '/inventory/:inventoryId']
      );

      expect(screen.queryByText(fields[index])).not.toBeInTheDocument();
    })
  );

  it('should render extra', () => {
    const store = mockStore(initialState);
    renderWithRouter(
      <Provider store={store}>
        <SystemCard
          extra={[
            { title: 'something', value: 'test' },
            {
              title: 'with click',
              value: '1 tests',
              onClick: (_e, handleClick) =>
                handleClick('Something', {}, 'small'),
            },
          ]}
        />
      </Provider>,
      ['Test detail page', '/inventory/:inventoryId']
    );

    expect(
      screen
        .getAllByRole('definition')
        .reduce((prev, cur) => prev.concat(cur.textContent), '')
    ).toBe(
      'Not availabletest-display-nametest-ansible-hostNot availableProduction1110 flags5 MBtest1 tests'
    );
  });
});
