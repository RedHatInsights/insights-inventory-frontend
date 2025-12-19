import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import promiseMiddleware from 'redux-promise-middleware';
import { collectInfoTest, testProperties } from '../../__mocks__/selectors';
import Overview from './Overview';

import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { cloneDeep } from 'lodash';
import { TestWrapper } from '../../Utilities/TestingUtilities';
import useInsightsNavigate from '@redhat-cloud-services/frontend-components-utilities/useInsightsNavigate';

jest.mock(
  '@redhat-cloud-services/frontend-components-utilities/RBACHook',
  () => ({
    esModule: true,
    usePermissionsWithContext: () => ({ hasAccess: true }),
  }),
);
jest.mock(
  '@redhat-cloud-services/frontend-components-utilities/useInsightsNavigate',
);

const expectCardsToExist = (
  titles = [
    'System status',
    'System properties',
    'Data collectors',
    'Subscriptions',
  ],
) => {
  titles.forEach((title) => {
    expect(screen.getByText(title)).toBeVisible();
  });
};

describe('Overview', () => {
  let initialState;
  let mockStore;
  let entity = {
    id: 'test-id',
    per_reporter_staleness: {},
    facts: {
      SYSPURPOSE_USAGE: 'Development',
      SYSPURPOSE_SLA: 'Self-Support',
      SYSPURPOSE_ROLE: 'Red Hat Enterprise Linux Server',
    },
  };

  beforeEach(() => {
    mockStore = configureStore([promiseMiddleware]);
    initialState = {
      systemProfileStore: {
        systemProfile: {
          loaded: true,
          ...collectInfoTest,
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
          <Overview entity={entity} inventoryId={'test-id'} />
        </Provider>
      </MemoryRouter>,
    );

    expectCardsToExist();
  });

  it('should render correctly', () => {
    const store = mockStore(initialState);
    const view = render(
      <MemoryRouter initialEntries={['/example']}>
        <Provider store={store}>
          <Overview entity={entity} inventoryId={'test-id'} />
        </Provider>
      </MemoryRouter>,
    );

    expectCardsToExist();
    expect(view.asFragment()).toMatchSnapshot();
  });

  describe('custom components', () => {
    const mapping = {
      SystemCardWrapper: 'System properties',
      SystemStatusCardWrapper: 'System status',
      DataCollectorsCardWrapper: 'Data collectors',
      SubscriptionCardWrapper: 'Subscriptions',
    };

    Object.entries(mapping).map(([wrapper, title]) => {
      it(`should not render ${title}`, () => {
        const store = mockStore(initialState);
        render(
          <MemoryRouter initialEntries={['/example']}>
            <Provider store={store}>
              <Overview {...{ [wrapper]: false }} inventoryId={'test-id'} />
            </Provider>
          </MemoryRouter>,
        );

        expect(screen.queryByText(title)).not.toBeInTheDocument();
      });

      it(`should render custom ${title}`, () => {
        const store = mockStore(initialState);
        render(
          <MemoryRouter initialEntries={['/example']}>
            <Provider store={store}>
              <Overview
                {...{ [wrapper]: () => <div>test</div> }}
                inventoryId={'test-id'}
              />
            </Provider>
          </MemoryRouter>,
        );

        expect(screen.queryByText(title)).not.toBeInTheDocument();
      });
    });
  });

  describe('API', () => {
    const entity = {
      id: 'test-id',
      per_reporter_staleness: {},
    };
    const fetchEntity = jest.fn();

    it('should get data from server', () => {
      const store = mockStore({
        systemProfileStore: {},
      });
      render(
        <MemoryRouter initialEntries={['/example']}>
          <Provider store={store}>
            <Overview
              entity={entity}
              inventoryId={'test-id'}
              fetchEntity={fetchEntity}
            />
          </Provider>
        </MemoryRouter>,
      );

      expect(fetchEntity).toHaveBeenCalledWith('test-id');
    });
  });

  describe('conversion alert', () => {
    let state = {};

    beforeEach(() => {
      state = cloneDeep(initialState);
      entity.system_profile = {
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
          <Overview entity={entity} inventoryId={'test-id'} />
        </TestWrapper>,
      );

      expect(
        screen.getByRole('heading', {
          name: /convert this centos system to rhel/i,
        }),
      ).toBeVisible();
      expect(
        screen.getByRole('link', {
          name: /learn more about centos migration here\./i,
        }),
      ).toHaveAttribute(
        'href',
        'https://www.redhat.com/en/technologies/linux-platforms/enterprise-linux/centos-migration',
      );
    });

    it('redirect to pre-conversion task', async () => {
      const navigate = jest.fn();
      useInsightsNavigate.mockReturnValue(navigate);
      render(
        <TestWrapper store={mockStore(state)}>
          <Overview entity={entity} inventoryId={'test-id'} />
        </TestWrapper>,
      );

      await userEvent.click(
        screen.getByText(/run a pre-conversion analysis of this system/i),
      );

      await waitFor(() => {
        expect(navigate).toHaveBeenCalledWith(
          '/available/convert-to-rhel-analysis',
        );
      });
    });

    it('not shown for RHEL systems', () => {
      const store = mockStore(initialState);
      entity.system_profile.operating_system.name = 'RHEL';
      render(
        <TestWrapper store={store}>
          <Overview entity={entity} inventoryId={'test-id'} />
        </TestWrapper>,
      );

      expect(
        screen.queryByRole('heading', {
          name: /convert this centos system to rhel/i,
        }),
      ).not.toBeInTheDocument();
    });
  });
});
