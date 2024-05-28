import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import promiseMiddleware from 'redux-promise-middleware';
import {
  biosTest,
  collectInfoTest,
  configTest,
  infraTest,
  osTest,
  testProperties,
} from '../../../__mocks__/selectors';
import GeneralInformation from './GeneralInformation';

import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MockAdapter from 'axios-mock-adapter';
import mockedData from '../../../__mocks__/mockedData.json';
import { hosts } from '../../../api/api';
import { cloneDeep } from 'lodash';
import { TestWrapper } from '../../../Utilities/TestingUtilities';
import useInsightsNavigate from '@redhat-cloud-services/frontend-components-utilities/useInsightsNavigate';

const mock = new MockAdapter(hosts.axios, { onNoMatch: 'throwException' });

jest.mock(
  '@redhat-cloud-services/frontend-components-utilities/RBACHook',
  () => ({
    esModule: true,
    usePermissionsWithContext: () => ({ hasAccess: true }),
  })
);
jest.mock(
  '@redhat-cloud-services/frontend-components-utilities/useInsightsNavigate'
);

const expectCardsToExist = (
  titles = [
    'System properties',
    'Infrastructure',
    'System status',
    'Data collectors',
    'Operating system',
    'BIOS',
    'Configuration',
  ]
) => {
  titles.forEach((title) => {
    expect(
      screen.getByRole('heading', {
        name: title,
      })
    ).toBeVisible();
  });
};

