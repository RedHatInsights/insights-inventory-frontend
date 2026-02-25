import '@testing-library/jest-dom';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MockAdapter from 'axios-mock-adapter';
import React from 'react';
import configureStore from 'redux-mock-store';
import promiseMiddleware from 'redux-promise-middleware';
import mockedData from '../../../__mocks__/mockedData.json';
import { rhsmFacts, testProperties } from '../../../__mocks__/selectors';
import SystemCard from './SystemCard';
import { TestWrapper } from '../../../Utilities/TestingUtilities';
import { hostInventoryApi } from '../../../api/hostInventoryApi';
import { mockWorkloadsData } from '../dataMapper/dataMapper.test';
import {
  workloadClickTestCases,
  workloadTestCases,
} from './SystemCardTestsFixtures';

const fields = [
  'Host name',
  'Display name',
  'Ansible hostname',
  'Workspace',
  'Workloads',
];

const mock = new MockAdapter(hostInventoryApi().axios, {
  onNoMatch: 'throwException',
});

jest.mock(
  '@redhat-cloud-services/frontend-components-utilities/RBACHook',
  () => ({
    esModule: true,
    usePermissionsWithContext: () => ({ hasAccess: true }),
  }),
);

describe('SystemCard', () => {
  let initialState;
  let mockStore;
  const entity = {
    display_name: 'test-display-name',
    ansible_host: 'test-ansible-host',
    id: 'test-id',
    facts: {
      rhsm: rhsmFacts,
    },
  };

  beforeEach(() => {
    mockStore = configureStore([promiseMiddleware]);
    mock
      .onGet('/api/inventory/v1/hosts/test-id/system_profile')
      .reply(200, mockedData);
    mock.onGet('/api/inventory/v1/hosts/test-id').reply(200, mockedData);
    mock.onGet('/api/inventory/v1/hosts/test-id/system_profile?fields%5Bsystem_profile%5D%5B%5D=operating_system').reply(200, mockedData); // eslint-disable-line

    initialState = {
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
        <SystemCard writePermissions={true} />
      </TestWrapper>,
    );

    screen.getByText(/system properties/i);
    fields.forEach(screen.getByText);
    expect(
      screen.getAllByRole('definition').map((element) => element.textContent),
    ).toEqual(['', '', '', '', '']);
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
        <SystemCard writePermissions={true} entity={entity} />
      </TestWrapper>,
    );

    expect(
      screen.getAllByRole('definition').map((element) => element.textContent),
    ).toEqual([
      'Not available',
      'Not available',
      'test-display-name',
      'Not available',
      'test-ansible-host',
    ]);
  });

  it('should render correctly with Workspace', () => {
    entity.groups = [
      {
        id: 'your_favourite_uuid',
        name: 'workspace_name',
      },
    ];

    render(
      <TestWrapper
        store={mockStore({
          systemProfileStore: {
            ...initialState.systemProfileStore,
          },
        })}
      >
        <SystemCard writePermissions={true} entity={entity} />
      </TestWrapper>,
    );

    expect(screen.getByText('workspace_name')).toBeInTheDocument();
    expect(screen.getByText('workspace_name')).toHaveAttribute(
      'href',
      '//inventory/workspaces/your_favourite_uuid',
    );
  });

  it('should render correctly with rhsm facts', () => {
    entity.groups = undefined;

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
        <SystemCard writePermissions={true} entity={entity} />
      </TestWrapper>,
    );

    expect(
      screen.getAllByRole('definition').map((element) => element.textContent),
    ).toEqual([
      'Not available',
      'Not available',
      'test-display-name',
      'Not available',
      'test-ansible-host',
    ]);
  });

  describe('API', () => {
    it('should calculate correct ansible host - direct ansible host', () => {
      render(
        <TestWrapper store={mockStore(initialState)}>
          <SystemCard writePermissions={true} entity={entity} />
        </TestWrapper>,
      );

      expect(
        screen.getByRole('definition', {
          name: /ansible hostname value/i,
        }),
      ).toHaveTextContent('test-ansible-host');
    });

    it('should calculate correct ansible host - from fqdn', () => {
      entity.ansible_host = undefined;
      entity.fqdn = 'test-fqdn';
      render(
        <TestWrapper
          store={mockStore({
            ...initialState,
          })}
        >
          <SystemCard writePermissions={true} entity={entity} />
        </TestWrapper>,
      );

      expect(
        screen.getByRole('definition', {
          name: /ansible hostname value/i,
        }),
      ).toHaveTextContent('test-fqdn');
    });

    it('should calculate correct ansible host - from id', () => {
      entity.ansible_host = undefined;
      entity.fqdn = undefined;
      entity.id = 'test-id';
      render(
        <TestWrapper
          store={mockStore({
            ...initialState,
          })}
        >
          <SystemCard writePermissions={true} entity={entity} />
        </TestWrapper>,
      );

      expect(
        screen.getByRole('definition', {
          name: /ansible hostname value/i,
        }),
      ).toHaveTextContent('test-id');
    });

    it('should show edit display name', async () => {
      render(
        <TestWrapper store={mockStore(initialState)}>
          <SystemCard writePermissions={true} entity={entity} />
        </TestWrapper>,
      );

      await userEvent.click(
        (await screen.findAllByRole('button', { name: /edit/i }))[0],
      );

      const textbox = await screen.findByRole('textbox');

      expect(textbox).toBeVisible();
      expect(textbox).toHaveValue('test-display-name');
    });

    it('should show edit ansible hostname', async () => {
      entity.ansible_host = 'test-ansible-host';
      render(
        <TestWrapper store={mockStore(initialState)}>
          <SystemCard writePermissions={true} entity={entity} />
        </TestWrapper>,
      );

      await userEvent.click(
        (await screen.findAllByRole('button', { name: /edit/i }))[1],
      );

      const textbox = await screen.findByRole('textbox');

      expect(textbox).toBeVisible();
      expect(textbox).toHaveValue('test-ansible-host');
    });

    it('should not call edit display name actions', async () => {
      mock.onPatch('/api/inventory/v1/hosts/test-id').reply(200, mockedData);
      mock
        .onGet('/api/inventory/v1/hosts/test-id/system_profile')
        .reply(200, mockedData);
      const store = mockStore(initialState);
      render(
        <TestWrapper store={store}>
          <SystemCard writePermissions={true} entity={entity} />
        </TestWrapper>,
      );

      await userEvent.click(
        within(
          screen.getByRole('definition', {
            name: /display name value/i,
          }),
        ).getByRole('button', { name: /edit/i }),
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
          <SystemCard writePermissions={true} entity={entity} />
        </TestWrapper>,
      );

      await userEvent.click(
        within(
          screen.getByRole('definition', {
            name: /ansible hostname value/i,
          }),
        ).getByRole('button', { name: /edit/i }),
      );
      expect(store.getActions().length).toBe(0); // the button is disabled since the input hasn't been changed
    });
  });

  describe('ClipboardCopy', () => {
    it('should show copy button for host name when fqdn is present', () => {
      const entityWithFqdn = { ...entity, fqdn: 'my-host.example.com' };
      render(
        <TestWrapper store={mockStore(initialState)}>
          <SystemCard writePermissions={true} entity={entityWithFqdn} />
        </TestWrapper>,
      );

      const hostNameDefinition = screen.getByRole('definition', {
        name: /host name value/i,
      });
      expect(hostNameDefinition).toHaveTextContent('my-host.example.com');
      expect(
        within(hostNameDefinition).getByRole('button', {
          name: /copy to clipboard/i,
        }),
      ).toBeInTheDocument();
    });

    it('should show copy button for display name', () => {
      render(
        <TestWrapper store={mockStore(initialState)}>
          <SystemCard writePermissions={true} entity={entity} />
        </TestWrapper>,
      );

      const displayNameDefinition = screen.getByRole('definition', {
        name: /display name value/i,
      });
      expect(
        within(displayNameDefinition).getByRole('button', {
          name: /copy to clipboard/i,
        }),
      ).toBeInTheDocument();
      expect(
        within(displayNameDefinition).getByRole('button', { name: /edit/i }),
      ).toBeInTheDocument();
    });

    it('should show copy button for ansible hostname', () => {
      render(
        <TestWrapper store={mockStore(initialState)}>
          <SystemCard writePermissions={true} entity={entity} />
        </TestWrapper>,
      );

      const ansibleDefinition = screen.getByRole('definition', {
        name: /ansible hostname value/i,
      });
      expect(
        within(ansibleDefinition).getByRole('button', {
          name: /copy to clipboard/i,
        }),
      ).toBeInTheDocument();
      expect(
        within(ansibleDefinition).getByRole('button', { name: /edit/i }),
      ).toBeInTheDocument();
    });

    it('should truncate host name at 32 characters', () => {
      const longFqdn =
        'a-very-long-hostname-that-exceeds-thirty-two-characters.example.com';
      const entityWithLongFqdn = { ...entity, fqdn: longFqdn };
      render(
        <TestWrapper store={mockStore(initialState)}>
          <SystemCard writePermissions={true} entity={entityWithLongFqdn} />
        </TestWrapper>,
      );

      const hostNameDefinition = screen.getByRole('definition', {
        name: /host name value/i,
      });
      // Truncated display shows first 32 chars (and ellipsis); full value is still copyable
      expect(hostNameDefinition).toHaveTextContent(longFqdn.slice(0, 32));
    });
  });

  const fieldsToTest = [
    ['hasHostName', 'Host name'],
    ['hasDisplayName', 'Display name'],
    ['hasAnsibleHostname', 'Ansible hostname'],
    ['hasWorkspace', 'Workspace'],
  ];

  it.each(fieldsToTest)('should not render %s when disabled', (prop, label) => {
    render(
      <TestWrapper store={mockStore(initialState)}>
        <SystemCard
          writePermissions={true}
          {...{ [prop]: false }}
          entity={entity}
        />
      </TestWrapper>,
    );

    expect(screen.queryByText(label)).not.toBeInTheDocument();
  });

  it('should render extra', () => {
    entity.display_name = 'test-display-name';
    entity.ansible_host = 'test-ansible-host';
    entity.id = 'test-id';
    entity.facts = {
      rhsm: rhsmFacts,
    };

    render(
      <TestWrapper store={mockStore(initialState)}>
        <SystemCard
          writePermissions={true}
          extra={[
            { title: 'something', value: 'test' },
            {
              title: 'with click',
              value: '1 tests',
              onClick: (_e, handleClick) =>
                handleClick('Something', {}, 'small'),
            },
          ]}
          entity={entity}
        />
      </TestWrapper>,
    );

    expect(
      screen.getAllByRole('definition').map((element) => element.textContent),
    ).toEqual([
      'Not available',
      'Not available',
      'test-display-name',
      'Not available',
      'test-ansible-host',
      'test',
      '1 tests',
    ]);
  });

  describe('SystemCard workload rendering', () => {
    it.each(workloadTestCases)(
      'should render correctly with $name workload',
      ({ workloads, expectedText }) => {
        render(
          <TestWrapper
            store={mockStore({
              ...initialState,
              systemProfileStore: {
                systemProfile: {
                  loaded: true,
                  ...testProperties,
                  workloads,
                },
              },
            })}
          >
            <SystemCard writePermissions={true} entity={entity} />
          </TestWrapper>,
        );

        expect(
          screen.getByRole('definition', {
            name: /Workloads value/i,
          }),
        ).toHaveTextContent(expectedText);
      },
    );

    it('should render correctly with every workload', () => {
      render(
        <TestWrapper
          store={mockStore({
            ...initialState,
            systemProfileStore: {
              systemProfile: {
                loaded: true,
                ...testProperties,
                workloads: mockWorkloadsData,
              },
            },
          })}
        >
          <SystemCard writePermissions={true} entity={entity} />
        </TestWrapper>,
      );

      expect(
        screen.getByRole('definition', {
          name: /Workloads value/i,
        }),
      ).toHaveTextContent(
        /SAP|Ansible Automation Platform|CrowdStrike|RHEL AI|InterSystems|IBM Db2|Microsoft SQL|Oracle Database/,
      );
    });
  });

  describe('SystemCard workload clicks', () => {
    it.each(workloadClickTestCases)(
      'should handle click on %s Workloads',
      async ({
        name,
        linkText,
        workloads,
        expectedClickTitle,
        expectedData,
      }) => {
        const handleClick = jest.fn();

        render(
          <TestWrapper
            store={mockStore({
              ...initialState,
              systemProfileStore: {
                systemProfile: {
                  loaded: true,
                  ...testProperties,
                  workloads,
                },
              },
            })}
            routerProps={{ initialEntries: [`/example/${name.toLowerCase()}`] }}
          >
            <SystemCard
              handleClick={handleClick}
              writePermissions={true}
              entity={entity}
            />
          </TestWrapper>,
        );

        await userEvent.click(
          screen.getByRole('link', {
            name: linkText,
          }),
        );

        expect(handleClick).toHaveBeenCalledWith(
          expectedClickTitle,
          expectedData,
        );
      },
    );
  });
});
