import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import promiseMiddleware from 'redux-promise-middleware';
import {
  biosTest,
  configTest,
  infraTest,
  osTest,
  testProperties,
} from '../../__mocks__/selectors';
import Details from './Details';

import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock(
  '@redhat-cloud-services/frontend-components-utilities/RBACHook',
  () => ({
    esModule: true,
    usePermissionsWithContext: () => ({ hasAccess: true }),
  }),
);

const expectCardsToExist = (
  titles = [
    'Hardware properties',
    'Operating system',
    'Network interfaces',
    'BIOS',
    'Configuration',
  ],
) => {
  titles.forEach((title) => {
    expect(screen.getByText(title)).toBeVisible();
  });
};

describe('Details', () => {
  let initialState;
  let mockStore;
  let entity = {
    id: 'test-id',
    per_reporter_staleness: {},
  };

  beforeEach(() => {
    mockStore = configureStore([promiseMiddleware]);
    initialState = {
      systemProfileStore: {
        systemProfile: {
          loaded: true,
          ...infraTest,
          ...osTest,
          ...biosTest,
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
          <Details entity={entity} inventoryId={'test-id'} />
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
          <Details entity={entity} inventoryId={'test-id'} />
        </Provider>
      </MemoryRouter>,
    );

    expectCardsToExist();
    expect(view.asFragment()).toMatchSnapshot();
  });

  describe('custom components', () => {
    const mapping = {
      OperatingSystemCardWrapper: 'Operating system',
      BiosCardWrapper: 'BIOS',
      NetworkInterfacesCardWrapper: 'Network interfaces',
      HardwarePropertiesCardWrapper: 'Hardware properties',
      ConfigurationCardWrapper: 'Configuration',
    };

    Object.entries(mapping).map(([wrapper, title]) => {
      it(`should not render ${title}`, () => {
        const store = mockStore(initialState);
        render(
          <MemoryRouter initialEntries={['/example']}>
            <Provider store={store}>
              <Details {...{ [wrapper]: false }} inventoryId={'test-id'} />
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
              <Details
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
            <Details
              entity={entity}
              inventoryId={'test-id'}
              fetchEntity={fetchEntity}
            />
          </Provider>
        </MemoryRouter>,
      );

      expect(fetchEntity).toHaveBeenCalledWith('test-id');
    });

    it('should open modal with url', async () => {
      const store = mockStore(initialState);
      render(
        <MemoryRouter initialEntries={['/example/ipv4']}>
          <Provider store={store}>
            <Details entity={entity} inventoryId={'test-id'} />
          </Provider>
        </MemoryRouter>,
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
            <Details entity={entity} inventoryId={'test-id'} />
          </Provider>
        </MemoryRouter>,
      );

      await userEvent.click(screen.getAllByText('2 addresses')[0]);
      await waitFor(() => {
        screen.getByRole('dialog', {
          name: /ipv4 modal/i,
        });
      });
    });
  });
});