describe('GeneralInformation', () => {
  let initialState;
  let mockStore;

  beforeEach(() => {
    mockStore = configureStore([promiseMiddleware]);
    initialState = {
      entityDetails: {
        entity: {
          id: 'test-id',
          per_reporter_staleness: {},
        },
      },
      systemProfileStore: {
        systemProfile: {
          loaded: true,
          ...infraTest,
          ...osTest,
          ...biosTest,
          ...collectInfoTest,
          ...configTest,
          ...testProperties,
          network: {
            ipv4: ['1', '2'],
            ipv6: ['6', '3'],
            interfaces: [
              {
                mac_address: '0:0:0',
                mtu: 150,
                name: 'some name',
                state: 'UP',
                type: 'some type',
              },
              {
                mac_address: '1:0:0',
                mtu: 1150,
                name: 'asome name',
                state: 'UP',
                type: 'asome type',
              },
            ],
          },
        },
      },
    };
  });

  it('should render correctly - no data', () => {
    const store = mockStore({ systemProfileStore: {}, entityDetails: {} });
    render(
      <MemoryRouter initialEntries={['/example']}>
        <Provider store={store}>
          <GeneralInformation inventoryId={'test-id'} />
        </Provider>
      </MemoryRouter>
    );

    expectCardsToExist();
  });

  it('should render correctly', () => {
    const store = mockStore(initialState);
    const view = render(
      <MemoryRouter initialEntries={['/example']}>
        <Provider store={store}>
          <GeneralInformation inventoryId={'test-id'} />
        </Provider>
      </MemoryRouter>
    );

    expectCardsToExist();
    expect(view.asFragment()).toMatchSnapshot();
  });

  describe('custom components', () => {
    const mapping = {
      SystemCardWrapper: 'System properties',
      OperatingSystemCardWrapper: 'Operating system',
      BiosCardWrapper: 'BIOS',
      InfrastructureCardWrapper: 'Infrastructure',
      ConfigurationCardWrapper: 'Configuration',
      DataCollectorsCardWrapper: 'Data collectors',
    };

    Object.entries(mapping).map(([wrapper, title]) => {
      it(`should not render ${title}`, () => {
        const store = mockStore(initialState);
        render(
          <MemoryRouter initialEntries={['/example']}>
            <Provider store={store}>
              <GeneralInformation
                {...{ [wrapper]: false }}
                inventoryId={'test-id'}
              />
            </Provider>
          </MemoryRouter>
        );

        expect(
          screen.queryByRole('heading', {
            name: title,
          })
        ).not.toBeInTheDocument();
      });

      it(`should render custom ${title}`, () => {
        const store = mockStore(initialState);
        render(
          <MemoryRouter initialEntries={['/example']}>
            <Provider store={store}>
              <GeneralInformation
                {...{ [wrapper]: () => <div>test</div> }}
                inventoryId={'test-id'}
              />
            </Provider>
          </MemoryRouter>
        );

        expect(
          screen.queryByRole('heading', {
            name: title,
          })
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('API', () => {
    mock
      .onGet('/api/inventory/v1/hosts/test-id/system_profile')
      .reply(200, mockedData);

    it('should get data from server', () => {
      const store = mockStore({
        systemProfileStore: {},
        entityDetails: {
          entity: {
            id: 'test-id',
            per_reporter_staleness: {},
          },
        },
      });
      render(
        <MemoryRouter initialEntries={['/example']}>
          <Provider store={store}>
            <GeneralInformation inventoryId={'test-id'} />
          </Provider>
        </MemoryRouter>
      );

      expect(store.getActions()[0].type).toBe('LOAD_SYSTEM_PROFILE_PENDING');
    });

    it('should open modal with url', async () => {
      const store = mockStore(initialState);
      render(
        <MemoryRouter initialEntries={['/example/ipv4']}>
          <Provider store={store}>
            <GeneralInformation inventoryId={'test-id'} />
          </Provider>
        </MemoryRouter>
      );

      await waitFor(() => {
        screen.getByRole('dialog', {
          name: /ipv4 modal/i,
        });
      });
    });

    it('should open modal by click', async () => {
      const store = mockStore(initialState);
      render(
        <MemoryRouter initialEntries={['/example']}>
          <Provider store={store}>
            <GeneralInformation inventoryId={'test-id'} />
          </Provider>
        </MemoryRouter>
      );

      await userEvent.click(screen.getAllByText('2 addresses')[0]);
      await waitFor(() => {
        screen.getByRole('dialog', {
          name: /ipv4 modal/i,
        });
      });
    });
  });

  describe('conversion alert', () => {
    let state = {};

    beforeEach(() => {
      state = cloneDeep(initialState);
      state.entityDetails.entity.system_profile = {
        operating_system: {
          name: 'CentOS Linux',
          major: '7',
          minor: '9',
        },
      };
    });

    it('shows alert for CentOS system', () => {
      render(
        <TestWrapper store={mockStore(state)}>
          <GeneralInformation inventoryId={'test-id'} />
        </TestWrapper>
      );

      expect(
        screen.getByRole('heading', {
          name: /convert this centos system to rhel/i,
        })
      ).toBeVisible();
      expect(
        screen.getByRole('link', {
          name: /learn more about centos migration here\./i,
        })
      ).toHaveAttribute(
        'href',
        'https://www.redhat.com/en/technologies/linux-platforms/enterprise-linux/centos-migration'
      );
    });

    it('redirect to pre-conversion task', async () => {
      const navigate = jest.fn();
      useInsightsNavigate.mockReturnValue(navigate);
      render(
        <TestWrapper store={mockStore(state)}>
          <GeneralInformation inventoryId={'test-id'} />
        </TestWrapper>
      );

      await userEvent.click(
        screen.getByText(/run a pre-conversion analysis of this system/i)
      );

      await waitFor(() => {
        expect(navigate).toBeCalledWith(
          '/available/convert-to-rhel-preanalysis'
        );
      });
    });

    it('not shown for RHEL systems', () => {
      const store = mockStore(initialState);
      render(
        <TestWrapper store={store}>
          <GeneralInformation inventoryId={'test-id'} />
        </TestWrapper>
      );

      expect(
        screen.queryByRole('heading', {
          name: /convert this centos system to rhel/i,
        })
      ).not.toBeInTheDocument();
    });
  });
});
