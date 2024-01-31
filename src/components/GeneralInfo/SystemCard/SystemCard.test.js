import '@testing-library/jest-dom';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MockAdapter from 'axios-mock-adapter';
import React from 'react';
import configureStore from 'redux-mock-store';
import promiseMiddleware from 'redux-promise-middleware';
import mockedData from '../../../__mocks__/mockedData.json';
import { rhsmFacts, testProperties } from '../../../__mocks__/selectors';
import { hosts } from '../../../api/api';
import SystemCard from './SystemCard';
import { TestWrapper } from '../../../Utilities/TestingUtilities';

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
    render(
      <TestWrapper
        store={mockStore({ systemProfileStore: {}, entityDetails: {} })}
      >
        <SystemCard />
      </TestWrapper>
    );

    screen.getByRole('heading', {
      name: /system properties/i,
    });
    fields.forEach(screen.getByText);
    expect(
      screen.getAllByRole('definition').map((element) => element.textContent)
    ).toEqual(['', '', '', '', '', '', '', '', '', '']);
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
    render(
      <TestWrapper store={mockStore(initialState)}>
        <SystemCard />
      </TestWrapper>
    );

    expect(
      screen.getAllByRole('definition').map((element) => element.textContent)
    ).toEqual([
      'Not available',
      'test-display-name',
      'test-ansible-host',
      'Not available',
      'Production',
      '1',
      '1',
      '1',
      '0 flags',
      '5 MB',
    ]);
  });

  it('should render correctly with SAP IDS', () => {
    render(
      <TestWrapper
        store={mockStore({
          ...initialState,
          systemProfileStore: {
            systemProfile: {
              loaded: true,
              ...testProperties,
              sap_sids: ['AAA', 'BBB'],
            },
          },
        })}
      >
        <SystemCard />
      </TestWrapper>
    );

    expect(
      screen.getByRole('definition', {
        name: /sap value/i,
      })
    ).toHaveTextContent('2 identifiers');
  });

  it('should render correctly with rhsm facts', () => {
    render(
      <TestWrapper
        store={mockStore({
          ...initialState,
          systemProfileStore: {
            systemProfile: {
              loaded: true,
            },
          },
        })}
      >
        <SystemCard />
      </TestWrapper>
    );

    expect(
      screen.getAllByRole('definition').map((element) => element.textContent)
    ).toEqual([
      'Not available',
      'test-display-name',
      'test-ansible-host',
      'Not available',
      'Not available',
      '2',
      '1',
      '2',
      'Not available',
      '2 GB',
    ]);
  });

  describe('API', () => {
    it('should calculate correct ansible host - direct ansible host', () => {
      render(
        <TestWrapper store={mockStore(initialState)}>
          <SystemCard />
        </TestWrapper>
      );

      expect(
        screen.getByRole('definition', {
          name: /ansible hostname value/i,
        })
      ).toHaveTextContent('test-ansible-host');
    });

    it('should calculate correct ansible host - fqdn', () => {
      render(
        <TestWrapper
          store={mockStore({
            ...initialState,
            entityDetails: {
              entity: {
                ...initialState.entity,
                ansible_host: undefined,
                fqdn: 'test-fqdn',
              },
            },
          })}
        >
          <SystemCard />
        </TestWrapper>
      );

      expect(
        screen.getByRole('definition', {
          name: /ansible hostname value/i,
        })
      ).toHaveTextContent('test-fqdn');
    });

    it('should calculate correct ansible host - fqdn', () => {
      render(
        <TestWrapper
          store={mockStore({
            ...initialState,
            entityDetails: {
              entity: {
                ...initialState.entity,
                ansible_host: undefined,
                id: 'test-id',
              },
            },
          })}
        >
          <SystemCard />
        </TestWrapper>
      );

      expect(
        screen.getByRole('definition', {
          name: /ansible hostname value/i,
        })
      ).toHaveTextContent('test-id');
    });

    it('should show edit display name', async () => {
      render(
        <TestWrapper store={mockStore(initialState)}>
          <SystemCard />
        </TestWrapper>
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
      render(
        <TestWrapper store={mockStore(initialState)}>
          <SystemCard />
        </TestWrapper>
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
      render(
        <TestWrapper store={store}>
          <SystemCard />
        </TestWrapper>
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
      render(
        <TestWrapper store={store}>
          <SystemCard />
        </TestWrapper>
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
      const handleClick = jest.fn();
      render(
        <TestWrapper
          store={mockStore({
            ...initialState,
            systemProfileStore: {
              systemProfile: {
                loaded: true,
                ...testProperties,
                sap_sids: ['AAA', 'BBB'],
              },
            },
          })}
          routerProps={{ initialEntries: ['/example/sap_sids'] }}
        >
          <SystemCard handleClick={handleClick} />
        </TestWrapper>
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
      const handleClick = jest.fn();
      render(
        <TestWrapper
          store={mockStore({
            ...initialState,
            systemProfileStore: {
              systemProfile: {
                loaded: true,
                ...testProperties,
                cpu_flags: ['flag_1', 'flag_2'],
              },
            },
          })}
          routerProps={{ initialEntries: ['/example/flag'] }}
        >
          <SystemCard handleClick={handleClick} />
        </TestWrapper>
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
      render(
        <TestWrapper store={mockStore(initialState)}>
          <SystemCard {...{ [item]: false }} />
        </TestWrapper>
      );

      expect(screen.queryByText(fields[index])).not.toBeInTheDocument();
    })
  );

  it('should render extra', () => {
    render(
      <TestWrapper store={mockStore(initialState)}>
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
      </TestWrapper>
    );

    expect(
      screen.getAllByRole('definition').map((element) => element.textContent)
    ).toEqual([
      'Not available',
      'test-display-name',
      'test-ansible-host',
      'Not available',
      'Production',
      '1',
      '1',
      '1',
      '0 flags',
      '5 MB',
      'test',
      '1 tests',
    ]);
  });
});
